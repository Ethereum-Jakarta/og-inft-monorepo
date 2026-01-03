import { createPublicClient, createWalletClient, getContract, http, parseAbi, recoverMessageAddress, verifyMessage, type Address } from "viem";
import { config } from "./config.js";
import { bifrost, zeroGGalileoTestnet } from "viem/chains";

const client = createPublicClient({ transport: http(), chain: zeroGGalileoTestnet })
const contract = getContract({ abi: config.contractABI, address: config.contractAddress, client })

/**
 * Verify user signature
 */
export async function verifySignature(message: string, signature: Address, expectedAddress: Address) {
    try {
        const recoveredAddress = await recoverMessageAddress({ message, signature });
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
        console.error('Signature verification failed:', error);
        return false;
    }
}

/**
 * Check on-chain authorization using AgentNFT contract
 * User is authorized if they are owner OR in authorizedUsers list
 */
export async function checkAuthorization(tokenId: number, userAddress: Address) {
    try {
        // Check if user is owner
        const owner = await contract.read.ownerOf([BigInt(tokenId)])
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
            return true;
        }

        // Check if user is in authorized users list
        const authorizedUsers = await contract.read.authorizedUsersOf([BigInt(tokenId)])
        return authorizedUsers.some(
            (u) => u.toLowerCase() === userAddress.toLowerCase()
        );
    } catch (error) {
        console.error('Authorization check failed:', error);
        return false;
    }
}

/**
 * Get intelligent data from token
 */
export async function getIntelligentData(tokenId: number) {
    try {
        const iDatas = await contract.read.intelligentDatasOf([BigInt(tokenId)])
        return iDatas
    } catch (error) {
        console.error('Failed to get intelligent data:', error);
        return null;
    }
}

/**
 * Get token owner
 */
export async function getTokenOwner(tokenId: number) {
    try {
        return await contract.read.ownerOf([BigInt(tokenId)]);
    } catch (error) {
        console.error('Failed to get owner:', error);
        return null;
    }
}

/**
 * Get authorized users list
 */
export async function getAuthorizedUsers(tokenId: number) {
    try {
        return await contract.read.authorizedUsersOf([BigInt(tokenId)]);
    } catch (error) {
        console.error('Failed to get authorized users:', error);
        return [];
    }
}