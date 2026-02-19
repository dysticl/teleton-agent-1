import YAML from "yaml";

const BARE_KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;

function formatKey(key: string): string {
  return BARE_KEY.test(key) ? key : JSON.stringify(key);
}

function stringifyValue(value: unknown, depth: number = 0): string {
  if (depth > 20) return JSON.stringify("[max-depth]");
  if (value === undefined) return "null";
  if (value === null) return "null";

  const type = typeof value;
  if (type === "string") return JSON.stringify(value);
  if (type === "number" || type === "boolean") return String(value);
  if (type === "bigint") return `${value.toString()}n`;

  if (Array.isArray(value)) {
    return `[${value.map((item) => stringifyValue(item, depth + 1)).join(",")}]`;
  }

  if (type === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== undefined
    );
    return `{${entries
      .map(([k, v]) => `${formatKey(k)}:${stringifyValue(v, depth + 1)}`)
      .join(",")}}`;
  }

  return JSON.stringify(String(value));
}

/**
 * TOON = compact object notation for LLM context (shorter than pretty JSON).
 * Example: {type:"tool_call",tool:"ton_get_price",params:{}}
 */
export function stringifyToon(value: unknown): string {
  return stringifyValue(value);
}

function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (const ch of input) {
    if (quote) {
      current += ch;
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }

    if (ch === "{" || ch === "[" || ch === "(") depth++;
    if (ch === "}" || ch === "]" || ch === ")") depth = Math.max(0, depth - 1);

    if ((ch === ";" || ch === "\n") && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) parts.push(trimmed);
      current = "";
      continue;
    }

    current += ch;
  }

  const tail = current.trim();
  if (tail) parts.push(tail);
  return parts;
}

function assignByPath(target: Record<string, unknown>, path: string[], value: unknown): void {
  let cur: Record<string, unknown> = target;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const next = cur[key];
    if (!next || typeof next !== "object" || Array.isArray(next)) {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
}

function parseKeyValueToon(input: string): Record<string, unknown> | null {
  const parts = splitTopLevel(input);
  if (parts.length === 0) return null;

  const out: Record<string, unknown> = {};
  let foundPair = false;

  for (const part of parts) {
    const eq = part.indexOf("=");
    const colon = part.indexOf(":");
    const idx = eq === -1 ? colon : colon === -1 ? eq : Math.min(eq, colon);

    if (idx <= 0) {
      continue;
    }

    const rawKey = part
      .slice(0, idx)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    const rawVal = part.slice(idx + 1).trim();
    if (!rawKey) continue;

    let value: unknown = rawVal;
    try {
      value = YAML.parse(rawVal);
    } catch {
      value = rawVal;
    }

    assignByPath(out, rawKey.split("."), value);
    foundPair = true;
  }

  return foundPair ? out : null;
}

/**
 * Parse structured text from either JSON or TOON-like compact syntax.
 */
export function parseJsonOrToon<T = unknown>(text: string): T {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Empty structured input");
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // fall through
  }

  try {
    return YAML.parse(trimmed) as T;
  } catch {
    // fall through
  }

  const kv = parseKeyValueToon(trimmed);
  if (kv) return kv as T;

  throw new Error("Invalid structured format. Expected JSON or TOON.");
}
