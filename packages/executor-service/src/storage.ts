import { keccak256, toBytes } from "viem";
import * as fs from "fs";
import * as path from "path";

const STORAGE_FILE = path.join(process.cwd(), "data", "agent-configs.json");

export interface AgentConfig {
  name: string;
  model: string;
  systemPrompt: string;
  personality: string;
  capabilities: string[];
  temperature: number;
  maxTokens: number;
  createdAt?: string;
  updatedAt?: string;
}

interface StorageData {
  configs: Record<string, AgentConfig>; // keyed by tokenId
}

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(STORAGE_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load storage from file
function loadStorage(): StorageData {
  ensureDataDir();
  if (!fs.existsSync(STORAGE_FILE)) {
    return { configs: {} };
  }
  try {
    const data = fs.readFileSync(STORAGE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { configs: {} };
  }
}

// Save storage to file
function saveStorage(data: StorageData) {
  ensureDataDir();
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
}

/**
 * Store agent config for a token
 */
export function storeAgentConfig(tokenId: number, config: Omit<AgentConfig, "createdAt" | "updatedAt">): AgentConfig {
  const storage = loadStorage();
  const now = new Date().toISOString();

  const fullConfig: AgentConfig = {
    ...config,
    createdAt: storage.configs[tokenId.toString()]?.createdAt || now,
    updatedAt: now,
  };

  storage.configs[tokenId.toString()] = fullConfig;
  saveStorage(storage);

  return fullConfig;
}

/**
 * Get agent config for a token
 */
export function getAgentConfig(tokenId: number): AgentConfig | null {
  const storage = loadStorage();
  return storage.configs[tokenId.toString()] || null;
}

/**
 * Verify config matches on-chain hash
 */
export function verifyConfigHash(config: AgentConfig, expectedHash: string): boolean {
  const configJson = JSON.stringify({
    name: config.name,
    model: config.model,
    systemPrompt: config.systemPrompt,
    personality: config.personality,
    capabilities: config.capabilities,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });
  const computedHash = keccak256(toBytes(configJson));
  return computedHash.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Compute hash for a config
 */
export function computeConfigHash(config: Omit<AgentConfig, "createdAt" | "updatedAt">): string {
  const configJson = JSON.stringify({
    name: config.name,
    model: config.model,
    systemPrompt: config.systemPrompt,
    personality: config.personality,
    capabilities: config.capabilities,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });
  return keccak256(toBytes(configJson));
}

/**
 * Delete agent config
 */
export function deleteAgentConfig(tokenId: number): boolean {
  const storage = loadStorage();
  if (storage.configs[tokenId.toString()]) {
    delete storage.configs[tokenId.toString()];
    saveStorage(storage);
    return true;
  }
  return false;
}

/**
 * List all stored configs
 */
export function listAgentConfigs(): Record<string, AgentConfig> {
  const storage = loadStorage();
  return storage.configs;
}
