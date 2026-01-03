import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

const TEEVerifierModule = buildModule("TEEVerifierModule", (m) => {
  // Module parameters with defaults
  const tdxQuote = m.getParameter<string>("tdxQuote", "0x00");
  const trustedMrtd = m.getParameter<string>("trustedMrtd", ZERO_HASH);
  const trustedRtmr0 = m.getParameter<string>("trustedRtmr0", ZERO_HASH);
  const trustedRtmr1 = m.getParameter<string>("trustedRtmr1", ZERO_HASH);
  const trustedRtmr2 = m.getParameter<string>("trustedRtmr2", ZERO_HASH);
  const trustedRtmr3 = m.getParameter<string>("trustedRtmr3", ZERO_HASH);
  const owner = m.getParameter<string>("owner");

  // 1. Deploy implementation
  const teeVerifierImpl = m.contract("TEEVerifier", [], {
    id: "TEEVerifierImpl",
  });

  // 2. Deploy UpgradeableBeacon
  const teeVerifierBeacon = m.contract(
    "UpgradeableBeaconExport",
    [teeVerifierImpl, owner],
    { id: "TEEVerifierBeacon" }
  );

  // 3. Encode initialization data using Ignition's encodeFunctionCall
  const initData = m.encodeFunctionCall(teeVerifierImpl, "initialize", [
    tdxQuote,
    {
      mrtd: trustedMrtd,
      rtmr0: trustedRtmr0,
      rtmr1: trustedRtmr1,
      rtmr2: trustedRtmr2,
      rtmr3: trustedRtmr3,
    },
  ]);

  // 4. Deploy BeaconProxy
  const teeVerifier = m.contract(
    "BeaconProxyExport",
    [teeVerifierBeacon, initData],
    { id: "TEEVerifier" }
  );

  return { teeVerifierImpl, teeVerifierBeacon, teeVerifier };
});

export default TEEVerifierModule;
