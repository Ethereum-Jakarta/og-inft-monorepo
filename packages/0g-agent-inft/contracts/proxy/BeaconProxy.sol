// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

// Re-export for Hardhat compilation
contract BeaconProxyExport is BeaconProxy {
    constructor(address beacon, bytes memory data)
        BeaconProxy(beacon, data) {}
}
