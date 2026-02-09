/**
 * Casino plugin module — wraps existing casino tools into a self-contained module.
 * No business logic changes; same tools, same config, same DB.
 */

import type { PluginModule } from "../agent/tools/types.js";
import { initCasinoConfig } from "./config.js";
import {
  casinoBalanceTool,
  casinoBalanceExecutor,
  casinoSpinTool,
  casinoSpinExecutor,
  casinoDiceTool,
  casinoDiceExecutor,
  casinoLeaderboardTool,
  casinoLeaderboardExecutor,
  casinoMyStatsTool,
  casinoMyStatsExecutor,
} from "../agent/tools/casino/index.js";

const casinoModule: PluginModule = {
  name: "casino",
  version: "1.0.0",

  configure(config) {
    initCasinoConfig(config.casino);
  },

  migrate(db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS casino_users (
        telegram_id TEXT PRIMARY KEY,
        wallet_address TEXT,
        total_bets INTEGER NOT NULL DEFAULT 0,
        total_wagered REAL NOT NULL DEFAULT 0,
        total_wins INTEGER NOT NULL DEFAULT 0,
        total_losses INTEGER NOT NULL DEFAULT 0,
        total_won REAL NOT NULL DEFAULT 0,
        last_bet_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS used_transactions (
        tx_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        game_type TEXT NOT NULL,
        used_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE INDEX IF NOT EXISTS idx_used_tx_user ON used_transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_used_tx_used_at ON used_transactions(used_at);

      CREATE TABLE IF NOT EXISTS casino_cooldowns (
        user_id TEXT PRIMARY KEY,
        last_spin_at INTEGER NOT NULL
      );
    `);
  },

  tools(config) {
    if (!config.casino?.enabled) return [];
    return [
      { tool: casinoBalanceTool, executor: casinoBalanceExecutor },
      { tool: casinoSpinTool, executor: casinoSpinExecutor },
      { tool: casinoDiceTool, executor: casinoDiceExecutor },
      { tool: casinoLeaderboardTool, executor: casinoLeaderboardExecutor },
      { tool: casinoMyStatsTool, executor: casinoMyStatsExecutor },
    ];
  },
};

export default casinoModule;
