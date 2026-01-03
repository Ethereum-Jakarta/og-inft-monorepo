import { network } from "hardhat";
import { Address, TransactionReceipt } from "viem";

async function main() {
    const { viem } = await network.connect({
        network: "zgTestnet",
        chainType: "l1",
    });
    const AGENT_NFT_ADDRESS = "0x6bf932f1410483cC5f7Aa3881a7718381840861c"; // Ganti dengan address nft kalian
    const TOKEN_ID = 0n;

    // Connect to contract
    const agentNFT = await viem.getContractAt("AgentNFT", AGENT_NFT_ADDRESS);

    console.log("Clearing all authorized users...");
    const hash = await agentNFT.write.clearAuthorizedUsers([TOKEN_ID]);
    let receipt: TransactionReceipt
    const publicClient = await viem.getPublicClient();
    try {
        receipt = await publicClient.waitForTransactionReceipt({ hash });
    } catch (e) {
        receipt = await publicClient.waitForTransactionReceipt({ hash });
    }
    console.log("Transaction confirmed!");

    const authorizedUsers = await agentNFT.read.authorizedUsersOf([TOKEN_ID]);
    console.log("Authorized users:", authorizedUsers);
    console.log('All Authorized users cleared');
}

main()