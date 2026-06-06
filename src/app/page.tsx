"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaXTwitter } from "react-icons/fa6";
import { isAddress } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { arbitrum } from "wagmi/chains";
import { RecoveryKanban } from "@/components/recovery-kanban";
import { useToasts } from "@/components/toasts";
import {
  cancelHyperliquidOrders,
  placeHyperliquidMarketOrders,
  setHyperliquidPortfolioMargin,
  transferHyperliquidDexCollateral,
  transferHyperliquidSpotUsdcToPerps,
  undelegateHyperliquidStake,
  updateHyperliquidBorrowLend,
  withdrawHyperliquidVault,
  withdrawHyperliquidUsdc,
  withdrawHyperliquidStaking,
} from "@/lib/hyperliquid";
import { createHyperliquidWallet } from "@/lib/hyperliquid-wallet";
import {
  recoveryColumnTemplates,
  type RecoveryAction,
} from "@/lib/recovery-board";
import { ensureApprovedSessionAgent } from "@/lib/session-agent";
import { fetchWalletRecovery } from "@/lib/wallet-recovery";

const POST_ACTION_REFETCH_DELAYS_MS = [
  500, 1_500, 3_000, 5_000, 8_000, 13_000, 21_000, 34_000, 55_000,
];

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function normalizeAddress(address: string | undefined) {
  return address?.toLowerCase() ?? "";
}

function formatErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unknown error.";
  }

  if (error.cause) {
    return `${error.message}: ${formatErrorMessage(error.cause)}`;
  }

  return error.message;
}

function getActionPendingLabel(action: RecoveryAction) {
  switch (action.type) {
    case "cancelOrders":
      return "Cancelling...";
    case "closePositions":
      return "Closing...";
    case "sellSpotAsset":
      return "Selling...";
    case "withdrawVault":
      return "Withdrawing...";
    case "portfolioBorrowLend":
      return action.operation === "repay" ? "Repaying..." : "Withdrawing...";
    case "setPortfolioMargin":
      return action.enabled ? "Enabling..." : "Disabling...";
    case "undelegateStake":
      return "Undelegating...";
    case "transferDexCollateral":
    case "transferSpotUsdc":
      return "Transferring...";
    case "withdrawStaking":
    case "withdrawUsdc":
      return "Withdrawing...";
  }
}

function getActionSettlingLabel(action: RecoveryAction) {
  switch (action.type) {
    case "cancelOrders":
    case "closePositions":
    case "sellSpotAsset":
    case "transferDexCollateral":
    case "transferSpotUsdc":
    case "undelegateStake":
    case "withdrawStaking":
    case "withdrawUsdc":
      return "Rechecking...";
    case "portfolioBorrowLend":
    case "setPortfolioMargin":
    case "withdrawVault":
      return "Confirming...";
  }
}

function getActionErrorTitle(action: RecoveryAction | undefined) {
  switch (action?.type) {
    case "closePositions":
      return "Close failed";
    case "sellSpotAsset":
      return "Sell failed";
    case "withdrawVault":
      return "Vault withdrawal failed";
    case "portfolioBorrowLend":
      return action.operation === "repay" ? "Repay failed" : "Withdraw failed";
    case "setPortfolioMargin":
      return "Portfolio margin update failed";
    case "undelegateStake":
      return "Undelegate failed";
    case "transferDexCollateral":
      return "DEX transfer failed";
    case "transferSpotUsdc":
      return "Spot USDC transfer failed";
    case "withdrawStaking":
      return "Staking withdrawal failed";
    case "withdrawUsdc":
      return "USDC withdrawal failed";
    case "cancelOrders":
    default:
      return "Cancel failed";
  }
}

