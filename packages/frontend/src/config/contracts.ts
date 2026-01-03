import type { Address } from "viem";

// Deployed contract addresses (0G Galileo Testnet)
export const CONTRACTS = {
  AgentNFT: "0x6bf932f1410483cC5f7Aa3881a7718381840861c" as Address,
  AgentMarket: "0x69f14E3325ae49572d707855f03Fb69A561b8881" as Address,
  Verifier: "0x04438736E022e82b3fbE1155EaF1825389d637eb" as Address,
  TEEVerifier: "0xdFe859Fd9951e35AE6f2Fa314442Ff26e9e3caF1" as Address,
};

// Executor service URL
export const EXECUTOR_URL = import.meta.env.VITE_EXECUTOR_URL || "http://localhost:3001";
