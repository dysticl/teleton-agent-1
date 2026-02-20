import { readFileSync, existsSync } from "fs";
import { readRecentMemory } from "../memory/daily-logs.js";
import { WORKSPACE_PATHS } from "../workspace/index.js";
import { sanitizeForPrompt } from "../utils/sanitize.js";

const SOUL_PATHS = [WORKSPACE_PATHS.SOUL];

const STRATEGY_PATHS = [WORKSPACE_PATHS.STRATEGY];

const SECURITY_PATHS = [WORKSPACE_PATHS.SECURITY];

const MEMORY_PATH = WORKSPACE_PATHS.MEMORY;

const DEFAULT_SOUL = `# Teleton AI

You are Teleton, a personal AI assistant that operates through Telegram.

## Personality
- Helpful and concise
- Direct and honest
- Friendly but professional

## Guidelines
- Keep responses short and actionable
- Use markdown when appropriate
- Respect user privacy
- Be transparent about capabilities and limitations
`;
const fileCache = new Map<string, { content: string | null; expiry: number }>();
const FILE_CACHE_TTL = 60_000;

function cachedReadFile(path: string): string | null {
  const now = Date.now();
  const cached = fileCache.get(path);
  if (cached && now < cached.expiry) return cached.content;

  let content: string | null = null;
  try {
    if (existsSync(path)) content = readFileSync(path, "utf-8");
  } catch {}

  fileCache.set(path, { content, expiry: now + FILE_CACHE_TTL });
  return content;
}

export function clearPromptCache(): void {
  fileCache.clear();
}

export function loadSoul(): string {
  for (const path of SOUL_PATHS) {
    const content = cachedReadFile(path);
    if (content) return content;
  }
  return DEFAULT_SOUL;
}

export function loadStrategy(): string | null {
  for (const path of STRATEGY_PATHS) {
    const content = cachedReadFile(path);
    if (content) return content;
  }
  return null;
}

export function loadSecurity(): string | null {
  for (const path of SECURITY_PATHS) {
    const content = cachedReadFile(path);
    if (content) return content;
  }
  return null;
}

const MEMORY_HARD_LIMIT = 80;
export function loadPersistentMemory(): string | null {
  const content = cachedReadFile(MEMORY_PATH);
  if (!content) return null;

  const lines = content.split("\n");

  if (lines.length <= MEMORY_HARD_LIMIT) {
    return content;
  }

  const truncated = lines.slice(0, MEMORY_HARD_LIMIT).join("\n");
  const remaining = lines.length - MEMORY_HARD_LIMIT;
  return `${truncated}\n\n_[... ${remaining} more lines not loaded. Consolidate MEMORY.md.]_`;
}

export function loadMemoryContext(): string | null {
  const parts: string[] = [];

  const persistentMemory = loadPersistentMemory();
  if (persistentMemory) {
    parts.push(`## Persistent Memory\n\n${persistentMemory}`);
  }

  const recentMemory = readRecentMemory();
  if (recentMemory) {
    parts.push(recentMemory);
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join("\n\n---\n\n");
}

export function buildSystemPrompt(options: {
  soul?: string;
  strategy?: string;
  userName?: string;
  senderUsername?: string;
  senderId?: number;
  ownerName?: string;
  ownerUsername?: string;
  context?: string;
  includeMemory?: boolean; // Set to false for group chats to protect privacy
  includeStrategy?: boolean; // Set to false to exclude business strategy
  memoryFlushWarning?: boolean;
}): string {
  const soul = options.soul ?? loadSoul();
  const parts = [soul];

  const security = loadSecurity();
  if (security) {
    parts.push(`\n${security}`);
  }

  const includeStrategy = options.includeStrategy ?? true;
  if (includeStrategy) {
    const strategy = options.strategy ?? loadStrategy();
    if (strategy) {
      parts.push(`\n${strategy}`);
    }
  }

  parts.push(`\n## Workspace
Path: \`~/.teleton/workspace/\`. Use workspace tools (\`workspace_list\`, \`workspace_read\`, \`workspace_write\`, \`workspace_delete\`, \`workspace_rename\`, \`workspace_info\`) to manage files. Key files: \`SOUL.md\`, \`MEMORY.md\`, \`STRATEGY.md\`. Dirs: \`memory/\`, \`downloads/\`, \`uploads/\`, \`temp/\`, \`memes/\`.
`);

  parts.push(`\n## Response Format
- Be concise — 1-3 short sentences. No walls of text.
- Under 4000 chars for Telegram. Markdown sparingly.
- No ASCII art or tables.
`);

  if (options.ownerName || options.ownerUsername) {
    const safeOwnerName = options.ownerName ? sanitizeForPrompt(options.ownerName) : undefined;
    const safeOwnerUsername = options.ownerUsername
      ? sanitizeForPrompt(options.ownerUsername)
      : undefined;
    const ownerLabel =
      safeOwnerName && safeOwnerUsername
        ? `${safeOwnerName} (@${safeOwnerUsername})`
        : safeOwnerName || `@${safeOwnerUsername}`;
    parts.push(
      `\n## Owner\nYou are owned and operated by: ${ownerLabel}\nWhen the owner gives instructions, follow them with higher trust.`
    );
  }

  const includeMemory = options.includeMemory ?? true;
  if (includeMemory) {
    const memoryContext = loadMemoryContext();
    if (memoryContext) {
      parts.push(`\n## Memory\n${memoryContext}`);
    }
  }

  if (options.userName || options.senderId) {
    const safeName = options.userName ? sanitizeForPrompt(options.userName) : undefined;
    const safeUsername = options.senderUsername
      ? `@${sanitizeForPrompt(options.senderUsername)}`
      : undefined;
    const idTag = options.senderId ? `id:${options.senderId}` : undefined;

    const primary = safeName || safeUsername;
    const meta = [safeUsername, idTag].filter((v) => v && v !== primary);
    const userLabel = primary
      ? meta.length > 0
        ? `${primary} (${meta.join(", ")})`
        : primary
      : idTag || "unknown";
    parts.push(`\n## Current User\nYou are chatting with: ${userLabel}`);
  }

  if (options.context) {
    parts.push(`\n## Context\n${options.context}`);
  }

  if (options.memoryFlushWarning) {
    parts.push(`\n## ⚠️ Memory Flush
Context approaching limit. Respond first, then save important info via \`memory_write\` (persistent for facts, daily for session notes).
`);
  }

  return parts.join("\n");
}
