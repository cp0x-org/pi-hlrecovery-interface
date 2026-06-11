import type {
  BorrowLendUserStateResponse,
  ClearinghouseStateResponse,
  DelegationsResponse,
  DelegatorSummaryResponse,
  MetaResponse,
  PerpDexsResponse,
  SpotMetaResponse,
  UserAbstractionResponse,
  UserDexAbstractionResponse,
  UserVaultEquitiesResponse,
  WebData2Response,
} from "@nktkas/hyperliquid/api/info";
import {
  formatPrice,
  formatSize as formatOrderSize,
} from "@nktkas/hyperliquid/utils";
import { createHyperliquidInfoClient } from "@/lib/hyperliquid";
import {
  recoveryColumnTemplates,
  type CancelOrder,
  type RecoveryColumn,
  type RecoveryItem,
  type RecoveryMarketOrder,
} from "@/lib/recovery-board";

const MIN_SPOT_USD_VALUE = 10;
const PERP_MARKET_SLIPPAGE = 0.05;
const SPOT_MARKET_SLIPPAGE = 0.05;
const WITHDRAWAL_FEE_USDC = 1;
const MIN_VISIBLE_USDC_BALANCE = WITHDRAWAL_FEE_USDC;
const HYPE_TOKEN_DECIMALS = 8;

type WalletRecoveryResponse = {
  webData: WebData2Response;
  vaultEquities: UserVaultEquitiesResponse;
  borrowLendState: BorrowLendUserStateResponse;
  delegations: DelegationsResponse;
  delegatorSummary: DelegatorSummaryResponse;
  abstraction: UserAbstractionResponse;
  dexAbstraction: UserDexAbstractionResponse;
  dexCollateralTransfers: DexCollateralTransfer[];
  spotMeta: SpotMetaResponse;
};

type DexCollateralTransfer = {
  amount: string;
  amountValue: number;
  dexFullName: string;
  dexName: string;
  token: string;
  tokenName: string;
};

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function decimalUsdToMicros(value: string | number) {
  const rawValue = String(value).trim();

  if (!/^\d+(\.\d+)?$/.test(rawValue)) {
    return 0;
  }

  const [whole, fraction = ""] = rawValue.split(".");
  const micros =
    Number(whole) * 1_000_000 +
    Number(fraction.padEnd(6, "0").slice(0, 6) || "0");

  return Number.isSafeInteger(micros) ? micros : 0;
}

function decimalTokenToWei(
  value: string | number,
  decimals = HYPE_TOKEN_DECIMALS,
) {
  const rawValue = String(value).trim();

  if (!/^\d+(\.\d+)?$/.test(rawValue)) {
    return 0;
  }

  const [whole, fraction = ""] = rawValue.split(".");
  const multiplier = 10 ** decimals;
  const wei =
    Number(whole) * multiplier +
    Number(fraction.padEnd(decimals, "0").slice(0, decimals) || "0");

  return Number.isSafeInteger(wei) ? wei : 0;
}

function isPerpDex(
  dex: PerpDexsResponse[number],
): dex is NonNullable<PerpDexsResponse[number]> {
  return dex !== null;
}

function isDexCollateralTransfer(
  transfer: DexCollateralTransfer | null,
): transfer is DexCollateralTransfer {
  return transfer !== null;
}

function formatUsd(value: string | number) {
  const numberValue = typeof value === "number" ? value : toNumber(value);

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(numberValue);
}

function formatDisplaySize(value: string) {
  const numberValue = toNumber(value);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(Math.abs(numberValue));
}

function formatHype(value: string | number) {
  return `${formatDisplaySize(String(value))} HYPE`;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(timestamp));
}

function formatAddress(address: `0x${string}`) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function cloneTemplate(
  index: number,
  items: RecoveryItem[],
  total: string,
  extras?: Partial<RecoveryColumn>,
) {
  const template = recoveryColumnTemplates[index];

  return {
    ...template,
    ...extras,
    items,
    total,
  };
}

