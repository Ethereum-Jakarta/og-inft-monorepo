import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import AgentNFTModule from "./AgentNFT.js";

const AgentMarketModule = buildModule("AgentMarketModule", (m) => {
  // Import AgentNFT module (which includes Verifier and TEEVerifier)
  const { agentNFT } = m.useModule(AgentNFTModule);

  // Module parameters
  const owner = m.getParameter<string>("owner");
  // Fee rate in basis points (1000 = 10%)
  const initialFeeRate = m.getParameter<bigint>("initialFeeRate", 1000n);
  // Mint fee in wei (0.1 ETH = 100000000000000000)
  const initialMintFee = m.getParameter<bigint>(
    "initialMintFee",
    100000000000000000n
  );
  // Discount mint fee in wei (default 0)
  const initialDiscountMintFee = m.getParameter<bigint>(
    "initialDiscountMintFee",
    0n
  );

  // 1. Deploy implementation
  const agentMarketImpl = m.contract("AgentMarket", [], {
    id: "AgentMarketImpl",
  });

  // 2. Deploy UpgradeableBeacon
  const agentMarketBeacon = m.contract(
    "UpgradeableBeaconExport",
    [agentMarketImpl, owner],
    { id: "AgentMarketBeacon" }
  );

  // 3. Encode initialization data
  const initData = m.encodeFunctionCall(agentMarketImpl, "initialize", [
    agentNFT,
    initialFeeRate,
    owner,
    initialMintFee,
    initialDiscountMintFee,
  ]);

  // 4. Deploy BeaconProxy
  const agentMarket = m.contract(
    "BeaconProxyExport",
    [agentMarketBeacon, initData],
    { id: "AgentMarket" }
  );

  return { agentMarketImpl, agentMarketBeacon, agentMarket, agentNFT };
});

export default AgentMarketModule;
