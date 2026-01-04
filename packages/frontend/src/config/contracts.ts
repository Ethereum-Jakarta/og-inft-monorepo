import type { Address } from "viem";

// Deployed contract addresses (0G Galileo Testnet)
export const CONTRACTS = {
  AgentNFT: import.meta.env.VITE_AGENT_NFT_ADDRESS as Address,
  AgentMarket: import.meta.env.VITE_AGENT_MARKET_ADDRESS as Address,
  Verifier: import.meta.env.VITE_VERIFIER_ADDRESS as Address,
  TEEVerifier: import.meta.env.VITE_TEE_VERIFIER_ADDRESS as Address,
};

// Executor service URL
export const EXECUTOR_URL = import.meta.env.VITE_EXECUTOR_URL || "http://localhost:3001";