function summarizeCount(count: number, singular: string, plural = `${singular}s`) {
  if (count === 0) {
    return "";
  }

  return `${count} ${count === 1 ? singular : plural}`;
}

function buildAssetIdByCoin(
  webData: WebData2Response,
  spotMeta: SpotMetaResponse,
) {
  const assetIdByCoin = new Map<string, number>();

  webData.meta.universe.forEach((asset, index) => {
    assetIdByCoin.set(asset.name, index);
  });

  const tokenNameByIndex = new Map(
    spotMeta.tokens.map((token) => [token.index, token.name]),
  );

  for (const spotInfo of spotMeta.universe) {
    const assetId = 10_000 + spotInfo.index;
    const [baseTokenIndex, quoteTokenIndex] = spotInfo.tokens;
    const base = tokenNameByIndex.get(baseTokenIndex);
    const quote = tokenNameByIndex.get(quoteTokenIndex);

    assetIdByCoin.set(spotInfo.name, assetId);
    assetIdByCoin.set(`@${spotInfo.index}`, assetId);

    if (base && quote) {
      assetIdByCoin.set(`${base}/${quote}`, assetId);
    }
  }

  return assetIdByCoin;
}

function toOrderNumberString(value: number) {
  return value.toFixed(12).replace(/\.?0+$/, "") || "0";
}

function tokenDescriptorByIndex(
  spotMeta: SpotMetaResponse,
  tokenIndex: number,
) {
  const token = spotMeta.tokens.find(
    (spotToken) => spotToken.index === tokenIndex,
  );

  return token
    ? {
        token: `${token.name}:${token.tokenId}`,
        tokenName: token.name,
      }
    : null;
}

function buildDexCollateralTransfers({
  dexStates,
  spotMeta,
}: {
  dexStates: {
    dexFullName: string;
    dexName: string;
    meta: MetaResponse;
    state: ClearinghouseStateResponse;
  }[];
  spotMeta: SpotMetaResponse;
}): DexCollateralTransfer[] {
  return dexStates
    .map((dexState) => {
      const amountValue = toNumber(dexState.state.withdrawable);
      const token = tokenDescriptorByIndex(
        spotMeta,
        dexState.meta.collateralToken,
      );

      if (amountValue <= 0 || !token) {
        return null;
      }

      return {
        amount: dexState.state.withdrawable,
        amountValue,
        dexFullName: dexState.dexFullName,
        dexName: dexState.dexName,
        token: token.token,
        tokenName: token.tokenName,
      };
    })
    .filter(isDexCollateralTransfer);
}

async function fetchDexCollateralTransfers(
  user: `0x${string}`,
  spotMeta: SpotMetaResponse,
  signal?: AbortSignal,
) {
  const client = createHyperliquidInfoClient();
  const perpDexs = (await client.perpDexs(signal)).filter(isPerpDex);
  const dexStates = await Promise.all(
    perpDexs.map(async (dex) => {
      const [meta, state] = await Promise.all([
        client.meta({ dex: dex.name }, signal),
        client.clearinghouseState({ dex: dex.name, user }, signal),
      ]);

      return {
        dexFullName: dex.fullName,
        dexName: dex.name,
        meta,
        state,
      };
    }),
  );

  return buildDexCollateralTransfers({ dexStates, spotMeta });
}

function buildMarketOrder({
  assetId,
  isBuy,
  marketType,
  markPrice,
  reduceOnly,
  size,
  slippage,
  szDecimals,
}: {
  assetId: number;
  isBuy: boolean;
  marketType: "perp" | "spot";
  markPrice: number;
  reduceOnly: boolean;
  size: number;
  slippage: number;
  szDecimals: number;
}): RecoveryMarketOrder | null {
  if (markPrice <= 0 || size <= 0) {
    return null;
  }

  const price = markPrice * (isBuy ? 1 + slippage : 1 - slippage);

  if (price <= 0) {
    return null;
  }

  try {
    return {
      a: assetId,
      b: isBuy,
      p: formatPrice(toOrderNumberString(price), szDecimals, marketType),
      r: reduceOnly,
      s: formatOrderSize(toOrderNumberString(size), szDecimals),
      t: { limit: { tif: "FrontendMarket" } },
    };
  } catch {
    return null;
  }
}

