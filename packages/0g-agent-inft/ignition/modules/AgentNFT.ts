import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import VerifierModule from "./Verifier.js";

const AgentNFTModule = buildModule("AgentNFTModule", (m) => {
  // Import Verifier module (which includes TEEVerifier)
  const { verifier } = m.useModule(VerifierModule);

  // Module parameters
  const owner = m.getParameter<string>("owner");
  const nftName = m.getParameter<string>("nftName", "0G Agent NFT");
  const nftSymbol = m.getParameter<string>("nftSymbol", "0GI");
  const chainURL = m.getParameter<string>(
    "chainURL",
    "https://evmrpc-testnet.0g.ai"
  );
  const indexerURL = m.getParameter<string>(
    "indexerURL",
    "https://indexer-storage-testnet-turbo.0g.ai"
  );

  // Build storageInfo JSON string
  const storageInfo = m.getParameter<string>(
    "storageInfo",
    JSON.stringify({
      chainURL: "https://evmrpc-testnet.0g.ai",
      indexerURL: "https://indexer-storage-testnet-turbo.0g.ai",
    })
  );

  // 1. Deploy implementation
  const agentNFTImpl = m.contract("AgentNFT", [], {
    id: "AgentNFTImpl",
  });

  // 2. Deploy UpgradeableBeacon
  const agentNFTBeacon = m.contract(
    "UpgradeableBeaconExport",
    [agentNFTImpl, owner],
    { id: "AgentNFTBeacon" }
  );

  // 3. Encode initialization data
  const initData = m.encodeFunctionCall(agentNFTImpl, "initialize", [
    nftName,
    nftSymbol,
    storageInfo,
    verifier,
    owner,
  ]);

  // 4. Deploy BeaconProxy
  const agentNFT = m.contract(
    "BeaconProxyExport",
    [agentNFTBeacon, initData],
    { id: "AgentNFT" }
  );

  return { agentNFTImpl, agentNFTBeacon, agentNFT, verifier };
});

export default AgentNFTModule;
