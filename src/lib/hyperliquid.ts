import { ExchangeClient, HttpTransport, InfoClient } from "@nktkas/hyperliquid";
import type { AbstractWallet } from "@nktkas/hyperliquid/signing";
import type {
  PortfolioBorrowLendOperation,
  RecoveryMarketOrder,
} from "@/lib/recovery-board";

export type HyperliquidAgentApproval = {
  address: `0x${string}`;
  name: string;
  validUntil: number;
};

export function createHyperliquidInfoClient() {
  return new InfoClient({ transport: new HttpTransport() });
}

export function createHyperliquidExchangeClient(wallet: AbstractWallet) {
  return new ExchangeClient({
    transport: new HttpTransport(),
    wallet,
  });
}

export async function approveHyperliquidAgent(
  wallet: AbstractWallet,
  agentAddress: `0x${string}`,
  agentName: string,
) {
  const exchange = createHyperliquidExchangeClient(wallet);

  return exchange.approveAgent({ agentAddress, agentName });
}

export async function fetchHyperliquidAgentApproval(
  ownerAddress: `0x${string}`,
  agentAddress: `0x${string}`,
): Promise<HyperliquidAgentApproval | null> {
  const info = createHyperliquidInfoClient();
  const agents = await info.extraAgents({ user: ownerAddress });
  const normalizedAgentAddress = agentAddress.toLowerCase();

  return (
    agents.find(
      (agent) =>
        agent.address.toLowerCase() === normalizedAgentAddress &&
        agent.validUntil > Date.now(),
    ) ?? null
  );
}

export async function cancelHyperliquidOrders(
  wallet: AbstractWallet,
  cancels: { a: number; o: number }[],
) {
  const exchange = createHyperliquidExchangeClient(wallet);

  return exchange.cancel({ cancels });
}

export async function placeHyperliquidMarketOrders(
  wallet: AbstractWallet,
  orders: RecoveryMarketOrder[],
) {
  const exchange = createHyperliquidExchangeClient(wallet);

  return exchange.order({
    grouping: "na",
    orders,
  });
}

export async function withdrawHyperliquidVault(
  wallet: AbstractWallet,
  vaultAddress: `0x${string}`,
  usd: number,
) {
  const exchange = createHyperliquidExchangeClient(wallet);

  return exchange.vaultTransfer({
    isDeposit: false,
    usd,
    vaultAddress,
  });
}

export async function updateHyperliquidBorrowLend(
  wallet: AbstractWallet,
  params: {
    amount: string | null;
    operation: PortfolioBorrowLendOperation;
    token: number;
  },
) {
  const exchange = createHyperliquidExchangeClient(wallet);

  return exchange.borrowLend(params);
}

export async function setHyperliquidPortfolioMargin(
  wallet: AbstractWallet,
  user: `0x${string}`,
  enabled: boolean,
) {
  const exchange = createHyperliquidExchangeClient(wallet);

  return exchange.userPortfolioMargin({
    enabled,
    user,
  });
}

export async function undelegateHyperliquidStake(
  wallet: AbstractWallet,
  validator: `0x${string}`,
  wei: number,
) {
  const exchange = createHyperliquidExchangeClient(wallet);

  return exchange.tokenDelegate({
    isUndelegate: true,
    validator,
    wei,
  });
}

export async function withdrawHyperliquidStaking(
  wallet: AbstractWallet,
  wei: number,
) {
  const exchange = createHyperliquidExchangeClient(wallet);

  return exchange.cWithdraw({ wei });
}

export async function withdrawHyperliquidUsdc(
  wallet: AbstractWallet,
  destination: `0x${string}`,
  amount: string,
) {
  const exchange = createHyperliquidExchangeClient(wallet);

  return exchange.withdraw3({
    amount,
    destination,
  });
}

export async function transferHyperliquidSpotUsdcToPerps(
  wallet: AbstractWallet,
  amount: string,
) {
  const exchange = createHyperliquidExchangeClient(wallet);

  return exchange.usdClassTransfer({
    amount,
    toPerp: true,
  });
}

export async function transferHyperliquidDexCollateral(
  wallet: AbstractWallet,
  params: {
    amount: string;
    destination: `0x${string}`;
    destinationDex: string;
    sourceDex: string;
    token: string;
  },
) {
  const exchange = createHyperliquidExchangeClient(wallet);

  return exchange.sendAsset({
    ...params,
    fromSubAccount: "",
  });
}