function buildOrderItems(
  webData: WebData2Response,
  spotMeta: SpotMetaResponse,
): { items: RecoveryItem[]; cancels: CancelOrder[] } {
  const assetIdByCoin = buildAssetIdByCoin(webData, spotMeta);
  const cancels: CancelOrder[] = [];

  return webData.openOrders.map((order) => ({
    detail: `${order.orderType} ${order.side === "B" ? "buy" : "sell"} at ${order.limitPx}`,
    id: `order-${order.coin}-${order.oid}`,
    name: order.coin,
    value: `${formatDisplaySize(order.sz)} open`,
  })).reduce(
    (result, item, index) => {
      const order = webData.openOrders[index];
      const assetId = assetIdByCoin.get(order.coin);

      result.items.push(item);

      if (assetId !== undefined) {
        result.cancels.push({ a: assetId, o: order.oid });
      }

      return result;
    },
    { cancels, items: [] as RecoveryItem[] },
  );
}

function buildPositionItems(
  webData: WebData2Response,
): { items: RecoveryItem[]; orders: RecoveryMarketOrder[] } {
  const orders: RecoveryMarketOrder[] = [];

  const items = webData.clearinghouseState.assetPositions
    .filter(({ position }) => toNumber(position.szi) !== 0)
    .map(({ position }) => {
      const assetId = webData.meta.universe.findIndex(
        (asset) => asset.name === position.coin,
      );
      const assetMeta = webData.meta.universe[assetId];
      const assetCtx = webData.assetCtxs[assetId];
      const positionSize = toNumber(position.szi);
      const isLong = positionSize > 0;
      const order =
        assetId >= 0 && assetMeta && assetCtx
          ? buildMarketOrder({
              assetId,
              isBuy: !isLong,
              marketType: "perp",
              markPrice: toNumber(
                assetCtx.markPx || assetCtx.midPx || assetCtx.oraclePx,
              ),
              reduceOnly: true,
              size: Math.abs(positionSize),
              slippage: PERP_MARKET_SLIPPAGE,
              szDecimals: assetMeta.szDecimals,
            })
          : null;

      if (order) {
        orders.push(order);
      }

      return {
        detail: `${isLong ? "Long" : "Short"} ${formatDisplaySize(position.szi)} | PnL ${formatUsd(position.unrealizedPnl)}${order ? "" : " | close unavailable"}`,
        id: `position-${position.coin}`,
        name: position.coin,
        value: formatUsd(position.positionValue),
      };
    });

  return { items, orders };
}

function findUsdcSpotMarket(
  spotMeta: SpotMetaResponse,
  tokenIndex: number,
) {
  const token = spotMeta.tokens.find(
    (spotToken) => spotToken.index === tokenIndex,
  );
  const usdcToken = spotMeta.tokens.find(
    (spotToken) => spotToken.name === "USDC",
  );

  if (!token || !usdcToken) {
    return null;
  }

  const market = spotMeta.universe.find(
    (spotInfo) =>
      spotInfo.tokens[0] === tokenIndex &&
      spotInfo.tokens[1] === usdcToken.index,
  );

  if (!market) {
    return null;
  }

  return {
    assetId: 10_000 + market.index,
    market,
    szDecimals: token.szDecimals,
  };
}

function findSpotMarkPrice(
  webData: WebData2Response,
  coin: string,
  market: NonNullable<ReturnType<typeof findUsdcSpotMarket>>["market"],
) {
  const assetCtx =
    webData.spotAssetCtxs.find(
      (spotCtx) =>
        spotCtx.coin === coin ||
        spotCtx.coin === market.name ||
        spotCtx.coin === `@${market.index}`,
    ) ?? webData.spotAssetCtxs[market.index];

  return toNumber(assetCtx?.markPx || assetCtx?.midPx || assetCtx?.prevDayPx);
}