function getActionSuccessToast(action: RecoveryAction) {
  switch (action.type) {
    case "cancelOrders":
      return {
        message: "Hyperliquid accepted the cancel request.",
        title: "Orders cancelled",
      };
    case "closePositions":
      return {
        message: "Reduce-only market close orders were submitted.",
        title: "Position closes submitted",
      };
    case "sellSpotAsset":
      return {
        message: `A market sell order for ${action.coin} was submitted.`,
        title: "Spot sell submitted",
      };
    case "withdrawVault":
      return {
        message: `${action.vaultName} withdrawal was submitted.`,
        title: "Vault withdrawal submitted",
      };
    case "portfolioBorrowLend":
      return action.operation === "repay"
        ? {
            message: `Full ${action.tokenName} borrow repayment was submitted.`,
            title: "Repay submitted",
          }
        : {
            message: `Full ${action.tokenName} supply withdrawal was submitted.`,
            title: "Supply withdrawal submitted",
          };
    case "setPortfolioMargin":
      return {
        message: action.enabled
          ? "Portfolio margin enable request was submitted."
          : "Portfolio margin disable request was submitted.",
        title: action.enabled
          ? "Portfolio margin enabled"
          : "Portfolio margin disabled",
      };
    case "undelegateStake":
      return {
        message: `Undelegation for ${action.amount} HYPE was submitted. We'll re-scan while it settles.`,
        title: "Undelegate submitted",
      };
    case "transferDexCollateral":
      return {
        message: `${action.dexName} collateral transfer was submitted. We'll re-scan while it settles.`,
        title: "DEX transfer submitted",
      };
    case "transferSpotUsdc":
      return {
        message: "Spot USDC transfer was submitted. We'll re-scan while it settles.",
        title: "Spot USDC transfer submitted",
      };
    case "withdrawStaking":
      return {
        message: `Staking withdrawal for ${action.amount} HYPE was submitted. It enters Hyperliquid's unstaking queue.`,
        title: "Staking withdrawal submitted",
      };
    case "withdrawUsdc":
      return {
        message: "Arbitrum withdrawal request was submitted.",
        title: "USDC withdrawal submitted",
      };
  }
}

function isSameRecoveryAction(
  first: RecoveryAction | undefined,
  second: RecoveryAction | undefined,
) {
  if (!first || !second || first.type !== second.type) {
    return false;
  }

  if (first.type === "sellSpotAsset" && second.type === "sellSpotAsset") {
    return first.assetId === second.assetId;
  }

  if (first.type === "withdrawVault" && second.type === "withdrawVault") {
    return (
      first.vaultAddress.toLowerCase() === second.vaultAddress.toLowerCase()
    );
  }

  if (
    first.type === "portfolioBorrowLend" &&
    second.type === "portfolioBorrowLend"
  ) {
    return first.operation === second.operation && first.token === second.token;
  }

  if (
    first.type === "setPortfolioMargin" &&
    second.type === "setPortfolioMargin"
  ) {
    return (
      first.enabled === second.enabled &&
      first.user.toLowerCase() === second.user.toLowerCase()
    );
  }

  if (
    first.type === "transferDexCollateral" &&
    second.type === "transferDexCollateral"
  ) {
    return first.sourceDex === second.sourceDex && first.token === second.token;
  }

  if (first.type === "withdrawUsdc" && second.type === "withdrawUsdc") {
    return first.destination.toLowerCase() === second.destination.toLowerCase();
  }

  if (first.type === "undelegateStake" && second.type === "undelegateStake") {
    return first.validator.toLowerCase() === second.validator.toLowerCase();
  }

  return true;
}

function HlLogo() {
  return (
    <svg
      width="32"
      height="26"
      viewBox="0 0 1 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hyperliquid"
      style={{ transform: "translateY(2px)" }}
    >
      <g clipPath="url(#hl-clip)">
        <path d="M20.4523 14.5389C20.471 16.2176 20.1196 17.8218 19.4292 19.3544C18.4434 21.5368 16.0799 23.3213 13.9218 21.4218C12.1616 19.8736 11.8351 16.7306 9.19798 16.2705C5.7088 15.8477 5.62483 19.8923 3.34536 20.3492C0.804661 20.8653 -0.0380915 16.5938 -0.000774032 14.6539C0.0365434 12.714 0.552769 9.98759 2.76072 9.98759C5.30142 9.98759 5.47245 13.8332 8.69731 13.6249C11.8911 13.4073 11.947 9.40624 14.0337 7.69329C15.8343 6.2135 17.952 7.29847 19.0125 9.07982C19.9952 10.7275 20.4274 12.6612 20.4492 14.5389H20.4523Z" fill="#28e5e5" />
      </g>
    </svg>
  );
}

