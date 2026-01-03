// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

// Re-export for Hardhat compilation
contract UpgradeableBeaconExport is UpgradeableBeacon {
    constructor(address implementation_, address initialOwner)
        UpgradeableBeacon(implementation_, initialOwner) {}
}