function buildSpotItems(
  webData: WebData2Response,
  spotMeta: SpotMetaResponse,
): RecoveryItem[] {
  return (webData.spotState?.balances ?? [])
    .filter((balance) => balance.coin !== "USDC")
    .map((balance) => {
      const spotMarket = findUsdcSpotMarket(spotMeta, balance.token);
      const markPrice = spotMarket
        ? findSpotMarkPrice(webData, balance.coin, spotMarket.market)
        : 0;
      const availableBalance = Math.max(
        toNumber(balance.total) - toNumber(balance.hold),
        0,
      );
      const usdValue = toNumber(balance.total) * markPrice;
      const order =
        spotMarket && availableBalance > 0
          ? buildMarketOrder({
              assetId: spotMarket.assetId,
              isBuy: false,
              marketType: "spot",
              markPrice,
              reduceOnly: false,
              size: availableBalance,
              slippage: SPOT_MARKET_SLIPPAGE,
              szDecimals: spotMarket.szDecimals,
            })
          : null;
      const unavailableDetail = !spotMarket
        ? " | no USDC market"
        : availableBalance <= 0
          ? " | balance on hold"
          : order
            ? ""
            : " | sell unavailable";

      return {
        action: "Sell",
        actionData: order && spotMarket
          ? {
              assetId: spotMarket.assetId,
              coin: balance.coin,
              order,
              type: "sellSpotAsset" as const,
            }
          : undefined,
        detail: `${formatDisplaySize(balance.total)} ${balance.coin}${toNumber(balance.hold) > 0 ? ` | ${formatDisplaySize(balance.hold)} on hold` : ""}${unavailableDetail}`,
        disabled: !order,
        id: `spot-${balance.coin}-${balance.token}`,
        name: balance.coin,
        value: formatUsd(usdValue),
      };
    })
    .filter(
      (item) => toNumber(item.value.replace(/[$,]/g, "")) >= MIN_SPOT_USD_VALUE,
    );
}

function buildVaultItems(
  webData: WebData2Response,
  vaultEquities: UserVaultEquitiesResponse,
): RecoveryItem[] {
  const vaultNameByAddress = new Map(
    webData.leadingVaults.map((vault) => [vault.address, vault.name]),
  );
  const now = Date.now();

  return vaultEquities
    .filter((vault) => toNumber(vault.equity) > 0)
    .map((vault) => {
      const locked = vault.lockedUntilTimestamp > now;
      const vaultName =
        vaultNameByAddress.get(vault.vaultAddress) ??
        `${vault.vaultAddress.slice(0, 6)}...${vault.vaultAddress.slice(-4)}`;
      // Subtract 1 micro to guard against the API rounding equity up (on-chain uses floor).
      const withdrawUsd = Math.max(0, decimalUsdToMicros(vault.equity) - 1);
      const canWithdraw = !locked && withdrawUsd > 0;

      return {
        action: locked ? "Locked" : "Withdraw",
        actionData: canWithdraw
          ? {
              type: "withdrawVault" as const,
              usd: withdrawUsd,
              vaultAddress: vault.vaultAddress,
              vaultName,
            }
          : undefined,
        detail: locked
          ? `Unlocks ${formatDate(vault.lockedUntilTimestamp)}`
          : canWithdraw
            ? "Withdrawal is available."
            : "Withdrawal amount is too small.",
        disabled: !canWithdraw,
        id: `vault-${vault.vaultAddress}`,
        name: vaultName,
        value: formatUsd(vault.equity),
      };
    });
}

