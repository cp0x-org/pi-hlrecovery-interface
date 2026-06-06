import type { AbstractWallet } from "@nktkas/hyperliquid/signing";
import type { WalletClient } from "viem";

type HyperliquidTypedDataParams = {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: `0x${string}`;
  };
  types: Record<string, { name: string; type: string }[]>;
  primaryType: string;
  message: Record<string, unknown>;
};

export function createHyperliquidWallet(walletClient: WalletClient): AbstractWallet {
  if (!walletClient.account?.address) {
    throw new Error("Connected wallet is missing an account address.");
  }

  const account = walletClient.account;
  const requestTypedDataSignature = walletClient.request as (parameters: {
    method: "eth_signTypedData_v4";
    params: [`0x${string}`, string];
  }) => Promise<`0x${string}`>;

  return {
    getAddresses: async () => [account.address],
    getChainId: async () => walletClient.chain?.id ?? 42161,
    signTypedData(params: HyperliquidTypedDataParams) {
      return requestTypedDataSignature({
        method: "eth_signTypedData_v4",
        params: [account.address, JSON.stringify(params)],
      });
    },
  };
}
