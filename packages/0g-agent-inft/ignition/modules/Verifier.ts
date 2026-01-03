import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import TEEVerifierModule from "./TEEVerifier.js";

// OracleType enum matching the contract
const OracleType = {
  TEE: 0,
  ZKP: 1,
} as const;

const VerifierModule = buildModule("VerifierModule", (m) => {
  // Import TEEVerifier module
  const { teeVerifier } = m.useModule(TEEVerifierModule);

  // Module parameters
  const owner = m.getParameter<string>("owner");
  const verifierType = m.getParameter<number>("verifierType", OracleType.TEE);

  // 1. Deploy implementation
  const verifierImpl = m.contract("Verifier", [], {
    id: "VerifierImpl",
  });

  // 2. Deploy UpgradeableBeacon
  const verifierBeacon = m.contract(
    "UpgradeableBeaconExport",
    [verifierImpl, owner],
    { id: "VerifierBeacon" }
  );

  // 3. Encode initialization data using Ignition's encodeFunctionCall
  const initData = m.encodeFunctionCall(verifierImpl, "initialize", [
    [{ oracleType: verifierType, contractAddress: teeVerifier }],
    owner,
  ]);

  // 4. Deploy BeaconProxy
  const verifier = m.contract(
    "BeaconProxyExport",
    [verifierBeacon, initData],
    { id: "Verifier" }
  );

  return { verifierImpl, verifierBeacon, verifier, teeVerifier };
});

export default VerifierModule;