function buildPortfolioMarginItems(
  ownerAddress: `0x${string}`,
  webData: WebData2Response,
  borrowLendState: BorrowLendUserStateResponse,
  spotMeta: SpotMetaResponse,
  abstraction: UserAbstractionResponse,
): RecoveryItem[] {
  const tokenNameById = new Map(
    spotMeta.tokens.map((token) => [token.index, token.name]),
  );
  const availableBalanceByToken = new Map(
    (webData.spotState?.balances ?? []).map((balance) => [
      balance.token,
      Math.max(toNumber(balance.total) - toNumber(balance.hold), 0),
    ]),
  );
  const items: RecoveryItem[] = [];

  for (const [tokenId, state] of borrowLendState.tokenToState) {
    const tokenName = tokenNameById.get(tokenId) ?? `Token ${tokenId}`;
    const borrowed = toNumber(state.borrow.value);
    const borrowedBasis = toNumber(state.borrow.basis);
    const availableBalance = availableBalanceByToken.get(tokenId) ?? 0;
    const canRepay =
      borrowedBasis > 0 && availableBalance + Number.EPSILON >= borrowedBasis;
    const supplied = toNumber(state.supply.value);

    if (borrowed > 0) {
      items.push({
        action: canRepay ? "Repay" : `Needs ${tokenName}`,
        actionData: canRepay
          ? {
              amount: null,
              operation: "repay",
              token: tokenId,
              tokenName,
              type: "portfolioBorrowLend" as const,
            }
          : undefined,
        detail: `Borrow basis ${formatDisplaySize(state.borrow.basis)} ${tokenName} | Available ${formatDisplaySize(String(availableBalance))}`,
        disabled: !canRepay,
        id: `borrow-${tokenId}`,
        name: `Borrowed ${tokenName}`,
        value: formatUsd(borrowed),
      });
    }

    if (supplied > 0) {
      items.push({
        action: "Withdraw",
        actionData: {
          amount: null,
          operation: "withdraw",
          token: tokenId,
          tokenName,
          type: "portfolioBorrowLend",
        },
        detail: `Supply basis ${formatDisplaySize(state.supply.basis)} ${tokenName}`,
        id: `supply-${tokenId}`,
        name: `Supplied ${tokenName}`,
        value: formatUsd(supplied),
      });
    }
  }

  if (abstraction === "portfolioMargin") {
    const canDisable = items.length === 0;

    items.push({
      action: canDisable ? "Disable" : "Locked",
      actionData: canDisable
        ? {
            enabled: false,
            type: "setPortfolioMargin",
            user: ownerAddress,
          }
        : undefined,
      detail:
        canDisable
          ? "Portfolio margin mode can be disabled."
          : "Clear borrows and supplied assets first.",
      disabled: !canDisable,
      id: "portfolio-margin-mode",
      name: "Portfolio margin mode",
      value: "Enabled",
    });
  }

  return items;
}

function buildStakingItems(
  delegatorSummary: DelegatorSummaryResponse,
  delegations: DelegationsResponse,
): RecoveryItem[] {
  const items: RecoveryItem[] = [];
  const now = Date.now();
  const undelegated = toNumber(delegatorSummary.undelegated);
  const pendingWithdrawal = toNumber(delegatorSummary.totalPendingWithdrawal);

  for (const delegation of delegations) {
    const amount = toNumber(delegation.amount);
    const wei = decimalTokenToWei(delegation.amount);
    const locked = delegation.lockedUntilTimestamp > now;
    const canUndelegate = !locked && wei > 0;

    if (amount <= 0) {
      continue;
    }

    items.push({
      action: locked ? "Locked" : "Undelegate",
      actionData: canUndelegate
        ? {
            amount: delegation.amount,
            type: "undelegateStake",
            validator: delegation.validator,
            wei,
          }
        : undefined,
      detail: locked
        ? `Validator ${formatAddress(delegation.validator)} unlocks ${formatDate(delegation.lockedUntilTimestamp)}.`
        : `Undelegate from validator ${formatAddress(delegation.validator)} before withdrawing to spot.`,
      disabled: !canUndelegate,
      id: `stake-delegated-${delegation.validator}`,
      name: "Delegated HYPE",
      value: formatHype(delegation.amount),
    });
  }

  if (undelegated > 0) {
    const wei = decimalTokenToWei(delegatorSummary.undelegated);
    const canWithdraw = wei > 0;

    items.push({
      action: "Withdraw",
      actionData: canWithdraw
        ? {
            amount: delegatorSummary.undelegated,
            type: "withdrawStaking",
            wei,
          }
        : undefined,
      detail:
        "Move undelegated HYPE from staking to spot. Hyperliquid staking withdrawals enter a 7 day queue.",
      disabled: !canWithdraw,
      id: "stake-undelegated",
      name: "Undelegated HYPE",
      value: formatHype(delegatorSummary.undelegated),
    });
  }

  if (pendingWithdrawal > 0) {
    items.push({
      action: "Pending",
      detail: `${delegatorSummary.nPendingWithdrawals} staking withdrawal${delegatorSummary.nPendingWithdrawals === 1 ? "" : "s"} waiting for the 7 day queue.`,
      disabled: true,
      id: "stake-pending-withdrawal",
      name: "Pending staking withdrawal",
      value: formatHype(delegatorSummary.totalPendingWithdrawal),
    });
  }

  return items;
}

