import "dotenv/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";
import { zeroGGalileoTestnet } from "viem/chains";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    zgTestnet: {
      type: "http",
      chainType: "l1",
      chainId: 16602,
      url: zeroGGalileoTestnet.rpcUrls.default.http[0],
      accounts: [configVariable("PRIVATE_KEY")],
    },
  },
  verify: {
    etherscan: {
      apiKey: 'YOUR_API_KEY'
    }
  },
  chainDescriptors: {
    16602: {
      name: 'zgTestnet',
      blockExplorers: {
        blockscout: {
          apiUrl: 'https://chainscan-galileo.0g.ai/open/api',
          url: zeroGGalileoTestnet.blockExplorers.default.url
        },
        etherscan: {
          apiUrl: 'https://chainscan-galileo.0g.ai/open/api',
          url: zeroGGalileoTestnet.blockExplorers.default.url
        }
      }
    }
  }
});
