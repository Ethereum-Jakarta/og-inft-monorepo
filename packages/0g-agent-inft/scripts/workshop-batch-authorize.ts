import { network } from "hardhat";
import { Address, TransactionReceipt } from "viem";

async function main() {
    const { viem } = await network.connect({
        network: "zgTestnet",
        chainType: "l1",
    });
    const AGENT_NFT_ADDRESS = "0x6bf932f1410483cC5f7Aa3881a7718381840861c"; // Ganti dengan address nft kalian
    const TOKEN_ID = 0n;
    const USERS = [
        "0xb0175f56d4731C02aC9A30877fcD7c18C6af1858",
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333"
    ] satisfies Address[]; // Ganti dengan address user

    // Connect to contract
    const agentNFT = await viem.getContractAt("AgentNFT", AGENT_NFT_ADDRESS);

    console.log("Batch authorizing", USERS.length, "users...");
    const hash = await agentNFT.write.batchAuthorizeUsage([TOKEN_ID, USERS]);
    let receipt: TransactionReceipt
    const publicClient = await viem.getPublicClient();
    try {
        receipt = await publicClient.waitForTransactionReceipt({ hash });
    } catch (e) {
        receipt = await publicClient.waitForTransactionReceipt({ hash });
    }
    console.log("Transaction confirmed!");

    const authorizedUsers = await agentNFT.read.authorizedUsersOf([TOKEN_ID]);
    console.log("All authorized users:", authorizedUsers);
}

main()