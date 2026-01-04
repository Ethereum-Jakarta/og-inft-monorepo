import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import toast from "react-hot-toast";
import { EXECUTOR_URL } from "../config/contracts";

interface AgentConfig {
  name: string;
  model: string;
  systemPrompt: string;
  personality: string;
  capabilities: string[];
  temperature: number;
  maxTokens: number;
}

interface Agent {
  tokenId: number;
  config: AgentConfig;
  owner: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

function AgentCard({
  agent,
  isSelected,
  onSelect,
  isAuthorized,
}: {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
  isAuthorized: boolean;
}) {
  return (
    <div
      onClick={isAuthorized ? onSelect : undefined}
      className={`p-4 rounded-xl border-2 transition cursor-pointer ${
        isSelected
          ? "border-blue-500 bg-blue-500/10"
          : isAuthorized
          ? "border-gray-700 bg-gray-800 hover:border-gray-600"
          : "border-gray-800 bg-gray-800/50 opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-lg">{agent.config.name}</h3>
          <p className="text-xs text-gray-500">Token #{agent.tokenId}</p>
        </div>
        {isAuthorized ? (
          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
            Access
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded">
            No Access
          </span>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
        {agent.config.systemPrompt}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {agent.config.capabilities.slice(0, 4).map((cap) => (
          <span
            key={cap}
            className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full"
          >
            {cap}
          </span>
        ))}
        {agent.config.capabilities.length > 4 && (
          <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
            +{agent.config.capabilities.length - 4}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{agent.config.personality}</span>
        <span className="font-mono">{agent.config.model.split("/").pop()}</span>
      </div>
    </div>
  );
}

export function Chat() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [authorizedTokens, setAuthorizedTokens] = useState<Set<number>>(new Set());
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available agents
  const fetchAgents = useCallback(async () => {
    try {
      setIsLoadingAgents(true);
      const response = await fetch(`${EXECUTOR_URL}/api/agents/registered`);
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setIsLoadingAgents(false);
    }
  }, []);

  // Check authorization for each agent
  const checkAuthorizations = useCallback(async () => {
    if (!address || agents.length === 0) return;

    const authorized = new Set<number>();
    await Promise.all(
      agents.map(async (agent) => {
        try {
          const response = await fetch(
            `${EXECUTOR_URL}/api/auth/${agent.tokenId}/${address}`
          );
          const data = await response.json();
          if (data.isAuthorized || data.isOwner) {
            authorized.add(agent.tokenId);
          }
        } catch (error) {
          console.error(`Failed to check auth for token ${agent.tokenId}:`, error);
        }
      })
    );
    setAuthorizedTokens(authorized);
  }, [address, agents]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    checkAuthorizations();
  }, [checkAuthorizations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !address || !selectedAgent || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const toastId = "chat-inference";

    try {
      toast.loading("Sign message in wallet...", { id: toastId });
      const timestamp = Date.now();
      const message = `Authorize inference for token ${selectedAgent.tokenId} at ${timestamp}`;
      const signature = await signMessageAsync({ message });

      toast.loading("Waiting for AI response...", { id: toastId });
      const response = await fetch(`${EXECUTOR_URL}/api/inference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: selectedAgent.tokenId,
          userAddress: address,
          signature,
          message,
          prompt: userMessage,
          agentType: "default",
          context: messages.slice(-10).map((m) => ({
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

  const selectAgent = (agent: Agent) => {
    if (selectedAgent?.tokenId !== agent.tokenId) {
      setSelectedAgent(agent);
      setMessages([]);
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
    <div className="flex gap-6 h-[calc(100vh-200px)] min-h-[500px]">
      {/* Agent Selection Panel */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Available Agents</h2>
          <button
            onClick={fetchAgents}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Refresh
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 [scrollbar-width:none]">
          {isLoadingAgents ? (
            <div className="text-center py-8 text-gray-500">Loading agents...</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No agents registered yet.</p>
              <p className="text-sm mt-2">Mint an INFT to get started!</p>
            </div>
          ) : (
            agents.map((agent) => (
              <AgentCard
                key={agent.tokenId}
                agent={agent}
                isSelected={selectedAgent?.tokenId === agent.tokenId}
                onSelect={() => selectAgent(agent)}
                isAuthorized={authorizedTokens.has(agent.tokenId)}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col bg-gray-800 rounded-xl overflow-hidden">
        {selectedAgent ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {selectedAgent.config.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedAgent.config.name}</h3>
                  <p className="text-xs text-gray-400">
                    {selectedAgent.config.personality} · Token #{selectedAgent.tokenId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-mono">
                    {selectedAgent.config.model.split("/").pop()}
                  </p>
                  <p className="text-xs text-gray-500">
                    temp: {selectedAgent.config.temperature}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">
                    Start a conversation with {selectedAgent.config.name}
                  </p>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    "{selectedAgent.config.systemPrompt}"
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-gray-700 text-gray-100 rounded-bl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder={`Message ${selectedAgent.config.name}...`}
                  className="flex-1 px-4 py-3 bg-gray-700 rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold transition"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select an Agent</h3>
              <p className="text-gray-500 max-w-sm">
                Choose an INFT agent from the list to start chatting. You need to be the
                owner or have authorized access.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
