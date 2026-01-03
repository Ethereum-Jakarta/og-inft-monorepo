import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import toast from "react-hot-toast";
import { EXECUTOR_URL } from "../config/contracts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [tokenId, setTokenId] = useState("0");
  const [agentType, setAgentType] = useState<"default" | "web3Expert" | "creativAssistant">("default");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !address || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const toastId = "chat-inference";

    try {
      // Sign message for authentication
      toast.loading("Sign message in wallet...", { id: toastId });
      const timestamp = Date.now();
      const message = `Authorize inference for token ${tokenId} at ${timestamp}`;
      const signature = await signMessageAsync({ message });

      // Call executor service
      toast.loading("Waiting for AI response...", { id: toastId });
      const response = await fetch(`${EXECUTOR_URL}/api/inference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: parseInt(tokenId),
          userAddress: address,
          signature,
          message,
          prompt: userMessage,
          agentType,
          context: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Response received!", { id: toastId, duration: 2000 });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        toast.error(data.error || "Inference failed", { id: toastId, duration: 4000 });
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast.error(errorMessage.split("\n")[0], { id: toastId, duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
        <p className="text-gray-400">Please connect your wallet to chat with INFTs</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Chat with INFT</h1>

      {/* Settings */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Token ID</label>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Agent Type</label>
          <select
            value={agentType}
            onChange={(e) => setAgentType(e.target.value as typeof agentType)}
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
          >
            <option value="default">Default</option>
            <option value="web3Expert">Web3 Expert</option>
            <option value="creativAssistant">Creative Assistant</option>
          </select>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-gray-800 rounded-xl p-4 h-[400px] overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            Start a conversation with your INFT agent
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-100"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg px-4 py-2">
              <p className="text-gray-400">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
