import type { Translate } from "@/lib/i18n";

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

export function getRecoveryColumnTemplates(t: Translate): RecoveryColumn[] {
  return [
    {
      step: "01",
      title: t("column.orders.title"),
      total: "",
      description: t("column.orders.description"),
      emptyDetail: t("column.orders.empty"),
      groupAction: t("column.orders.groupAction"),
      items: [],
    },
    {
      step: "02",
      title: t("column.positions.title"),
      total: "",
      description: t("column.positions.description"),
      emptyDetail: t("column.positions.empty"),
      groupAction: t("column.positions.groupAction"),
      items: [],
    },
    {
      step: "03",
      title: t("column.staking.title"),
      total: "",
      description: t("column.staking.description"),
      emptyDetail: t("column.staking.empty"),
      items: [],
    },
    {
      step: "04",
      title: t("column.spot.title"),
      total: "",
      description: t("column.spot.description"),
      emptyDetail: t("column.spot.empty"),
      items: [],
    },
    {
      step: "05",
      title: t("column.vaults.title"),
      total: "",
      description: t("column.vaults.description"),
      emptyDetail: t("column.vaults.empty"),
      items: [],
    },
    {
      step: "06",
      title: t("column.portfolioMargin.title"),
      total: "",
      description: t("column.portfolioMargin.description"),
      emptyDetail: t("column.portfolioMargin.empty"),
      items: [],
    },
    {
      step: "07",
      title: t("column.withdraw.title"),
      total: "",
      description: t("column.withdraw.description"),
      emptyDetail: t("column.withdraw.empty"),
      items: [],
    },
  ];
}