function buildUsdcItems(
  webData: WebData2Response,
  abstraction: UserAbstractionResponse,
  dexAbstraction: UserDexAbstractionResponse,
  dexCollateralTransfers: DexCollateralTransfer[],
): RecoveryItem[] {
  const items: RecoveryItem[] = [];
  const perpWithdrawable = toNumber(webData.clearinghouseState.withdrawable);
  const spotUsdc = webData.spotState?.balances.find(
    (balance) => balance.coin === "USDC",
  );
  const spotUsdcAvailable = spotUsdc
    ? Math.max(toNumber(spotUsdc.total) - toNumber(spotUsdc.hold), 0)
    : 0;
  const canWithdrawDirectly =
    abstraction === "unifiedAccount" || abstraction === "portfolioMargin";
  const withdrawable = canWithdrawDirectly
    ? spotUsdcAvailable
    : perpWithdrawable;
  const netWithdrawable = Math.max(withdrawable - WITHDRAWAL_FEE_USDC, 0);
  const withdrawAmount = toOrderNumberString(netWithdrawable);

  if (dexAbstraction || abstraction === "dexAbstraction") {
    for (const transfer of dexCollateralTransfers) {
      const transferToSpot = transfer.tokenName !== "USDC";

      if (!transferToSpot && transfer.amountValue <= MIN_VISIBLE_USDC_BALANCE) {
        continue;
      }

      items.push({
        action: "Move",
        actionData: {
          amount: transfer.amount,
          destination: webData.user,
          destinationDex: transferToSpot ? "spot" : "",
          dexName: transfer.dexName,
          sourceDex: transfer.dexName,
          token: transfer.token,
          type: "transferDexCollateral",
        },
        detail: `DEX abstraction: move from ${transfer.dexFullName} to ${transferToSpot ? "spot" : "main perps"}.`,
        id: `dex-collateral-${transfer.dexName}-${transfer.token}`,
        name: `${transfer.dexName} collateral`,
        value:
          transfer.tokenName === "USDC"
            ? formatUsd(transfer.amountValue)
            : `${formatDisplaySize(transfer.amount)} ${transfer.tokenName}`,
      });
    }
  }

  if (
    !canWithdrawDirectly &&
    spotUsdc &&
    toNumber(spotUsdc.total) > MIN_VISIBLE_USDC_BALANCE
  ) {
    const canTransfer = spotUsdcAvailable > 0;

    items.push({
      action: "Move to perps",
      actionData: canTransfer
        ? {
            amount: toOrderNumberString(spotUsdcAvailable),
            type: "transferSpotUsdc",
          }
        : undefined,
      detail: canTransfer
        ? "Standard mode: spot USDC must move to perps before Arbitrum withdrawal."
        : "Spot USDC is currently on hold.",
      disabled: !canTransfer,
      id: "usdc-spot-wallet",
      name: "Spot wallet",
      value: formatUsd(spotUsdc.total),
    });
  }

  if (withdrawable > MIN_VISIBLE_USDC_BALANCE) {
    items.push({
      action: "Withdraw",
      actionData: {
        amount: withdrawAmount,
        destination: webData.user,
        type: "withdrawUsdc",
      },
      detail: `${canWithdrawDirectly ? "Unified account" : "Perps wallet"} USDC can be withdrawn to Arbitrum. Hyperliquid charges a ${formatUsd(WITHDRAWAL_FEE_USDC)} withdrawal fee, so this signs ${formatUsd(netWithdrawable)}.`,
      id: canWithdrawDirectly ? "usdc-unified-wallet" : "usdc-perps-wallet",
      name: canWithdrawDirectly ? "Unified account" : "Perps wallet",
      value: formatUsd(withdrawable),
    });
  }

  return items;
}

