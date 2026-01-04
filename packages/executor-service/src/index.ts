import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "./config.js";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getAgentTypes, runInference, runInferenceWithConfig } from "./inference.js";
import {
  checkAuthorization,
  getAuthorizedUsers,
  getIntelligentData,
  getTokenOwner,
  verifySignature,
} from "./auth.js";
import {
  storeAgentConfig,
  getAgentConfig,
  computeConfigHash,
  verifyConfigHash,
  listAgentConfigs,
} from "./storage.js";
import { isAddress, type Address } from "viem";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono()
  .use(cors())
  .use(logger())
  .get("/health", (ctx) =>
    ctx.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      contract: config.contractAddress,
    })
  )
  .get("/api/agents", async (ctx) => ctx.json({ agents: getAgentTypes() }))
  .get("/api/auth/:tokenId/:address", async (ctx) => {
    const { tokenId, address } = ctx.req.param();
    if (!isAddress(address)) throw new Error("Invalid address");
    const isAuthorized = await checkAuthorization(Number(tokenId), address);
    const owner = await getTokenOwner(Number(tokenId));
    return ctx.json({
      tokenId: parseInt(tokenId),
      address,
      isAuthorized,
      isOwner: owner?.toLowerCase() === address.toLowerCase(),
    });
  })
  // Register agent config for a token
  .post(
    "/api/register",
    zValidator(
      "json",
      z.object({
        tokenId: z.number(),
        userAddress: z.string(),
        signature: z.string(),
        message: z.string(),
        config: z.object({
          name: z.string(),
          model: z.string(),
          systemPrompt: z.string(),
          personality: z.string(),
          capabilities: z.array(z.string()),
          temperature: z.number().min(0).max(2),
          maxTokens: z.number().min(1).max(4096),
        }),
      })
    ),
    async (ctx) => {
      const { tokenId, userAddress, signature, message, config: agentConfig } = ctx.req.valid("json");

      if (!isAddress(userAddress)) {
        ctx.status(400);
        return ctx.json({ error: "Invalid address" });
      }

      // Verify signature
      const isValidSignature = verifySignature(message, signature as Address, userAddress);
      if (!isValidSignature) {
        ctx.status(401);
        return ctx.json({ error: "Invalid signature" });
      }

      // Verify user is owner (only owner can register config)
      const owner = await getTokenOwner(tokenId);
      if (!owner || owner.toLowerCase() !== userAddress.toLowerCase()) {
        ctx.status(403);
        return ctx.json({ error: "Only token owner can register config" });
      }

      // Compute and verify hash matches on-chain
      const computedHash = computeConfigHash(agentConfig);
      const intelligentData = await getIntelligentData(tokenId);

      if (!intelligentData || intelligentData.length === 0) {
        ctx.status(400);
        return ctx.json({ error: "Token has no intelligent data" });
      }

      const onChainHash = intelligentData[0].dataHash;
      if (computedHash.toLowerCase() !== onChainHash.toLowerCase()) {
        ctx.status(400);
        return ctx.json({
          error: "Config hash does not match on-chain data",
          computed: computedHash,
          onChain: onChainHash,
        });
      }

      // Store the config
      const storedConfig = storeAgentConfig(tokenId, agentConfig);

      console.log(`\n[Register] Token ${tokenId} config stored`);
      console.log(`  Model: ${agentConfig.model}`);
      console.log(`  Hash: ${computedHash}`);

      return ctx.json({
        success: true,
        tokenId,
        config: storedConfig,
        hash: computedHash,
      });
    }
  )
  // Get stored config for a token
  .get("/api/config/:tokenId", async (ctx) => {
    const tokenId = parseInt(ctx.req.param("tokenId"));
    const storedConfig = getAgentConfig(tokenId);

    if (!storedConfig) {
      ctx.status(404);
      return ctx.json({ error: "No config found for this token" });
    }

    return ctx.json({
      tokenId,
      config: storedConfig,
      hash: computeConfigHash(storedConfig),
    });
  })
  // List all registered agents (marketplace)
  .get("/api/agents/registered", async (ctx) => {
    const allConfigs = listAgentConfigs();
    const agents = await Promise.all(
      Object.entries(allConfigs).map(async ([tokenId, config]) => {
        const owner = await getTokenOwner(Number(tokenId));
        return {
          tokenId: Number(tokenId),
          config,
          owner,
        };
      })
    );
    return ctx.json({ agents });
  })
  .post(
    "/api/inference",
    zValidator(
      "json",
      z.object({
        tokenId: z.number(),
        userAddress: z.string(),
        signature: z.string(),
        message: z.string(),
        prompt: z.string(),
        agentType: z
          .enum(["default", "web3Expert", "creativAssistant"])
          .default("default"),
        context: z.array(z.object({ role: z.string(), content: z.string() })).default([]),
      })
    ),
    async (ctx) => {
      const {
        tokenId,
        userAddress,
        signature,
        message,
        prompt,
        agentType,
        context,
      } = ctx.req.valid("json");

      console.log('--body', ctx.req.valid('json'))
      if (
        !isAddress(userAddress)
      ) {
        ctx.status(400);
        return ctx.json({
          error: "Missing required fields",
          required: [
            "tokenId",
            "userAddress",
            "signature",
            "message",
            "prompt",
          ],
        });
      }

      console.log(`\n${"=".repeat(50)}`);
      console.log("Inference Request");
      console.log(`${"=".repeat(50)}`);
      console.log("Token ID:", tokenId);
      console.log("User:", userAddress);
      console.log("Agent Type:", agentType);

      // Step 1: Verify signature
      console.log("\n[1] Verifying signature...");
      const isValidSignature = verifySignature(message, signature as Address, userAddress);

      if (!isValidSignature) {
        console.log("❌ Invalid signature");
        ctx.status(401);
        return ctx.json({ error: "Invalid signature" });
      }

      console.log("✅ Signature valid");

      // Step 2: Check on-chain authorization
      console.log("\n[2] Checking on-chain authorization...");
      const isAuthorized = await checkAuthorization(tokenId, userAddress);

      if (!isAuthorized) {
        console.log("❌ Not authorized");
        ctx.status(403);
        return ctx.json({
          error: "Not authorized to use this INFT",
          tokenId,
          userAddress,
        });
      }
      console.log("✅ User is authorized");

      // Step 3: Get intelligent data and stored config
      console.log("\n[3] Loading intelligent data...");
      const intelligentData = await getIntelligentData(tokenId);

      if (!intelligentData || intelligentData.length === 0) {
        console.log("❌ No intelligent data found");
        ctx.status(400);
        return ctx.json({ error: "No intelligent data found for this token" });
      }
      console.log("✅ Intelligent data loaded");
      console.log("   Description:", intelligentData[0].dataDescription);
      console.log("   Data Hash:", intelligentData[0].dataHash);

      // Step 4: Get stored config or use fallback
      console.log("\n[4] Loading agent config...");
      const storedConfig = getAgentConfig(tokenId);

      let result;
      if (storedConfig) {
        // Verify config hash matches on-chain
        if (!verifyConfigHash(storedConfig, intelligentData[0].dataHash)) {
          console.log("⚠️ Config hash mismatch - using fallback");
          result = await runInference({ agentType, prompt, context });
        } else {
          console.log("✅ Using stored config");
          console.log("   Model:", storedConfig.model);
          result = await runInferenceWithConfig({
            config: storedConfig,
            prompt,
            context,
          });
        }
      } else {
        console.log("⚠️ No stored config - using agentType fallback:", agentType);
        result = await runInference({ agentType, prompt, context });
      }

      if (!result.success) {
        console.log("❌ Inference failed:", result.error);
        ctx.status(500);
        return ctx.json({ error: "Inference failed", details: result.error });
      }
      console.log("✅ Inference complete");
      return ctx.json({
        success: true,
        tokenId,
        response: result.response,
        model: result.model,
        mock: result.mock || false,
        timestamp: new Date().toISOString(),
      });
    }
  )
  .get("/api/token/:tokenId", async (ctx) => {
    const tokenId = parseInt(ctx.req.param("tokenId"));

    const owner = await getTokenOwner(tokenId);
    const intelligentData = await getIntelligentData(tokenId);
    const authorizedUsers = await getAuthorizedUsers(tokenId);

    if (!owner) {
      ctx.status(404);
      return ctx.json({ error: "Token not found" });
    }

    return ctx.json({
      tokenId,
      owner,
      authorizedUsers,
      intelligentData: intelligentData || [],
    });
  });

serve(
  {
    fetch: app.fetch,
    port: config.port,
  },
  (info) => {
    console.log(`\n${"=".repeat(50)}`);
    console.log("INFT Executor Service");
    console.log(`${"=".repeat(50)}`);
    console.log(`Server running on port ${info.port}`);
    console.log(`Contract: ${config.contractAddress}`);
    console.log(`Network: ${config.ogRpcUrl}`);
    console.log(`\nEndpoints:`);
    console.log(`  GET  /health`);
    console.log(`  GET  /api/agents`);
    console.log(`  GET  /api/auth/:tokenId/:address`);
    console.log(`  GET  /api/token/:tokenId`);
    console.log(`  GET  /api/config/:tokenId`);
    console.log(`  POST /api/register        (register agent config)`);
    console.log(`  POST /api/inference`);
    console.log(`${"=".repeat(50)}\n`);
  }
);
