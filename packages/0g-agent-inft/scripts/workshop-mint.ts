import { network } from "hardhat";
import { keccak256, parseEventLogs, TransactionReceipt } from "viem";

async function main() {
    const { viem } = await network.connect({
        network: "zgTestnet",
        chainType: "l1",
    });
    const AGENT_NFT_ADDRESS = '0x6bf932f1410483cC5f7Aa3881a7718381840861c' // Ganti dengan address nft kalian
    console.log("=".repeat(50));
    console.log("Minting INFT on AgentNFT Contract");
    console.log("=".repeat(50));
    // Get signer
    const [owner] = await viem.getWalletClients();
    console.log("\nMinter:", owner.account.address);

    const agentNFT = await viem.getContractAt('AgentNFT', AGENT_NFT_ADDRESS)
    const agentConfig = {
        name: "My Web3 Assistant",
        model: "gpt-4",
        systemPrompt: "You are a helpful Web3 assistant that explains blockchain concepts.",
        personality: "friendly and educational",
        capabilities: ["explain", "code", "analyze"]
    }

    console.log("\nAgent Config:");
    console.log(JSON.stringify(agentConfig, null, 2));

    // Create data hash
    const configJson = JSON.stringify(agentConfig);
    const dataHash = keccak256(Buffer.from(configJson));
    console.log("\nData Hash:", dataHash);

        // Prepare IntelligentData array
    const iDatas = [{
        dataDescription: "AI Agent Config v1.0",
        dataHash: dataHash
    }];

    // Mint
    console.log("\nMinting INFT...");
    const hash = await agentNFT.write.mint([iDatas, owner.account.address])
    console.log("Transaction sent:", hash);

    let receipt: TransactionReceipt
    const publicClient = await viem.getPublicClient();
    try {
        receipt = await publicClient.waitForTransactionReceipt({ hash });
    } catch (e) {
        receipt = await publicClient.waitForTransactionReceipt({ hash });
    }
    

    const logs = parseEventLogs({ logs: receipt.logs, abi: agentNFT.abi });
// Parse Minted event untuk dapat token ID
    for (const log of logs) {
            if (log.eventName === "Minted") {
                console.log("\n✅ INFT Minted Successfully!");
                console.log("   Token ID:", log.args._tokenId);
                console.log("   Creator:", log.args._creator);
                console.log("   Owner:", log.args._owner);
            }
    }
}

void main()