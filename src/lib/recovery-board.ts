export type CancelOrder = {
  a: number;
  o: number;
};

export type RecoveryMarketOrder = {
  a: number;
  b: boolean;
  p: string;
  r: boolean;
  s: string;
  t: { limit: { tif: "FrontendMarket" } };
};

export type PortfolioBorrowLendOperation = "repay" | "withdraw";

export type RecoveryAction =
  | {
      type: "cancelOrders";
      cancels: CancelOrder[];
    }
  | {
      type: "closePositions";
      orders: RecoveryMarketOrder[];
    }
  | {
      assetId: number;
      coin: string;
      order: RecoveryMarketOrder;
      type: "sellSpotAsset";
    }
  | {
      type: "withdrawVault";
      usd: number;
      vaultAddress: `0x${string}`;
      vaultName: string;
    }
  | {
      amount: string | null;
      operation: PortfolioBorrowLendOperation;
      token: number;
      tokenName: string;
      type: "portfolioBorrowLend";
    }
  | {
      enabled: boolean;
      type: "setPortfolioMargin";
      user: `0x${string}`;
    }
  | {
      amount: string;
      type: "undelegateStake";
      validator: `0x${string}`;
      wei: number;
    }
  | {
      amount: string;
      type: "withdrawStaking";
      wei: number;
    }
  | {
      amount: string;
      destination: `0x${string}`;
      type: "withdrawUsdc";
    }
  | {
      amount: string;
      type: "transferSpotUsdc";
    }
  | {
      amount: string;
      destination: `0x${string}`;
      destinationDex: string;
      dexName: string;
      sourceDex: string;
      token: string;
      type: "transferDexCollateral";
    };

export type RecoveryItem = {
  id?: string;
  name: string;
  detail: string;
  value: string;
  action?: string;
  actionData?: RecoveryAction;
  disabled?: boolean;
};

export type RecoveryColumn = {
  step: string;
  title: string;
  total: string;
  description: string;
  emptyDetail: string;
  groupAction?: string;
  groupActionData?: RecoveryAction;
  groupActionDisabled?: boolean;
  items: RecoveryItem[];
};

export const recoveryColumnTemplates: RecoveryColumn[] = [
  {
    step: "01",
    title: "Open orders",
    total: "",
    description: "Resting and trigger orders across perps and spot markets.",
    emptyDetail: "No resting orders are holding funds.",
    groupAction: "Cancel all",
    items: [],
  },
  {
    step: "02",
    title: "Open positions",
    total: "",
    description: "Perp exposure that can keep margin locked.",
    emptyDetail: "No open perp positions are using margin.",
    groupAction: "Close all",
    items: [],
  },
  {
    step: "03",
    title: "Staked HYPE",
    total: "",
    description: "Delegated or undelegated HYPE that needs to move back to spot.",
    emptyDetail: "No staked HYPE needs to be unstaked.",
    items: [],
  },
  {
    step: "04",
    title: "Spot assets",
    total: "",
    description: "Non-USDC spot balances worth more than $10.",
    emptyDetail: "No spot assets above the recovery threshold.",
    items: [],
  },
  {
    step: "05",
    title: "Vault deposits",
    total: "",
    description: "Depositor equity in protocol or user vaults.",
    emptyDetail: "No vault deposits are waiting to withdraw.",
    items: [],
  },
  {
    step: "06",
    title: "Portfolio margin",
    total: "",
    description: "Unified spot and perps margin can create borrows or supplied assets.",
    emptyDetail: "No portfolio margin borrows or supplied assets found.",
    items: [],
  },
  {
    step: "07",
    title: "Withdraw from Hyperliquid",
    total: "",
    description: "Final withdrawable USDC after the previous steps settle.",
    emptyDetail: "No withdrawable USDC is locked here.",
    items: [],
  },
];