function Cp0xLogo() {
  return (
    <svg
      width="63"
      height="26"
      viewBox="0 0 63 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="cp0x"
    >
      <path
        d="M6.61563 18.4589C7.05716 18.4589 7.48545 18.3882 7.90048 18.2469C8.32435 18.1057 8.69965 17.9114 9.02639 17.6641C9.35312 17.408 9.61362 17.1122 9.8079 16.7766C10.011 16.4323 10.117 16.0614 10.1258 15.664H12.4438C12.435 16.2998 12.2672 16.9091 11.9405 17.4919C11.6226 18.0659 11.1943 18.5737 10.6556 19.0152C10.117 19.4479 9.49883 19.7967 8.80121 20.0616C8.10359 20.3177 7.37506 20.4458 6.61563 20.4458C5.52946 20.4458 4.58017 20.2515 3.76775 19.863C2.95534 19.4744 2.27538 18.9534 1.72788 18.2999C1.18921 17.6376 0.783006 16.8782 0.509257 16.0216C0.235507 15.1562 0.0986328 14.2467 0.0986328 13.293V12.7366C0.0986328 11.7918 0.235507 10.8866 0.509257 10.0212C0.783006 9.15582 1.18921 8.39639 1.72788 7.74293C2.27538 7.08063 2.95534 6.55521 3.76775 6.16666C4.58017 5.77811 5.52946 5.58384 6.61563 5.58384C7.46337 5.58384 8.24046 5.72071 8.94691 5.99446C9.66219 6.25938 10.2759 6.62585 10.7881 7.09388C11.3091 7.55307 11.7153 8.10057 12.0067 8.73637C12.2981 9.37217 12.4438 10.0521 12.4438 10.7762H10.1258C10.117 10.3435 10.0198 9.93733 9.83439 9.55762C9.65778 9.16907 9.41494 8.82909 9.10586 8.53768C8.79679 8.24627 8.42591 8.01667 7.99321 7.84889C7.56934 7.68111 7.11014 7.59722 6.61563 7.59722C5.8562 7.59722 5.21598 7.75176 4.69497 8.06083C4.18279 8.36107 3.76775 8.75845 3.44985 9.25296C3.13195 9.73865 2.90235 10.2861 2.76106 10.8955C2.6286 11.5048 2.56238 12.1185 2.56238 12.7366V13.293C2.56238 13.9199 2.6286 14.5425 2.76106 15.1606C2.90235 15.77 3.12753 16.3219 3.43661 16.8164C3.75451 17.3021 4.16955 17.6994 4.68172 18.0085C5.20273 18.3088 5.84737 18.4589 6.61563 18.4589Z"
        fill="#EEEEEE"
      />
      <path
        d="M28.624 13.1738C28.624 14.1981 28.5004 15.1562 28.2531 16.0481C28.0059 16.9312 27.6438 17.6994 27.167 18.3529C26.6901 19.0064 26.0984 19.5186 25.392 19.8894C24.6944 20.2603 23.8952 20.4458 22.9945 20.4458C22.1203 20.4458 21.3476 20.3045 20.6764 20.0219C20.0141 19.7393 19.4446 19.3331 18.9677 18.8033V25.6912H16.5172V5.84876H18.7558L18.875 7.41178C19.3519 6.82013 19.9258 6.36976 20.597 6.06069C21.2769 5.74279 22.0629 5.58384 22.9547 5.58384C23.8731 5.58384 24.6855 5.76487 25.392 6.12692C26.0984 6.48898 26.6901 6.99232 27.167 7.63696C27.6438 8.28159 28.0059 9.05427 28.2531 9.955C28.5004 10.8469 28.624 11.8271 28.624 12.8956V13.1738ZM26.1735 12.8956C26.1735 12.198 26.094 11.5357 25.9351 10.9087C25.785 10.2729 25.5465 9.71657 25.2198 9.23972C24.9019 8.75403 24.4957 8.3699 24.0012 8.08732C23.5067 7.80474 22.915 7.66345 22.2262 7.66345C21.4403 7.66345 20.778 7.84889 20.2393 8.21978C19.7095 8.58183 19.2856 9.04986 18.9677 9.62385V16.525C19.2856 17.0901 19.7095 17.5537 20.2393 17.9158C20.7692 18.269 21.4403 18.4456 22.2527 18.4456C22.9327 18.4456 23.5199 18.3043 24.0144 18.0218C24.5089 17.7304 24.9151 17.3418 25.233 16.8561C25.5509 16.3704 25.785 15.8097 25.9351 15.1739C26.094 14.5381 26.1735 13.8714 26.1735 13.1738V12.8956Z"
        fill="#EEEEEE"
      />
      <path
        d="M45.0954 12.8029C45.0954 14.0303 44.9541 15.1209 44.6715 16.0746C44.389 17.0195 43.9827 17.8187 43.4529 18.4721C42.9231 19.1168 42.274 19.6069 41.5058 19.9424C40.7375 20.278 39.8588 20.4458 38.8698 20.4458C37.8896 20.4458 37.011 20.278 36.2339 19.9424C35.4656 19.6069 34.8121 19.1168 34.2735 18.4721C33.7348 17.8187 33.3198 17.0195 33.0284 16.0746C32.7458 15.1209 32.6045 14.0303 32.6045 12.8029V8.286C32.6045 7.05855 32.7458 5.97238 33.0284 5.0275C33.3109 4.0738 33.7172 3.27021 34.247 2.61674C34.7857 1.96328 35.4391 1.46876 36.2074 1.1332C36.9845 0.788807 37.8631 0.61661 38.8433 0.61661C39.8324 0.61661 40.711 0.788807 41.4793 1.1332C42.2564 1.46876 42.9098 1.96328 43.4397 2.61674C43.9783 3.27021 44.389 4.0738 44.6715 5.0275C44.9541 5.97238 45.0954 7.05855 45.0954 8.286V12.8029ZM35.0682 12.3128L42.5787 6.55079C42.4374 5.27035 42.0621 4.29898 41.4528 3.63668C40.8523 2.96555 39.9825 2.62999 38.8433 2.62999C37.5541 2.62999 36.6003 3.06711 35.9822 3.94134C35.3729 4.80674 35.0682 6.07393 35.0682 7.74292V12.3128ZM42.6317 8.89532L35.1345 14.6308C35.2846 15.8759 35.6687 16.8252 36.2869 17.4787C36.905 18.1321 37.766 18.4589 38.8698 18.4589C40.1679 18.4589 41.1172 18.0173 41.7177 17.1343C42.327 16.2512 42.6317 14.9796 42.6317 13.3195V8.89532Z"
        fill="#2CFFFE"
      />
      <path
        d="M55.3986 11.1604L59.2266 5.84875H62.101L56.7629 12.9353L62.2467 20.1808H59.4121L55.4515 14.7235L51.491 20.1808H48.6299L54.1137 12.9353L48.7756 5.84875H51.6102L55.3986 11.1604Z"
        fill="#EEEEEE"
      />
    </svg>
  );
}

