import { createConfig, http, injected } from "wagmi";
import { arbitrum } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [arbitrum],
  connectors: [injected({ shimDisconnect: true })],
  ssr: true,
  transports: {
    [arbitrum.id]: http(),
  },
});