function sumItemUsdValues(items: RecoveryItem[]) {
  return items.reduce(
    (sum, item) => sum + toNumber(item.value.replace(/[$,]/g, "")),
    0,
  );
}

function mapRecoveryColumns(response: WalletRecoveryResponse): RecoveryColumn[] {
  const orders = buildOrderItems(response.webData, response.spotMeta);
  const positions = buildPositionItems(response.webData);
  const spot = buildSpotItems(response.webData, response.spotMeta);
  const vaults = buildVaultItems(response.webData, response.vaultEquities);
  const portfolioMargin = buildPortfolioMarginItems(
    response.webData.user,
    response.webData,
    response.borrowLendState,
    response.spotMeta,
    response.abstraction,
  );
  const staking = buildStakingItems(
    response.delegatorSummary,
    response.delegations,
  );
  const usdc = buildUsdcItems(
    response.webData,
    response.abstraction,
    response.dexAbstraction,
    response.dexCollateralTransfers,
  );

  return [
    cloneTemplate(0, orders.items, summarizeCount(orders.items.length, "order"), {
      groupActionData: orders.cancels.length
        ? { type: "cancelOrders", cancels: orders.cancels }
        : undefined,
      groupActionDisabled: orders.cancels.length !== orders.items.length,
    }),
    cloneTemplate(
      1,
      positions.items,
      summarizeCount(positions.items.length, "position"),
      {
        groupActionData: positions.orders.length
          ? { orders: positions.orders, type: "closePositions" }
          : undefined,
        groupActionDisabled: positions.orders.length !== positions.items.length,
      },
    ),
    cloneTemplate(2, staking, summarizeCount(staking.length, "item")),
    cloneTemplate(
      3,
      spot,
      spot.length ? formatUsd(sumItemUsdValues(spot)) : "",
    ),
    cloneTemplate(
      4,
      vaults,
      vaults.length ? formatUsd(sumItemUsdValues(vaults)) : "",
    ),
    cloneTemplate(
      5,
      portfolioMargin,
      summarizeCount(portfolioMargin.length, "item"),
    ),
    cloneTemplate(6, usdc, usdc.length ? formatUsd(sumItemUsdValues(usdc)) : ""),
  ];
}

export async function fetchWalletRecovery(
  user: `0x${string}`,
  signal?: AbortSignal,
) {
  const client = createHyperliquidInfoClient();

  const [
    webData,
    vaultEquities,
    borrowLendState,
    delegatorSummary,
    delegations,
    abstraction,
    dexAbstraction,
    spotMeta,
  ] = await Promise.all([
    client.webData2({ user }, signal),
    client.userVaultEquities({ user }, signal),
    client.borrowLendUserState({ user }, signal),
    client.delegatorSummary({ user }, signal),
    client.delegations({ user }, signal),
    client.userAbstraction({ user }, signal),
    client.userDexAbstraction({ user }, signal),
    client.spotMeta(signal),
  ]);
  const dexCollateralTransfers =
    abstraction === "dexAbstraction" || dexAbstraction
      ? await fetchDexCollateralTransfers(user, spotMeta, signal)
      : [];

  return mapRecoveryColumns({
    abstraction,
    borrowLendState,
    delegations,
    delegatorSummary,
    dexAbstraction,
    dexCollateralTransfers,
    spotMeta,
    vaultEquities,
    webData,
  });
}
