import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// 0G Galileo Testnet chain definition
export const zeroGGalileoTestnet = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "A0GI",
    symbol: "A0GI",
  },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: {
      name: "0G Explorer",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
});

export const config = getDefaultConfig({
  appName: "0G Agent INFT",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [zeroGGalileoTestnet],
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