export default function Home() {
  const [walletInput, setWalletInput] = useState("");
  const trimmedWallet = walletInput.trim();
  const hasValidPastedAddress = isAddress(trimmedWallet);
  const pastedAddressIsValid = trimmedWallet === "" || hasValidPastedAddress;
  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { pushToast } = useToasts();
  const [settlingAction, setSettlingAction] = useState<RecoveryAction>();
  const scheduledRefetches = useRef<ReturnType<typeof setTimeout>[]>([]);

  const extensionConnector = useMemo(
    () =>
      connectors.find((connector) => connector.type === "injected") ??
      connectors[0],
    [connectors],
  );

  const activeAddress = hasValidPastedAddress ? trimmedWallet : address || "";
  const hasConnectedWallet = isConnected && Boolean(address);
  const isOnArbitrum = chainId === arbitrum.id;
  const showRecoveryBoard = Boolean(activeAddress);
  const selectedAddressIsConnected =
    hasConnectedWallet &&
    normalizeAddress(activeAddress) === normalizeAddress(address);
  const selectedWalletClientPending =
    selectedAddressIsConnected && !walletClient;
  const isReadOnlyScan = showRecoveryBoard && !selectedAddressIsConnected;
  const connectWallet = () => {
    if (extensionConnector) {
      connect({ connector: extensionConnector });
    }
  };
  const switchToArbitrum = () => {
    if (hasConnectedWallet && !isOnArbitrum) {
      switchChain({ chainId: arbitrum.id });
    }
  };
  const recoveryQuery = useQuery({
    enabled: showRecoveryBoard,
    queryFn: ({ signal }) =>
      fetchWalletRecovery(activeAddress as `0x${string}`, signal),
    queryKey: ["wallet-recovery", activeAddress],
    staleTime: 15_000,
  });
  const clearScheduledRefetches = useCallback(() => {
    for (const timeout of scheduledRefetches.current) {
      clearTimeout(timeout);
    }

    scheduledRefetches.current = [];
  }, []);
  const schedulePostActionRefetches = useCallback(
    (action: RecoveryAction) => {
      clearScheduledRefetches();
      setSettlingAction(action);
      void recoveryQuery.refetch();

      scheduledRefetches.current = POST_ACTION_REFETCH_DELAYS_MS.map(
        (delay, index, delays) =>
          setTimeout(() => {
            void recoveryQuery.refetch();

            if (index === delays.length - 1) {
              setSettlingAction(undefined);
            }
          }, delay),
      );
    },
    [clearScheduledRefetches, recoveryQuery],
  );

  useEffect(
    () => () => {
      clearScheduledRefetches();
    },
    [clearScheduledRefetches],
  );

  const recoveryColumns = recoveryQuery.data ?? recoveryColumnTemplates;
  const recoveryActionMutation = useMutation({
    mutationFn: async (action: RecoveryAction) => {
      if (!selectedAddressIsConnected) {
        throw new Error("Connect the wallet that owns this Hyperliquid account.");
      }

      if (!walletClient) {
        throw new Error("Wallet connection is still loading. Try again in a moment.");
      }

      if (!isOnArbitrum) {
        throw new Error("Switch to Arbitrum before approving the session wallet.");
      }

      const masterWallet = createHyperliquidWallet(walletClient);

      if (action.type === "setPortfolioMargin") {
        return setHyperliquidPortfolioMargin(
          masterWallet,
          action.user,
          action.enabled,
        );
      }

      if (action.type === "undelegateStake") {
        return undelegateHyperliquidStake(
          masterWallet,
          action.validator,
          action.wei,
        );
      }

      if (action.type === "transferDexCollateral") {
        return transferHyperliquidDexCollateral(masterWallet, {
          amount: action.amount,
          destination: action.destination,
          destinationDex: action.destinationDex,
          sourceDex: action.sourceDex,
          token: action.token,
        });
      }

      if (action.type === "transferSpotUsdc") {
        return transferHyperliquidSpotUsdcToPerps(masterWallet, action.amount);
      }

      if (action.type === "withdrawStaking") {
        return withdrawHyperliquidStaking(masterWallet, action.wei);
      }

      if (action.type === "withdrawUsdc") {
        return withdrawHyperliquidUsdc(
          masterWallet,
          action.destination,
          action.amount,
        );
      }

      const { agent } = await ensureApprovedSessionAgent(
        masterWallet,
        address as `0x${string}`,
      );

      switch (action.type) {
        case "cancelOrders":
          return cancelHyperliquidOrders(agent, action.cancels);
        case "closePositions":
          if (action.orders.length === 0) {
            throw new Error("There are no closeable positions.");
          }

          return placeHyperliquidMarketOrders(agent, action.orders);
        case "sellSpotAsset":
          return placeHyperliquidMarketOrders(agent, [action.order]);
        case "withdrawVault":
          return withdrawHyperliquidVault(
            agent,
            action.vaultAddress,
            action.usd,
          );
        case "portfolioBorrowLend":
          return updateHyperliquidBorrowLend(agent, {
            amount: action.amount,
            operation: action.operation,
            token: action.token,
          });
      }
    },
    onError: (mutationError, action) => {
      pushToast({
        message: formatErrorMessage(mutationError),
        title: getActionErrorTitle(action),
        variant: "error",
      });
    },
    onSuccess: (_result, action) => {
      const toast = getActionSuccessToast(action);

      pushToast({
        message: toast.message,
        title: toast.title,
        variant: "success",
      });
      schedulePostActionRefetches(action);
    },
  });
  const pendingAction = recoveryActionMutation.isPending
    ? recoveryActionMutation.variables
    : undefined;
  const activeAction = pendingAction ?? settlingAction;
  const displayColumns = useMemo(
    () =>
      recoveryColumns.map((column) => {
        const isPendingGroupAction = isSameRecoveryAction(
          column.groupActionData,
          activeAction,
        );

        return {
          ...column,
          groupAction: isPendingGroupAction && activeAction
            ? pendingAction
              ? getActionPendingLabel(activeAction)
              : getActionSettlingLabel(activeAction)
            : column.groupAction,
          groupActionDisabled: pendingAction
            ? Boolean(column.groupActionData)
            : settlingAction && isPendingGroupAction
              ? true
              : column.groupActionDisabled,
          items: column.items.map((item) => {
            if (!activeAction || !item.actionData) {
              return item;
            }

            const isActiveItemAction = isSameRecoveryAction(
              item.actionData,
              activeAction,
            );

            if (!pendingAction && !isActiveItemAction) {
              return item;
            }

            return {
              ...item,
              action: isActiveItemAction
                ? pendingAction
                  ? getActionPendingLabel(activeAction)
                  : getActionSettlingLabel(activeAction)
                : item.action,
              disabled: true,
            };
          }),
        };
      }),
    [activeAction, pendingAction, recoveryColumns, settlingAction],
  );
  const isScanning = recoveryQuery.isPending && showRecoveryBoard;
  const actionLabelOverride =
    hasConnectedWallet && !isOnArbitrum
      ? isSwitchingChain
        ? "Switching"
        : "Switch to Arbitrum"
      : selectedWalletClientPending
        ? "Preparing wallet"
      : isReadOnlyScan
        ? isPending
          ? "Connecting"
          : "Connect owner wallet"
        : undefined;
  const actionDisabledOverride =
    selectedWalletClientPending ||
    isSwitchingChain ||
    isPending ||
    (isReadOnlyScan && !extensionConnector);
  const handleActionOverride =
    hasConnectedWallet && !isOnArbitrum ? switchToArbitrum : connectWallet;
  const handleGroupAction = (action: RecoveryAction) => {
    recoveryActionMutation.mutate(action);
  };
  const handleItemAction = (action: RecoveryAction) => {
    recoveryActionMutation.mutate(action);
  };

  return (
    <main className="flex flex-1 flex-col bg-[#16161f] text-[#eeeeee]">
      <header className="sticky top-0 z-20 border-b border-[#39454b] bg-[#16161f]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <a
              href="https://cp0x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="cp0x home"
              className="flex items-center gap-3"
            >
              <HlLogo />
              <Cp0xLogo />
            </a>

            <nav className="hidden items-center gap-1 sm:flex">

              <a
                href="https://cp0x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium text-[#eeeeee]/70 transition hover:text-[#28e5e5]"
              >
                cp0x
              </a>
              <a
                  href="https://pi.cp0x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm font-medium text-[#eeeeee]/70 transition hover:text-[#28e5e5]"
              >
                Permissionless interfaces
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {hasConnectedWallet && !isOnArbitrum ? (
              <button
                type="button"
                onClick={() => switchChain({ chainId: arbitrum.id })}
                disabled={isSwitchingChain}
                className="hidden h-10 rounded-md border border-[#744137] bg-[#211715] px-3 text-sm font-medium text-[#f2b3a7] transition hover:bg-[#2a1b18] disabled:opacity-60 sm:inline-flex sm:items-center"
              >
                {isSwitchingChain ? "Switching" : "Arbitrum"}
              </button>
            ) : null}

            {hasConnectedWallet ? (
              <>
                <div className="hidden rounded-md border border-[#39454b] bg-[#1e1e26] px-3 py-2 font-mono text-xs text-[#28e5e5] sm:block">
                  {shortenAddress(address ?? "")}
                </div>
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="h-10 rounded-md border border-[#39454b] bg-[#1e1e26] px-3 text-sm font-medium text-[#28e5e5] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:border-[#525f66] hover:bg-[#252530]"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={connectWallet}
                disabled={isPending}
                className="h-10 rounded-md bg-[#28e5e5] px-4 text-sm font-medium text-[#16161f] shadow-[0_10px_28px_rgba(40,229,229,0.22)] transition hover:bg-[#2cfffe] disabled:cursor-not-allowed disabled:bg-[#39454b] disabled:text-[#525f66] disabled:shadow-none"
              >
                {isPending ? "Connecting..." : "Connect wallet"}
              </button>
            )}
          </div>
        </div>
      </header>

      <section
        className={`flex w-full flex-col px-4 py-8 transition-all duration-500 ease-out sm:px-6 lg:px-8 ${
          showRecoveryBoard
            ? "gap-8"
            : "flex-1 min-h-[calc(100vh-4rem-6rem)] items-center justify-center"
        }`}
      >
        <div
          className={`w-full max-w-2xl transition-all duration-500 ease-out ${
            showRecoveryBoard ? "mx-auto" : "mx-auto -translate-y-8"
          }`}
        >
          {!showRecoveryBoard ? (
            <div className="mb-6 text-center">
              <img
                src="/main_image.png"
                alt=""
                className="mx-auto mb-5 max-h-[28vh] w-auto object-contain"
                aria-hidden="true"
              />
              <h1 className="text-2xl font-semibold tracking-tight text-[#eeeeee] sm:text-3xl">
                Get your assets out of Hyperliquid.
              </h1>
              <p className="mt-3 whitespace-nowrap text-sm leading-6 font-medium text-[#28e5e5]">
                Use this free interface to recover assets stuck on Hyperliquid if you got blocked from app.hyperliquid.xyz.
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-[#39454b] bg-[#1e1e26] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-all duration-500 hover:border-[#525f66]">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <input
                  id="wallet-address"
                  value={walletInput}
                  onChange={(event) => setWalletInput(event.target.value)}
                  placeholder={
                    hasConnectedWallet
                      ? "Paste another wallet address"
                      : "0x4c82cfF7398f3D43b36e41B10fF6F42b14DD9385"
                  }
                  spellCheck={false}
                  aria-label="Wallet address"
                  className="h-12 w-full rounded-md border border-[#39454b] bg-[#39454b] px-4 text-center font-mono text-sm text-[#eeeeee] outline-none transition placeholder:text-[#525f66] focus:border-[#28e5e5] focus:ring-2 focus:ring-[#28e5e5]/20"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={!showRecoveryBoard}
                  onClick={() => void recoveryQuery.refetch()}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#28e5e5] px-6 text-sm font-medium text-[#16161f] shadow-[0_10px_28px_rgba(40,229,229,0.22)] transition hover:bg-[#2cfffe] disabled:bg-[#39454b] disabled:text-[#525f66] disabled:shadow-none sm:w-auto"
                >
                  {recoveryQuery.isFetching ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#16161f]/40 border-t-[#16161f]" />
                  ) : null}
                  {recoveryQuery.isFetching
                    ? "Scanning"
                    : showRecoveryBoard
                      ? "Re-scan"
                      : "Scan"}
                </button>
              </div>
            </div>
          </div>

          {!showRecoveryBoard ? (
            <p className="mt-3 text-center text-xs leading-5 text-[#dddddd]/50">
              Paste an address to inspect it or connect your wallet to
              prepare withdrawal.
            </p>
          ) : null}

          {!pastedAddressIsValid ? (
            <p className="mt-2 text-sm text-[#f2b3a7]">
              Enter a valid Ethereum address.
            </p>
          ) : null}

          {error ? (
            <p className="mt-2 rounded-md border border-[#744137] bg-[#211715] px-3 py-2 text-sm text-[#f2b3a7]">
              {error.message}
            </p>
          ) : null}

          {recoveryQuery.isError ? (
            <div className="mt-3 rounded-lg border border-[#744137] bg-[#211715] p-3 text-sm text-[#f2b3a7]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>Could not scan this Hyperliquid account.</span>
                <button
                  type="button"
                  onClick={() => void recoveryQuery.refetch()}
                  className="h-9 rounded-md border border-[#744137] bg-[#1e1e26] px-3 text-sm font-medium text-[#f2b3a7] transition hover:bg-[#2a1b18]"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : null}

        </div>

        {showRecoveryBoard ? (
          <div className="animate-kanban-in">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#28e5e5]">
                  Recovery path
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[#eeeeee]">
                  Follow these steps to get your assets out of Hyperliquid.
                </h2>
              </div>
            </div>
            <RecoveryKanban
              actionDisabledOverride={actionDisabledOverride}
              actionLabelOverride={actionLabelOverride}
              columns={displayColumns}
              isLoading={isScanning}
              onActionOverride={handleActionOverride}
              onGroupAction={handleGroupAction}
              onItemAction={handleItemAction}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
