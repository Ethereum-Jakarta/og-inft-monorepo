import "dotenv/config"
import type { Address } from "viem";

export const config = {
    port: Number(process.env.PORT || 3001),
    ogRpcUrl: process.env.OG_RPC_URL || 'https://evmrpc-testnet.0g.ai',
    contractAddress: process.env.AGENT_NFT_ADDRESS as Address,
    ogComputeUrl: process.env.OG_COMPUTE_URL,
    ogApiKey: process.env.OG_COMPUTE_API_KEY,
    ogBrokerPrivateKey: process.env.OG_BROKER_PRIVATE_KEY,

    // Contract ABI (AgentNFT - official functions)
    contractABI: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AccessControlBadConfirmation",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "neededRole",
          "type": "bytes32"
        }
      ],
      "name": "AccessControlUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "EnforcedPause",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExpectedPause",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotInitializing",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_oldAdmin",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_newAdmin",
          "type": "address"
        }
      ],
      "name": "AdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "_approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "Authorization",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "AuthorizationRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "AuthorizedUsersCleared",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_newTokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_to",
          "type": "address"
        }
      ],
      "name": "Cloned",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_assistant",
          "type": "address"
        }
      ],
      "name": "DelegateAccess",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_creator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "Minted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes[]",
          "name": "_sealedKeys",
          "type": "bytes[]"
        }
      ],
      "name": "PublishedSealedKey",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousAdminRole",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newAdminRole",
          "type": "bytes32"
        }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_to",
          "type": "address"
        }
      ],
      "name": "Transferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "string",
              "name": "dataDescription",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            }
          ],
          "indexed": false,
          "internalType": "struct IntelligentData[]",
          "name": "_oldDatas",
          "type": "tuple[]"
        },
        {
          "components": [
            {
              "internalType": "string",
              "name": "dataDescription",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            }
          ],
          "indexed": false,
          "internalType": "struct IntelligentData[]",
          "name": "_newDatas",
          "type": "tuple[]"
        }
      ],
      "name": "Updated",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MAX_AUTHORIZED_USERS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "PAUSER_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "VERSION",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "authorizeUsage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "authorizedUsersOf",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "users",
          "type": "address[]"
        }
      ],
      "name": "batchAuthorizeUsage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "clearAuthorizedUsers",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "assistant",
          "type": "address"
        }
      ],
      "name": "delegateAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getDelegateAccess",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleAdmin",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "oldDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "newDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "nonce",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "encryptedPubKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "proof",
                  "type": "bytes"
                }
              ],
              "internalType": "struct AccessProof",
              "name": "accessProof",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "enum OracleType",
                  "name": "oracleType",
                  "type": "uint8"
                },
                {
                  "internalType": "bytes32",
                  "name": "oldDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "newDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "sealedKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "encryptedPubKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "nonce",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "proof",
                  "type": "bytes"
                }
              ],
              "internalType": "struct OwnershipProof",
              "name": "ownershipProof",
              "type": "tuple"
            }
          ],
          "internalType": "struct TransferValidityProof[]",
          "name": "proofs",
          "type": "tuple[]"
        }
      ],
      "name": "iClone",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "oldDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "newDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "nonce",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "encryptedPubKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "proof",
                  "type": "bytes"
                }
              ],
              "internalType": "struct AccessProof",
              "name": "accessProof",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "enum OracleType",
                  "name": "oracleType",
                  "type": "uint8"
                },
                {
                  "internalType": "bytes32",
                  "name": "oldDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "newDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "sealedKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "encryptedPubKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "nonce",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "proof",
                  "type": "bytes"
                }
              ],
              "internalType": "struct OwnershipProof",
              "name": "ownershipProof",
              "type": "tuple"
            }
          ],
          "internalType": "struct TransferValidityProof[]",
          "name": "proofs",
          "type": "tuple[]"
        }
      ],
      "name": "iCloneFrom",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "oldDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "newDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "nonce",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "encryptedPubKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "proof",
                  "type": "bytes"
                }
              ],
              "internalType": "struct AccessProof",
              "name": "accessProof",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "enum OracleType",
                  "name": "oracleType",
                  "type": "uint8"
                },
                {
                  "internalType": "bytes32",
                  "name": "oldDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "newDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "sealedKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "encryptedPubKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "nonce",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "proof",
                  "type": "bytes"
                }
              ],
              "internalType": "struct OwnershipProof",
              "name": "ownershipProof",
              "type": "tuple"
            }
          ],
          "internalType": "struct TransferValidityProof[]",
          "name": "proofs",
          "type": "tuple[]"
        }
      ],
      "name": "iTransfer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "oldDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "newDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "nonce",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "encryptedPubKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "proof",
                  "type": "bytes"
                }
              ],
              "internalType": "struct AccessProof",
              "name": "accessProof",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "enum OracleType",
                  "name": "oracleType",
                  "type": "uint8"
                },
                {
                  "internalType": "bytes32",
                  "name": "oldDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "newDataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "sealedKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "encryptedPubKey",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "nonce",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes",
                  "name": "proof",
                  "type": "bytes"
                }
              ],
              "internalType": "struct OwnershipProof",
              "name": "ownershipProof",
              "type": "tuple"
            }
          ],
          "internalType": "struct TransferValidityProof[]",
          "name": "proofs",
          "type": "tuple[]"
        }
      ],
      "name": "iTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name_",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "symbol_",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "storageInfo_",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "verifierAddr",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "admin_",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "intelligentDatasOf",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "dataDescription",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct IntelligentData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "dataDescription",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct IntelligentData[]",
          "name": "iDatas",
          "type": "tuple[]"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "mint",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "callerConfirmation",
          "type": "address"
        }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "revokeAuthorization",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "setAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "storageInfo",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "string",
              "name": "dataDescription",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct IntelligentData[]",
          "name": "newDatas",
          "type": "tuple[]"
        }
      ],
      "name": "update",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newVerifier",
          "type": "address"
        }
      ],
      "name": "updateVerifier",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "verifier",
      "outputs": [
        {
          "internalType": "contract IERC7857DataVerifier",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const
};