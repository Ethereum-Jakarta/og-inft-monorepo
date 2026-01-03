import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, toBytes } from "viem";
import toast from "react-hot-toast";
import { CONTRACTS } from "../config/contracts";
import { AgentNFTAbi } from "../contracts/AgentNFT";

export function Mint() {
  const { address, isConnected } = useAccount();
  const [description, setDescription] = useState("");
  const [agentConfig, setAgentConfig] = useState(
    JSON.stringify(
      {
        model: "qwen/qwen-2.5-7b-instruct",
        systemPrompt: "You are a helpful AI assistant.",
        temperature: 0.7,
        maxTokens: 500,
      },
      null,
      2
    )
  );

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Toast notifications for transaction states
  useEffect(() => {
    if (isPending) {
      toast.loading("Waiting for wallet confirmation...", { id: "mint-tx" });
    }
  }, [isPending]);

  useEffect(() => {
    if (hash && isConfirming) {
      toast.loading("Transaction submitted. Waiting for confirmation...", { id: "mint-tx" });
    }
  }, [hash, isConfirming]);

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success(
        <span>
          INFT minted successfully!{" "}
          <a
            href={`https://chainscan-galileo.0g.ai/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View tx
          </a>
        </span>,
        { id: "mint-tx", duration: 5000 }
      );
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (error) {
      toast.error(error.message.split("\n")[0], { id: "mint-tx", duration: 5000 });
    }
  }, [error]);

  const handleMint = async () => {
    if (!address) return;

    try {
      // Create data hash from the agent config
      const dataHash = keccak256(toBytes(agentConfig));

      const intelligentData = [
        {
          dataDescription: description || "AI Agent Configuration",
          dataHash,
        },
      ];

      writeContract({
        address: CONTRACTS.AgentNFT,
        abi: AgentNFTAbi,
        functionName: "mint",
        args: [intelligentData, address],
      });
    } catch (err) {
      console.error("Mint failed:", err);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
        <p className="text-gray-400">Please connect your wallet to mint INFTs</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Mint New INFT</h1>

      <div className="bg-gray-800 rounded-xl p-6 space-y-6">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="My AI Agent"
            className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Agent Config */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Agent Configuration (JSON)
          </label>
          <textarea
            value={agentConfig}
            onChange={(e) => setAgentConfig(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
          />
        </div>

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={isPending || isConfirming}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
        >
          {isPending
            ? "Confirming..."
            : isConfirming
            ? "Minting..."
            : "Mint INFT"}
        </button>
      </div>
    </div>
  );
}
