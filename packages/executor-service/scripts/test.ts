import "dotenv/config";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { zeroGGalileoTestnet } from "viem/chains";

const EXECUTOR_URL = "http://localhost:3001";
const TOKEN_ID = 0;

async function main() {
    console.log("=".repeat(50));
    console.log("Testing INFT Inference");
    console.log("=".repeat(50));

    // Setup wallet
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    const client = createWalletClient({
        account,
        chain: zeroGGalileoTestnet,
        transport: http(),
    });

    console.log("\nWallet:", account.address);

    // Step 1: Check health
    console.log("\n[1] Checking executor health...");
    const healthRes = await fetch(`${EXECUTOR_URL}/health`);
    const health = await healthRes.json();
    console.log("Status:", health.status);

    // Step 2: Check authorization
    console.log("\n[2] Checking authorization...");
    const authRes = await fetch(
        `${EXECUTOR_URL}/api/auth/${TOKEN_ID}/${account.address}`
    );
    const authData = await authRes.json();
    console.log("Is Authorized:", authData.isAuthorized);
    console.log("Is Owner:", authData.isOwner);

    if (!authData.isAuthorized) {
        console.log("\n❌ Not authorized. Please ensure you own or have usage rights.");
        return;
    }

    // Step 3: Create signature
    console.log("\n[3] Creating signature...");
    const message = `Authorize inference for token ${TOKEN_ID} at ${Date.now()}`;
    const signature = await client.signMessage({ message });
    console.log("Message:", message);
    console.log("Signature:", signature.substring(0, 20) + "...");

    // Step 4: Call inference
    console.log("\n[4] Calling inference...");
    const inferenceRes = await fetch(`${EXECUTOR_URL}/api/inference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tokenId: TOKEN_ID,
            userAddress: account.address,
            signature,
            message,
            prompt: "Explain what makes INFT different from regular NFTs in 3 sentences.",
            agentType: "web3Expert",
        }),
    });

    const result = await inferenceRes.json();

    if (result.success) {
        console.log("\n✅ Inference Successful!");
        console.log("\n" + "-".repeat(50));
        console.log("Response:");
        console.log("-".repeat(50));
        console.log(result.response);
        console.log("-".repeat(50));
        console.log("\nModel:", result.model);
        console.log("Mock:", result.mock);
    } else {
        console.log("\n❌ Inference Failed:", result.error);
    }
}

main().catch(console.error);