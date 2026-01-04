import { config } from "./config.js";
import type { AgentConfig } from "./storage.js";

// Agent configurations (fallback when no stored config)
const agentConfigs = {
    default: {
        model: 'qwen/qwen-2.5-7b-instruct',
        systemPrompt: 'You are a helpful AI assistant.',
        temperature: 0.7,
        maxTokens: 500
    },
    web3Expert: {
        model: 'qwen/qwen-2.5-7b-instruct',
        systemPrompt: `You are a Web3 expert assistant. You help developers understand:
- Smart contract development
- DeFi protocols
- NFT standards
- Blockchain architecture
Always provide clear, technical explanations with code examples when relevant.`,
        temperature: 0.5,
        maxTokens: 1000
    },
    creativAssistant: {
        model: 'qwen/qwen-2.5-7b-instruct',
        systemPrompt: `You are a creative AI assistant that helps with:
- Content creation
- Storytelling
- Marketing copy
- Creative brainstorming
Be imaginative and engaging in your responses.`,
        temperature: 0.9,
        maxTokens: 800
    }
} as const;

/**
 * Run inference with stored INFT config
 */
export async function runInferenceWithConfig(params: {
    config: AgentConfig,
    prompt: string,
    context: { role: string, content: string }[]
}) {
    const { config: agentConfig, prompt, context = [] } = params;
    return executeInference(agentConfig, prompt, context);
}

/**
 * Run inference with preset agent type (fallback)
 */
export async function runInference(params: { agentType: keyof typeof agentConfigs, prompt: string, context: { role: string, content: string }[] }) {
    const { agentType = 'default', prompt, context = [] } = params;

    // Get agent config
    const agentConfig = agentConfigs[agentType] || agentConfigs.default;
    return executeInference(agentConfig, prompt, context);
}

/**
 * Core inference execution
 */
async function executeInference(
    agentConfig: { model: string; systemPrompt: string; temperature: number; maxTokens: number },
    prompt: string,
    context: { role: string; content: string }[]
) {

    // Build messages
    const messages = [
        { role: 'system', content: agentConfig.systemPrompt },
        ...context,
        { role: 'user', content: prompt }
    ];

    // In production: Call 0G Compute API
    // For demo: Using mock or alternative API

    try {
        // Option 1: 0G Compute API (when available)
        if (config.ogApiKey && config.ogComputeUrl) {
            const response = await fetch(`${config.ogComputeUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.ogApiKey}`
                },
                body: JSON.stringify({
                    model: agentConfig.model,
                    messages: messages,
                    temperature: agentConfig.temperature,
                    max_tokens: agentConfig.maxTokens
                })
            });

            const data = await response.json();
            console.log(data)
            return {
                success: true,
                response: data.choices[0].message.content,
                model: agentConfig.model,
                usage: data.usage
            };
        }

        // Option 2: Mock response for demo
        return {
            success: true,
            response: generateMockResponseFromConfig(agentConfig, prompt),
            model: agentConfig.model,
            mock: true
        };

    } catch (error) {
        console.error('Inference failed:', error);
        return {
            success: false,
            error: (error as Error).message
        };
    }
}

/**
 * Generate mock response based on config
 */
function generateMockResponseFromConfig(
    agentConfig: { model: string; systemPrompt: string; temperature: number; maxTokens: number },
    prompt: string
) {
    const systemPromptPreview = agentConfig.systemPrompt.substring(0, 100);

    return `[INFT Agent - ${agentConfig.model}]

Regarding your question: "${prompt.substring(0, 50)}..."

**Agent Configuration:**
- Model: ${agentConfig.model}
- Temperature: ${agentConfig.temperature}
- Max Tokens: ${agentConfig.maxTokens}
- System Prompt: "${systemPromptPreview}..."

**Response:**
This is a demo response from your INFT agent. In production with 0G Compute configured, you would receive a real AI-generated response based on your agent's system prompt.

Your request was successfully:
1. Verified on-chain (authorization check passed)
2. Matched to your stored agent configuration
3. Processed through the inference pipeline

To enable real AI responses, configure OG_COMPUTE_URL and OG_COMPUTE_API_KEY in the executor service.`;
}

type AgentConfigs = typeof agentConfigs
/**
 * Get available agent types
 */
export function getAgentTypes(): { [K in keyof AgentConfigs]: {
    id: K,
    name: AgentConfigs[K]['model'],
    description: string,
} }[keyof AgentConfigs][]  {
    // @ts-expect-error
    return Object.keys(agentConfigs).map(key => ({
        id: key,
        // @ts-expect-error
        name: agentConfigs[key].model,
        // @ts-expect-error
        description: agentConfigs[key].systemPrompt.substring(0, 100) + '...'
    }));
}