import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "./config.js";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getAgentTypes, runInference } from "./inference.js";
import {
  checkAuthorization,
  getAuthorizedUsers,
  getIntelligentData,
  getTokenOwner,
  verifySignature,
} from "./auth.js";
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

      // Step 3: Get intelligent data
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

      // Step 4: Run inference
      console.log("\n[4] Running inference...");
      const result = await runInference({
        agentType,
        prompt,
        context,
      });

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
    console.log(`  POST /api/inference`);
    console.log(`${"=".repeat(50)}\n`);
  }
);
