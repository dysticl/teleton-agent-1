import {
  complete,
  getModel,
  type Model,
  type Api,
  type Context,
  type UserMessage,
  type AssistantMessage,
  type Message,
  type Tool,
} from "@mariozechner/pi-ai";
import type { AgentConfig } from "../config/schema.js";
import { appendToTranscript, readTranscript } from "../session/transcript.js";
import { getProviderMetadata, type SupportedProvider } from "../config/providers.js";
import { sanitizeToolsForGemini } from "./schema-sanitizer.js";

export function isOAuthToken(apiKey: string, provider?: string): boolean {
  if (provider && provider !== "anthropic") return false;
  return apiKey.startsWith("sk-ant-oat01-");
}

const modelCache = new Map<string, Model<Api>>();

/**
 * Known DeepSeek models with their metadata
 */
const DEEPSEEK_MODELS: Record<string, Partial<Model<Api>>> = {
  "deepseek-chat": {
    name: "DeepSeek V3",
    contextWindow: 65536,
    maxTokens: 8192,
    reasoning: false,
  },
  "deepseek-reasoner": {
    name: "DeepSeek R1",
    contextWindow: 65536,
    maxTokens: 8192,
    reasoning: true,
  },
};

/**
 * Create a manual model object for OpenAI-compatible providers not in pi-ai registry.
 */
function createCustomModel(provider: string, modelId: string, baseUrl: string): Model<Api> {
  const known = DEEPSEEK_MODELS[modelId];
  return {
    id: modelId,
    name: known?.name || modelId,
    api: "openai-completions" as Api,
    provider,
    baseUrl,
    reasoning: known?.reasoning ?? false,
    input: ["text"] as any,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: known?.contextWindow ?? 65536,
    maxTokens: known?.maxTokens ?? 8192,
  } as Model<Api>;
}

/**
 * Get a model from any supported provider via pi-ai
 */
export function getProviderModel(
  provider: SupportedProvider,
  modelId: string,
  baseUrl?: string
): Model<Api> {
  const cacheKey = `${provider}:${modelId}`;
  const cached = modelCache.get(cacheKey);
  if (cached) return cached;

  const meta = getProviderMetadata(provider);

  // For providers not in pi-ai (e.g. deepseek), create a custom model object
  if (provider === "deepseek") {
    const url = baseUrl || "https://api.deepseek.com";
    const model = createCustomModel(provider, modelId, url);
    modelCache.set(cacheKey, model);
    return model;
  }

  try {
    let model = getModel(meta.piAiProvider as any, modelId as any);
    // Allow overriding base URL for any provider
    if (baseUrl) {
      model = { ...model, baseUrl };
    }
    if (!model) {
      throw new Error(`getModel returned undefined for ${provider}/${modelId}`);
    }
    modelCache.set(cacheKey, model);
    return model;
  } catch (e) {
    // If a custom base_url is set, create a manual model instead of failing
    if (baseUrl) {
      const model = createCustomModel(provider, modelId, baseUrl);
      modelCache.set(cacheKey, model);
      return model;
    }
    // Fallback to provider's default model
    console.warn(
      `Model ${modelId} not found for ${provider}, falling back to ${meta.defaultModel}`
    );
    const fallbackKey = `${provider}:${meta.defaultModel}`;
    const fallbackCached = modelCache.get(fallbackKey);
    if (fallbackCached) return fallbackCached;

    try {
      const model = getModel(meta.piAiProvider as any, meta.defaultModel as any);
      if (!model) {
        throw new Error(
          `Fallback model ${meta.defaultModel} also returned undefined for ${provider}`
        );
      }
      modelCache.set(fallbackKey, model);
      return model;
    } catch {
      throw new Error(
        `Could not find model ${modelId} or fallback ${meta.defaultModel} for ${provider}`
      );
    }
  }
}

export function getUtilityModel(provider: SupportedProvider, overrideModel?: string): Model<Api> {
  const meta = getProviderMetadata(provider);
  const modelId = overrideModel || meta.utilityModel;
  return getProviderModel(provider, modelId);
}

export interface ChatOptions {
  systemPrompt?: string;
  context: Context;
  sessionId?: string;
  maxTokens?: number;
  temperature?: number;
  persistTranscript?: boolean;
  tools?: Tool[];
}

export interface ChatResponse {
  message: AssistantMessage;
  text: string;
  context: Context;
}

export async function chatWithContext(
  config: AgentConfig,
  options: ChatOptions
): Promise<ChatResponse> {
  const provider = (config.provider || "anthropic") as SupportedProvider;
  const model = getProviderModel(provider, config.model, (config as any).base_url);

  const tools =
    provider === "google" && options.tools ? sanitizeToolsForGemini(options.tools) : options.tools;

  const context: Context = {
    ...options.context,
    systemPrompt: options.systemPrompt || options.context.systemPrompt,
    tools,
  };

  const response = await complete(model, context, {
    apiKey: config.api_key,
    maxTokens: options.maxTokens ?? config.max_tokens,
    temperature: options.temperature ?? config.temperature,
    sessionId: options.sessionId,
  });

  if (options.persistTranscript && options.sessionId) {
    appendToTranscript(options.sessionId, response);
  }

  const textContent = response.content.find((block) => block.type === "text");
  const text = textContent?.type === "text" ? textContent.text : "";

  const updatedContext: Context = {
    ...context,
    messages: [...context.messages, response],
  };

  return {
    message: response,
    text,
    context: updatedContext,
  };
}

export function loadContextFromTranscript(sessionId: string, systemPrompt?: string): Context {
  const messages = readTranscript(sessionId) as Message[];

  return {
    systemPrompt,
    messages,
  };
}

export function createClient(_config: AgentConfig): null {
  return null;
}
