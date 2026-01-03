import { config } from "./config.js";

// Agent configurations (in production, decrypt from storage)
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
 * Run inference with 0G Compute
 */
export async function runInference(params: { agentType: keyof typeof agentConfigs, prompt: string, context: { role: string, content: string }[] }) {
    const { agentType = 'default', prompt, context = [] } = params;

    // Get agent config
    const agentConfig = agentConfigs[agentType] || agentConfigs.default;

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
            response: generateMockResponse(agentType, prompt),
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
 * Generate mock response for demo
 */
function generateMockResponse(agentType: keyof typeof agentConfigs, prompt: string) {
    const responses = {
        default: `I received your question: "${prompt.substring(0, 50)}..."

This is a demo response from the INFT executor service. In production, this would be powered by 0G Compute with real AI inference.

Key points about INFT:
1. Your authorization was verified on-chain
2. The agent configuration was loaded
3. AI inference was processed
4. Response delivered securely`,

        web3Expert: `[Web3 Expert Agent]

Regarding your question about "${prompt.substring(0, 30)}...":

Here's a technical explanation:

1. **Smart Contract Perspective**:
   The INFT system uses ERC-7857 standard which extends ERC-721 with encrypted metadata capabilities.

2. **Security Model**:
   - On-chain authorization verification
   - Encrypted AI configurations
   - Secure re-encryption on transfer

3. **Code Example**:
\`\`\`solidity
function isAuthorized(uint256 tokenId, address user)
    public view returns (bool) {
    return ownerOf(tokenId) == user ||
           usageAuths[tokenId][user].isActive;
}
\`\`\`

This is a demo response. Real inference powered by 0G Compute coming soon!`,

        creativAssistant: `✨ [Creative Assistant Agent]

Your prompt sparked some creative thoughts about "${prompt.substring(0, 30)}...":

🎨 **Creative Concept:**
Imagine a world where NFTs aren't just static images, but living, breathing AI companions that grow and evolve with their owners.

📝 **Story Hook:**
"The moment I transferred the INFT, I felt a strange connection break. My AI companion of three years now belonged to someone else..."

💡 **Marketing Angle:**
"Own more than art. Own intelligence. INFT - Where AI meets NFT."

This is a demo response showcasing the creative agent's personality!`
    };

    return responses[agentType] || responses.default;
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