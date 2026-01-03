import { network } from "hardhat";
import { TransactionReceipt } from "viem";

async function main() {
    const { viem } = await network.connect({
        network: "zgTestnet",
        chainType: "l1",
    });
    const AGENT_NFT_ADDRESS = "0x6bf932f1410483cC5f7Aa3881a7718381840861c"; // Ganti dengan address nft kalian
    const TOKEN_ID = 0n;
    const USER_TO_AUTHORIZE = "0xb0175f56d4731C02aC9A30877fcD7c18C6af1858"; // Ganti dengan address user

    console.log("=".repeat(50));
    console.log("Revoking User for INFT");
    console.log("=".repeat(50));

    const [owner] = await viem.getWalletClients();
    console.log("\nOwner:", owner.account.address);
    console.log("User to revoke:", USER_TO_AUTHORIZE);

    // Connect to contract
    const agentNFT = await viem.getContractAt("AgentNFT", AGENT_NFT_ADDRESS);

    // Authorize
    console.log("\Revoking user...");
    const hash = await agentNFT.write.revokeAuthorization([TOKEN_ID, USER_TO_AUTHORIZE]);
    console.log("Transaction sent:", hash);

    let receipt: TransactionReceipt
    const publicClient = await viem.getPublicClient();
    try {
        receipt = await publicClient.waitForTransactionReceipt({ hash });
    } catch (e) {
        receipt = await publicClient.waitForTransactionReceipt({ hash });
    }
    console.log("Transaction confirmed!");

    // Verify authorization
    const authorizedUsers = await agentNFT.read.authorizedUsersOf([TOKEN_ID]);
    console.log("✅ User Revoked!");
    console.log("Authorized Users:", authorizedUsers);
}

main()