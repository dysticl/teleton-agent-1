/**
 * Built-in module loader — discovers and registers plugin modules.
 * Unlike plugin-loader.ts (external ~/.teleton/plugins/), this handles
 * first-party modules that ship with the codebase (casino, deals, etc.)
 */

import type { PluginModule } from "./types.js";
import type { ToolRegistry } from "./registry.js";
import type { Config } from "../../config/schema.js";
import type Database from "better-sqlite3";
import casinoModule from "../../casino/module.js";

const BUILTIN_MODULES: PluginModule[] = [casinoModule];

export function loadModules(
  registry: ToolRegistry,
  config: Config,
  db: Database.Database
): PluginModule[] {
  const loaded: PluginModule[] = [];

  for (const mod of BUILTIN_MODULES) {
    try {
      // 1. Configure ALWAYS (even if module disabled)
      mod.configure?.(config);

      // 2. Migrate ALWAYS (idempotent — IF NOT EXISTS)
      mod.migrate?.(db);

      // 3. Register tools only if the module returns any
      const tools = mod.tools(config);
      for (const { tool, executor, scope } of tools) {
        registry.register(tool, executor, scope);
      }

      if (tools.length > 0) {
        console.log(`🔌 Module "${mod.name}" v${mod.version}: ${tools.length} tools`);
      }

      loaded.push(mod);
    } catch (error) {
      console.error(`❌ Module "${mod.name}" failed to load:`, error);
    }
  }

  return loaded;
}
