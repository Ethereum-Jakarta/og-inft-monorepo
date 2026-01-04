import { useState, useEffect, useRef, useMemo } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSignMessage } from "wagmi";
import { keccak256, toBytes, parseAbiItem, decodeEventLog } from "viem";
import toast from "react-hot-toast";
import { CONTRACTS, EXECUTOR_URL } from "../config/contracts";
import { AgentNFTAbi } from "../contracts/AgentNFT";

const AVAILABLE_MODELS = [
  { id: "qwen/qwen-2.5-7b-instruct", name: "Qwen 2.5 7B Instruct" },
  { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B Instruct" },
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B" },
  { id: "deepseek-ai/DeepSeek-V3", name: "DeepSeek V3" },
  { id: "gpt-4", name: "GPT-4" },
];

const CAPABILITY_OPTIONS = [
  "explain",
  "code",
  "analyze",
  "translate",
  "summarize",
  "creative-writing",
  "math",
  "research",
];

const PERSONALITY_PRESETS = [
  "friendly and helpful",
  "professional and concise",
  "creative and imaginative",
  "technical and precise",
  "educational and patient",
];

export function Mint() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Form fields
  const [name, setName] = useState("My AI Agent");
  const [model, setModel] = useState("qwen/qwen-2.5-7b-instruct");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
  const [personality, setPersonality] = useState("friendly and helpful");
  const [capabilities, setCapabilities] = useState<string[]>(["explain", "code"]);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const registeredRef = useRef(false);

  // Compute config object and hash
  const agentConfig = useMemo(() => ({
    name,
    model,
    systemPrompt,
    personality,
    capabilities,
    temperature,
    maxTokens,
  }), [name, model, systemPrompt, personality, capabilities, temperature, maxTokens]);

  const configHash = useMemo(() => {
    const configJson = JSON.stringify(agentConfig);
    return keccak256(toBytes(configJson));
  }, [agentConfig]);

  const toggleCapability = (cap: string) => {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
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

  // After mint success, register config with executor
  useEffect(() => {
    if (isSuccess && receipt && address && !registeredRef.current) {
      registeredRef.current = true;
      registerConfig(receipt);
    }
  }, [isSuccess, receipt, address]);

  const registerConfig = async (txReceipt: typeof receipt) => {
    if (!txReceipt || !address) return;

    try {
      // Parse Minted event from logs to get tokenId
      const mintedEvent = txReceipt.logs.find((log) => {
        try {
          const decoded = decodeEventLog({
            abi: [parseAbiItem("event Minted(uint256 indexed _tokenId, address indexed _creator, address indexed _owner)")],
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === "Minted";
        } catch {
          return false;
        }
      });

      if (!mintedEvent) {
        toast.success("INFT minted! (Config registration skipped - no event found)", { id: "mint-tx" });
        return;
      }

      const decoded = decodeEventLog({
        abi: [parseAbiItem("event Minted(uint256 indexed _tokenId, address indexed _creator, address indexed _owner)")],
        data: mintedEvent.data,
        topics: mintedEvent.topics,
      });

      const tokenId = Number(decoded.args._tokenId);

      toast.loading("Registering agent config...", { id: "mint-tx" });
      setIsRegistering(true);

      // Sign message for registration
      const timestamp = Date.now();
      const message = `Register config for token ${tokenId} at ${timestamp}`;
      const signature = await signMessageAsync({ message });

      // Register with executor
      const response = await fetch(`${EXECUTOR_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId,
          userAddress: address,
          signature,
          message,
          config: agentConfig,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          <span>
            INFT #{tokenId} minted and config registered!{" "}
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
      } else {
        toast.error(`Config registration failed: ${data.error}`, { id: "mint-tx", duration: 5000 });
      }
    } catch (err) {
      console.error("Config registration failed:", err);
      toast.success(
        <span>
          INFT minted! (Config registration failed){" "}
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
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error.message.split("\n")[0], { id: "mint-tx", duration: 5000 });
    }
  }, [error]);

  const handleMint = async () => {
    if (!address) return;

    // Reset for new mint
    registeredRef.current = false;

    try {
      const intelligentData = [
        {
          dataDescription: `${name} - AI Agent Config v1.0`,
          dataHash: configHash,
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
        {/* Agent Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Agent Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My AI Agent"
            className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">AI Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium mb-2">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            placeholder="You are a helpful AI assistant..."
            className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Personality */}
        <div>
          <label className="block text-sm font-medium mb-2">Personality</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PERSONALITY_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPersonality(p)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  personality === p
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            placeholder="Or type custom personality..."
            className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>

        {/* Capabilities */}
        <div>
          <label className="block text-sm font-medium mb-2">Capabilities</label>
          <div className="flex flex-wrap gap-2">
            {CAPABILITY_OPTIONS.map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => toggleCapability(cap)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  capabilities.includes(cap)
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Settings
        </button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Temperature: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Precise (0)</span>
                <span>Balanced (1)</span>
                <span>Creative (2)</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Tokens: {maxTokens}
              </label>
              <input
                type="range"
                min="100"
                max="4096"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Short (100)</span>
                <span>Medium (2000)</span>
                <span>Long (4096)</span>
              </div>
            </div>
          </div>
        )}

        {/* Config Preview */}
        <div className="p-4 bg-gray-900 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Config Hash</span>
            <code className="text-xs text-gray-500 font-mono">
              {configHash.slice(0, 10)}...{configHash.slice(-8)}
            </code>
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
              View JSON Config
            </summary>
            <pre className="mt-2 p-3 bg-gray-800 rounded text-xs overflow-x-auto text-gray-300">
              {JSON.stringify(agentConfig, null, 2)}
            </pre>
          </details>
        </div>

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={isPending || isConfirming || isRegistering || !name.trim()}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
        >
          {isPending
            ? "Confirming..."
            : isConfirming
            ? "Minting..."
            : isRegistering
            ? "Registering Config..."
            : "Mint INFT"}
        </button>
      </div>
    </div>
  );
}
