<h1 align="center">Teleton Agent (Modified Fork)</h1>

<p align="center"><b>Custom fork of Teleton with DeepSeek support, TOON format, Miratext SEO plugin, Playwright market scraper, and enhanced plugin loading</b></p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen" alt="Node.js"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-blue" alt="TypeScript"></a>
  <a href="https://github.com/TONresistor/teleton-agent"><img src="https://img.shields.io/badge/upstream-TONresistor%2Fteleton--agent-blue" alt="Upstream"></a>
</p>

---

> **This is a modified fork** of [TONresistor/teleton-agent](https://github.com/TONresistor/teleton-agent) (v0.6.0).
> It includes custom features not available in the upstream version.

### What's Different in This Fork

| Feature | Upstream | This Fork |
|---------|----------|-----------|
| **LLM Providers** | 6 (Anthropic, OpenAI, Google, xAI, Groq, OpenRouter) | **7** — adds **DeepSeek** as native provider |
| **Custom Base URL** | Not supported | `base_url` config option for any OpenAI-compatible endpoint |
| **TOON Format** | Not available | Custom serialization format for structured agent data (tasks, observations) |
| **Miratext Plugin** | Not included | SEO text analysis plugin (LSI words, competitor analysis, copywriting orders) |
| **Plugin Loading** | `~/.teleton/plugins/` only | Also loads from `./plugins/` (project-local, for development) |
| **Market Scraper** | Missing dependency | Includes Playwright + Chromium for gift market data scraping |
| **Security** | Standard `.gitignore` | Hardened `.gitignore` — plugins, API keys, secrets files excluded |
| **Tool Optimization** | All 66 Telegram tools enabled | Gift-focused: disabled stickers, polls, folders, stars, stories, profile (saves 21 tool slots) |
| **Tool RAG** | Disabled by default | Enabled with `gift_*` always-include patterns for reliable gift tool selection |

### Key Highlights

- **Full Telegram access** — operates as a real user via MTProto (GramJS), not a limited bot
- **Agentic loop** — up to 5 iterations of tool calling per message
- **7 LLM Providers** — Anthropic, OpenAI, Google Gemini, xAI Grok, Groq, OpenRouter, **DeepSeek**
- **TON Blockchain** — W5R1 wallet, send/receive TON & jettons, swap on STON.fi and DeDust, NFTs, DNS
- **Persistent memory** — hybrid RAG (sqlite-vec + FTS5), auto-compaction, daily logs
- **90+ built-in tools** — messaging, media, gifts, blockchain, DEX trading, deals, DNS, journaling
- **Plugin SDK** — extend with custom tools, isolated databases, secrets management
- **MCP Client** — connect external tool servers (stdio/SSE) with 2 lines of YAML
- **WebUI Dashboard** — optional browser-based control panel (`--webui`)

---

## Для Кирилла

Привет, Кирилл! Вот пошаговая инструкция, как запустить Telegram-агента на твоём ПК.

### Что тебе понадобится

1. **Node.js 20+** — https://nodejs.org/ → скачать и установить версию LTS  
2. **Git** — https://git-scm.com/download/win → установить с настройками по умолчанию  
3. **Google Gemini API Key** (бесплатно) — https://aistudio.google.com/ → создать API-ключ  
4. **Telegram API ID + Hash** — https://my.telegram.org/apps → войти через аккаунт Telegram, который будешь использовать для бота  
5. **Твой Telegram User-ID** — написать боту https://t.me/userinfobot, он ответит с твоим ID  

> ⚠️ **Важно**: используй **отдельный Telegram-аккаунт** для бота, а не основной! Агент получает полный контроль над аккаунтом.

### Установка (Windows PowerShell)

```powershell
# 1. Клонировать репозиторий
cd ~\Desktop
git clone https://github.com/dysticl/teleton-agent.git
cd teleton-agent

# 2. Установить зависимости
npm install

# 3. Собрать проект
npm run build

# 4. Установить глобально (чтобы команда 'teleton' работала)
npm link

# 5. Запустить мастер настройки
teleton setup
```

Мастер настройки спросит у тебя:
	•	LLM Provider → выбрать google
	•	API Key → твой Google Gemini ключ (AIza...)
	•	Model → gemini-2.0-flash
	•	Telegram API ID → с my.telegram.org
	•	Telegram API Hash → с my.telegram.org
	•	Телефон → с кодом страны (например, +49170... или +7...)
	•	Код подтверждения → придёт в Telegram
	•	Admin User-ID → твой Telegram ID (от @userinfobot)

Установка плагинов

Плагины устанавливаются отдельно и добавляют боту дополнительные функции (статистика подарков, крипто-цены и т.д.):

```powershell
# Клонировать репозиторий с плагинами (временно)
cd ~\Desktop
git clone https://github.com/TONresistor/teleton-plugins.git

# Создать папку для плагинов
mkdir -Force "$HOME\.teleton\plugins"

# Скопировать основные плагины
Copy-Item -Recurse ~\Desktop\teleton-plugins\plugins\tonapi "$HOME\.teleton\plugins\tonapi"
Copy-Item -Recurse ~\Desktop\teleton-plugins\plugins\giftstat "$HOME\.teleton\plugins\giftstat"
Copy-Item -Recurse ~\Desktop\teleton-plugins\plugins\crypto-prices "$HOME\.teleton\plugins\crypto-prices"
Copy-Item -Recurse ~\Desktop\teleton-plugins\plugins\geckoterminal "$HOME\.teleton\plugins\geckoterminal"
Copy-Item -Recurse ~\Desktop\teleton-plugins\plugins\dyor "$HOME\.teleton\plugins\dyor"
Copy-Item -Recurse ~\Desktop\teleton-plugins\plugins\fragment "$HOME\.teleton\plugins\fragment"

# Установить зависимости для плагинов
cd "$HOME\.teleton\plugins\tonapi" ; npm install ; cd ~\Desktop\teleton-agent
cd "$HOME\.teleton\plugins\giftstat" ; npm install ; cd ~\Desktop\teleton-agent
cd "$HOME\.teleton\plugins\dyor" ; npm install ; cd ~\Desktop\teleton-agent
cd "$HOME\.teleton\plugins\geckoterminal" ; npm install ; cd ~\Desktop\teleton-agent
```

### Запуск

```powershell
cd ~\Desktop\teleton-agent

# Обычный запуск
teleton start

# С веб-интерфейсом (рекомендуется)
teleton start --webui
```

Когда бот запустится, отправь ему в Telegram команду /ping — он должен ответить “Pong!”.

### Если что-то не работает

| Problem | Lösung |
|---------|--------|
| `npm install` Fehler mit C++ | PowerShell als Admin: `npm install -g windows-build-tools` |
| Bot antwortet nicht | `/resume` an den Bot schicken, oder `teleton start` neustarten |
| Telegram Session abgelaufen | `del $HOME\.teleton\telegram_session.txt` und neustarten |
| WebUI Flag unbekannt | `npm run build` nochmal ausführen |

---

## Features

### Tool Categories

| Category      | Tools | Description                                                                                                        |
| ------------- | ----- | ------------------------------------------------------------------------------------------------------------------ |
| Telegram      | 48    | Messaging, media, chats, groups, gifts, contacts, memory, tasks (stickers, polls, folders, stars, stories, profile disabled) |
| TON & Jettons | 15    | W5R1 wallet, send/receive TON & jettons, balances, prices, holders, history, charts, NFTs, smart DEX router        |
| STON.fi DEX   | 5     | Swap, quote, search, trending tokens, liquidity pools                                                              |
| DeDust DEX    | 5     | Swap, quote, pools, prices, token analytics (holders, top traders, buy/sell tax)                                   |
| TON DNS       | 7     | Domain auctions, bidding, linking/unlinking, resolution, availability checks                                       |
| Deals         | 5     | P2P escrow with inline buttons, on-chain payment verification, anti double-spend                                   |
| Journal       | 3     | Trade/operation logging with P&L tracking and natural language queries                                             |
| Web           | 2     | Web search and page extraction via Tavily (search, fetch/extract)                                                  |
| Workspace     | 6     | Sandboxed file operations with path traversal protection                                                           |

### Advanced Capabilities

| Capability              | Description                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Multi-Provider LLM**  | Switch between Anthropic, OpenAI, Google, xAI, Groq, OpenRouter, DeepSeek with one config change. Custom `base_url` supported |
| **RAG + Hybrid Search** | Local ONNX embeddings (384d) or Voyage AI (512d/1024d) with FTS5 keyword + sqlite-vec cosine similarity, fused via RRF      |
| **Auto-Compaction**     | AI-summarized context management prevents overflow, preserves key information in `memory/*.md` files                        |
| **Observation Masking** | Compresses old tool results to one-line summaries, saving ~90% context window                                               |
| **Plugin SDK**          | Frozen namespaced SDK (`sdk.ton`, `sdk.telegram`, `sdk.secrets`, `sdk.storage`) with isolated databases and lifecycle hooks |
| **Smart DEX Router**    | `dex_quote` compares STON.fi vs DeDust in parallel, recommends the best rate                                                |
| **Vision Analysis**     | Image understanding via multimodal LLM (utility model)                                                                      |
| **Scheduled Tasks**     | Time-based task execution with DAG dependency resolution                                                                    |
| **Message Debouncing**  | Intelligent batching of rapid group messages (DMs are always instant)                                                       |
| **Daily Logs**          | Automatic session summaries preserved across resets                                                                         |
| **Multi-Policy Access** | Configurable DM/group policies (open, allowlist, pairing, disabled) with per-group module permissions                       |
| **Tool RAG**            | Semantic tool selection - sends only the top-K most relevant tools per message (hybrid vector + FTS5, configurable `top_k`, `always_include` patterns) |
| **MCP Client**          | Connect external MCP tool servers (stdio or SSE) - auto-discovery, namespaced tools, managed via CLI or WebUI               |
| **Sandboxed Workspace** | Secure file system with recursive URL decoding, symlink detection, and immutable config files                               |

---

## Prerequisites

Before you start, you need to get a few things ready:

| What | Where to get it | Notes |
|------|-----------------|-------|
| **Node.js 20+** | [nodejs.org](https://nodejs.org/) | Download the LTS version. Check with `node --version` |
| **Git** | [git-scm.com](https://git-scm.com/) | Windows: use the installer, it includes Git Bash |
| **LLM API Key** | See table below | At least one is required |
| **Telegram Account** | A **dedicated** account recommended | The agent has full control over it |
| **Telegram API ID + Hash** | [my.telegram.org/apps](https://my.telegram.org/apps) | Log in with the dedicated account |
| **Your Telegram User ID** | [@userinfobot](https://t.me/userinfobot) on Telegram | Send any message, it replies with your ID |

### Where to Get an LLM API Key

| Provider | Free Tier? | Console | Key Format |
|----------|-----------|---------|------------|
| **DeepSeek** | Very cheap ($0.14/M tokens) | [platform.deepseek.com](https://platform.deepseek.com/api_keys) | `sk-...` |
| **Google Gemini** | Free tier available | [aistudio.google.com](https://aistudio.google.com/) | `AIza...` |
| **Groq** | Free tier (rate-limited) | [console.groq.com](https://console.groq.com/) | `gsk_...` |
| **OpenRouter** | Pay-per-use, many models | [openrouter.ai](https://openrouter.ai/) | `sk-or-...` |
| **Anthropic** | No free tier | [console.anthropic.com](https://console.anthropic.com/) | `sk-ant-...` |
| **OpenAI** | No free tier | [platform.openai.com](https://platform.openai.com/) | `sk-...` |
| **xAI (Grok)** | No free tier | [console.x.ai](https://console.x.ai/) | `xai-...` |

> **Tip for getting started cheap**: DeepSeek or Groq are the cheapest options. Google Gemini has a free tier.

> **Security Warning**: The agent will have full control over the Telegram account. **Never use your main Telegram account.** Create a new one.

---

## Installation (Step-by-Step)

### Windows

1. **Install Node.js 20+**
   - Download from [nodejs.org](https://nodejs.org/) (LTS version)
   - Run the installer, check "Add to PATH"
   - Open **PowerShell** and verify:
     ```powershell
     node --version
     # Should show v20.x.x or higher
     ```

2. **Install Git**
   - Download from [git-scm.com](https://git-scm.com/download/win)
   - Run the installer with default settings
   - Verify:
     ```powershell
     git --version
     ```

3. **Clone this repository**
   ```powershell
   cd ~\Desktop
   git clone https://github.com/dysticl/teleton-agent.git
   cd teleton-agent
   ```

4. **Install dependencies**
   ```powershell
   npm install
   ```

5. **Build the project**
   ```powershell
   npm run build
   ```

6. **Install globally** (so `teleton` command works from anywhere)
   ```powershell
   npm link
   ```

7. **Run setup**
   ```powershell
   teleton setup
   ```
   The wizard will ask for:
   - LLM provider + API key
   - Telegram API ID, API Hash, phone number
   - Verification code (sent to your Telegram)
   - Your Telegram User ID (for admin rights)

8. **Start the agent**
   ```powershell
   teleton start
   ```
   With WebUI dashboard:
   ```powershell
   teleton start --webui
   ```

### macOS / Linux

```bash
# 1. Clone
git clone https://github.com/dysticl/teleton-agent.git
cd teleton-agent

# 2. Install + build
npm install && npm run build

# 3. Install globally
npm link

# 4. Setup (interactive wizard)
teleton setup

# 5. Start
teleton start

# With WebUI:
teleton start --webui
```

---

## Where Do API Keys Go?

All keys are stored in `~/.teleton/config.yaml` (created by `teleton setup`).

| OS | Config location |
|----|-----------------|
| **Windows** | `C:\Users\YOUR_NAME\.teleton\config.yaml` |
| **macOS** | `/Users/YOUR_NAME/.teleton/config.yaml` |
| **Linux** | `/home/YOUR_NAME/.teleton/config.yaml` |

### config.yaml Structure

After running `teleton setup`, the file looks like this. You can edit it manually later:

```yaml
agent:
  provider: "deepseek"                # anthropic | openai | google | xai | groq | openrouter | deepseek
  api_key: "sk-your-key-here"         # Your LLM API key
  # base_url: "https://api.deepseek.com"  # Custom API endpoint (optional)
  model: "deepseek-chat"              # Model ID
  max_tokens: 4096
  temperature: 0.7
  max_agentic_iterations: 5

telegram:
  api_id: 12345678                    # From my.telegram.org/apps
  api_hash: "your_api_hash_here"      # From my.telegram.org/apps
  phone: "+491701234567"              # Phone number with country code
  admin_ids: [123456789]              # Your Telegram User ID
  owner_name: "Your Name"
  owner_username: "your_telegram_username"
  dm_policy: "open"                   # open | allowlist | pairing | disabled
  group_policy: "open"                # open | allowlist | disabled
  require_mention: true               # In groups, only respond when @mentioned

# Optional keys — add them later if needed:
# tavily_api_key: "tvly-..."          # For web search (tavily.com)
# tonapi_key: "..."                   # For TON blockchain (higher rate limits)

# WebUI dashboard (optional):
# webui:
#   enabled: true
#   port: 7777
```

### Setting Keys via CLI

You can also set keys without editing the file:

```bash
teleton config set tavily_api_key
teleton config set tonapi_key
teleton config list           # Show all configured keys
```

### Environment Variables

You can also pass keys via environment variables (useful for Docker):

| Variable | Description |
|----------|-------------|
| `TELETON_API_KEY` | LLM API key (overrides config) |
| `TELETON_TG_API_ID` | Telegram API ID |
| `TELETON_TG_API_HASH` | Telegram API Hash |
| `TELETON_TG_PHONE` | Phone number |
| `TELETON_TAVILY_API_KEY` | Tavily web search key |
| `TELETON_TONAPI_KEY` | TonAPI key |
| `TELETON_WEBUI_ENABLED` | Enable WebUI (`true` / `false`) |
| `TELETON_WEBUI_PORT` | WebUI port (default: `7777`) |
| `TELETON_HOME` | Data directory (default: `~/.teleton`) |

---

## Verify It Works

After `teleton start`, send messages to the agent on Telegram:

```
You: /ping
Agent: Pong! I'm alive.

You: /status
Agent: [Shows uptime, model, tool count, wallet balance]

You: /help
Agent: [Lists all admin commands]
```

> **First time?** Send `/boot` to run the bootstrap template and let the agent introduce itself.

---

## Configuration

The `teleton setup` wizard generates `~/.teleton/config.yaml`. Manual editing is only needed to change settings afterwards.

```yaml
agent:
  provider: "deepseek"               # anthropic | openai | google | xai | groq | openrouter | deepseek
  api_key: "sk-..."
  # base_url: "https://api.deepseek.com"  # Custom API endpoint (this fork only)
  model: "deepseek-chat"
  utility_model: "deepseek-chat"     # for summarization, compaction, vision
  max_agentic_iterations: 5

telegram:
  dm_policy: "open"         # open | allowlist | pairing | disabled
  group_policy: "open"      # open | allowlist | disabled
  require_mention: true
  admin_ids: [123456789]
  owner_name: "Your Name"
  owner_username: "your_username"
  debounce_ms: 1500         # group message batching delay

  # Optional: inline bot for interactive features (deals)
  bot_token: "123456:ABC-DEF..."
  bot_username: "your_bot"

  session_reset_policy:
    daily_reset_enabled: true
    daily_reset_hour: 4
    idle_expiry_minutes: 1440  # 24h idle → new session

webui:                       # Optional: Web dashboard
  enabled: false             # Enable WebUI server
  port: 7777                 # HTTP server port
  host: "127.0.0.1"          # Localhost only (security)
  # auth_token: "..."        # Auto-generated if omitted
```

### MCP Servers

Connect external tool servers via the [Model Context Protocol](https://modelcontextprotocol.io/). No code needed - tools are auto-discovered and registered at startup.

**Via CLI (recommended):**
```bash
teleton mcp add @modelcontextprotocol/server-filesystem /tmp
teleton mcp add @openbnb/mcp-server-airbnb
teleton mcp list
teleton mcp remove filesystem
```

**Via config.yaml:**
```yaml
mcp:
  servers:
    filesystem:
      command: npx -y @modelcontextprotocol/server-filesystem /tmp
    brave:
      command: npx -y @modelcontextprotocol/server-brave-search
      env:
        BRAVE_API_KEY: "sk-xxx"
    remote:
      url: http://localhost:3001/mcp
      scope: admin-only
```

**Via WebUI:**

When the WebUI is enabled, the **MCP Servers** page lets you add/remove servers, configure environment variables (API keys), and view connection status and tool lists - all from the browser.

Tools are namespaced as `mcp_<server>_<tool>` (e.g. `mcp_filesystem_read_file`). Each server supports `scope` (always, dm-only, group-only, admin-only) and `enabled` toggle.

### Web Search & Fetch

The agent has two built-in web tools powered by [Tavily](https://tavily.com/) (free tier available):

| Tool | Description |
|------|-------------|
| `web_search` | Search the web - returns titles, URLs, content snippets, relevance scores. Supports `topic`: general, news, finance |
| `web_fetch` | Extract readable text from a URL - articles, docs, links shared by users |

Both tools require a Tavily API key. Set it via CLI or config:

```bash
teleton config set tavily_api_key
```

Or in `config.yaml`:
```yaml
tavily_api_key: "tvly-..."
```

Once configured, the agent can autonomously search the web and read pages when needed to answer questions or verify information.

### Managing Config Keys

Use `teleton config` to manage optional keys without editing YAML manually:

```bash
# List all configurable keys and their status
teleton config list

# Set a key (prompts interactively if value omitted)
teleton config set tavily_api_key
teleton config set tonapi_key AFTWPHSLN3...

# View a key (sensitive values are masked)
teleton config get tavily_api_key

# Remove a key
teleton config unset tavily_api_key
```

Configurable keys: `tavily_api_key`, `tonapi_key`, `telegram.bot_token`, `telegram.bot_username`.

### Environment Variables

All environment variables override the corresponding `config.yaml` value at startup - useful for Docker and CI:

| Variable | Description | Default |
|----------|-------------|---------|
| `TELETON_HOME` | Data directory (config, DB, session) | `~/.teleton` |
| `TELETON_API_KEY` | LLM API key (overrides config) | - |
| `TELETON_TG_API_ID` | Telegram API ID (overrides config) | - |
| `TELETON_TG_API_HASH` | Telegram API Hash (overrides config) | - |
| `TELETON_TG_PHONE` | Phone number (overrides config) | - |
| `TELETON_TAVILY_API_KEY` | Tavily API key for web search | - |
| `TELETON_TONAPI_KEY` | TonAPI key for higher rate limits | - |
| `TELETON_WEBUI_ENABLED` | Enable WebUI (overrides config) | `false` |
| `TELETON_WEBUI_PORT` | WebUI port (overrides config) | `7777` |

---

## WebUI Dashboard

Teleton includes an **optional web dashboard** for monitoring and configuration. The WebUI is disabled by default and runs only on localhost for security.

### Features

- **Dashboard**: System status, uptime, model info, session count, memory stats
- **Tools Management**: View all tools grouped by module, toggle enable/disable, change scope per tool
- **Plugin Marketplace**: Install, update, and manage plugins from registry with secrets management
- **Soul Editor**: Edit SOUL.md, SECURITY.md, STRATEGY.md, MEMORY.md with unsaved changes warning
- **Memory Search**: Search knowledge base with hybrid vector+keyword search
- **Live Logs**: Real-time log streaming via Server-Sent Events
- **Workspace**: File browser with inline text editor
- **MCP Servers**: Add/remove external tool servers, manage API keys (env vars), view connection status
- **Tasks**: Scheduled task management with status, dependencies, and bulk actions

### Usage

**Enable via config.yaml:**
```yaml
webui:
  enabled: true
  port: 7777
```

**Enable via CLI flag:**
```bash
teleton start --webui
# or specify custom port
teleton start --webui --webui-port 8080
```

**Enable via environment variable:**
```bash
TELETON_WEBUI_ENABLED=true teleton start
```

### Access

When WebUI is enabled, the agent will display:
```
🌐 WebUI: http://localhost:7777?token=your-token-here
🔑 Token: your-token-here
```

1. Click the URL (token is auto-filled) or visit `http://localhost:7777`
2. Paste the token from the console (displayed once at startup)
3. Token is stored as HttpOnly cookie (7 days) for subsequent visits

### Security

- **Localhost only**: Server binds to `127.0.0.1` by default (not accessible from network)
- **Bearer token auth**: All API routes require authentication (timing-safe comparison)
- **HttpOnly cookies**: SameSite=Strict, prevents XSS token theft
- **No persistence**: Runtime changes (like model switches via WebUI) are not saved to config.yaml
- **For remote access**: Use SSH tunneling or reverse proxy (nginx/caddy) with HTTPS

**SSH tunnel example:**
```bash
ssh -L 7777:localhost:7777 user@remote-server
# Then access http://localhost:7777 on your local machine
```

### Workspace Files

The agent's personality and rules are configured via markdown files in `~/.teleton/workspace/`. Default templates are generated during `teleton setup` - you can edit any of them to customize your agent:

| File | Purpose | Mutable by Agent |
|------|---------|-----------------|
| `SOUL.md` | Personality, tone, behavior guidelines | No |
| `STRATEGY.md` | Trading rules, buy/sell thresholds | No |
| `SECURITY.md` | Security principles, threat recognition | No |
| `MEMORY.md` | Persistent memory (facts, contacts, decisions) | Yes |
| `memory/*.md` | Session summaries, daily logs (auto-generated) | Yes |

> **Tip**: Templates are located in `src/templates/` if installing from source. Edit the workspace copies in `~/.teleton/workspace/` - not the source templates.

### Admin Commands

All admin commands support `/`, `!`, or `.` prefix:

| Command | Description |
|---------|-------------|
| `/status` | Uptime, model, sessions, wallet, policies |
| `/model <name>` | Hot-swap LLM model at runtime |
| `/policy <dm\|group> <value>` | Change access policies live |
| `/loop <1-50>` | Set max agentic iterations |
| `/strategy [buy\|sell <pct>]` | View/change trading thresholds |
| `/wallet` | Show wallet address + balance |
| `/modules set\|info\|reset` | Per-group tool permissions |
| `/plugin set\|unset\|keys` | Manage plugin secrets |
| `/task <description>` | Assign a task to the agent |
| `/boot` | Run bootstrap template |
| `/pause` / `/resume` | Pause/resume agent |
| `/clear [chat_id]` | Clear conversation history |
| `/verbose` | Toggle debug logging |
| `/rag [status\|topk <n>]` | Toggle Tool RAG or view status |
| `/stop` | Emergency shutdown |
| `/ping` | Check responsiveness |
| `/help` | Show all commands |

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| LLM | Multi-provider via [pi-ai](https://github.com/mariozechner/pi-ai) (Anthropic, OpenAI, Google, xAI, Groq, OpenRouter) + DeepSeek (custom) |
| Telegram Userbot | [GramJS](https://gram.js.org/) (MTProto) |
| Inline Bot | [Grammy](https://grammy.dev/) (Bot API, for deals) |
| Blockchain | [TON SDK](https://github.com/ton-org/ton) (W5R1 wallet) |
| DeFi | STON.fi SDK, DeDust SDK |
| Database | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) with WAL mode |
| Vector Search | [sqlite-vec](https://github.com/asg017/sqlite-vec) (cosine similarity) |
| Full-Text Search | SQLite FTS5 (BM25 ranking) |
| Embeddings | [@huggingface/transformers](https://www.npmjs.com/package/@huggingface/transformers) (local ONNX) or Voyage AI |
| Token Counting | [js-tiktoken](https://github.com/dqbd/tiktoken) |
| MCP Client | [@modelcontextprotocol/sdk](https://modelcontextprotocol.io/) (stdio + SSE transports) |
| WebUI | [Hono](https://hono.dev/) (API) + React + Vite (frontend) |
| Language | TypeScript 5.7, Node.js 20+ |

### Project Structure

```
src/
├── index.ts                # Entry point, TonnetApp lifecycle, graceful shutdown
├── agent/                  # Core agent runtime
│   ├── runtime.ts          # Agentic loop (5 iterations, tool calling, masking, compaction)
│   ├── client.ts           # Multi-provider LLM client
│   └── tools/              # 114 built-in tools
│       ├── register-all.ts # Central tool registration (8 categories, ~90 tools)
│       ├── registry.ts     # Tool registry, scope filtering, provider limits, Tool RAG
│       ├── module-loader.ts    # Built-in module loading (deals → +5 tools)
│       ├── plugin-loader.ts    # External plugin discovery, validation, hot-reload
│       ├── mcp-loader.ts       # MCP client (stdio/SSE), tool discovery, lifecycle
│       ├── telegram/       # Telegram operations (48 tools, gift-focused)
│       ├── ton/            # TON blockchain + jettons + DEX router (15 tools)
│       ├── stonfi/         # STON.fi DEX (5 tools)
│       ├── dedust/         # DeDust DEX (5 tools)
│       ├── dns/            # TON DNS (7 tools)
│       ├── journal/        # Business journal (3 tools)
│       └── workspace/      # File operations (6 tools)
├── deals/                  # Deals module (5 tools, loaded via module-loader)
│   ├── module.ts           # Module definition + lifecycle
│   ├── executor.ts         # Deal execution logic
│   └── strategy-checker.ts # Trading strategy enforcement
├── bot/                    # Deals inline bot (Grammy + GramJS)
│   ├── index.ts            # DealBot (Grammy Bot API)
│   ├── gramjs-bot.ts       # GramJS MTProto for styled buttons
│   └── services/           # Message builder, styled keyboard, verification
├── telegram/               # Telegram integration layer
│   ├── bridge.ts           # GramJS wrapper (peer cache, message parsing, keyboards)
│   ├── handlers.ts         # Message routing, rate limiting, ChatQueue, feed storage
│   ├── admin.ts            # 17 admin commands
│   ├── debounce.ts         # Message batching for groups
│   ├── formatting.ts       # Markdown → Telegram HTML
│   ├── task-executor.ts    # Scheduled task runner
│   ├── task-dependency-resolver.ts  # DAG-based task chains
│   └── callbacks/          # Inline button routing
├── memory/                 # Storage and knowledge
│   ├── schema.ts           # 10 tables, 25 indexes, FTS5, vec0, semver migrations
│   ├── database.ts         # SQLite + WAL + sqlite-vec
│   ├── search/             # RAG system (hybrid vector + BM25 fusion via RRF)
│   ├── embeddings/         # Local ONNX + Voyage AI + caching provider
│   ├── compaction.ts       # Context auto-compaction with AI summarization
│   ├── observation-masking.ts  # Tool result compression (~90% savings)
│   └── daily-logs.ts       # Automatic session summaries
├── ton/                    # TON blockchain
│   ├── wallet-service.ts   # W5R1 wallet, PBKDF2 key caching, encrypted storage
│   ├── transfer.ts         # TON send operations
│   └── payment-verifier.ts # On-chain payment verification with replay protection
├── sdk/                    # Plugin SDK (v1.0.0)
│   ├── index.ts            # SDK factory (createPluginSDK, all objects frozen)
│   ├── ton.ts              # TON service for plugins
│   ├── telegram.ts         # Telegram service for plugins
│   ├── secrets.ts          # 3-tier secret resolution (env → file → config)
│   └── storage.ts          # KV store with TTL
├── session/                # Session management
│   ├── store.ts            # Session persistence (SQLite, daily reset, idle expiry)
│   └── transcript.ts       # JSONL conversation transcripts
├── soul/                   # System prompt assembly
│   └── loader.ts           # 10 sections: soul + security + strategy + memory + context + ...
├── config/                 # Configuration
│   ├── schema.ts           # Zod schemas + validation
│   └── providers.ts        # Multi-provider LLM registry (7 providers, incl. DeepSeek)
├── webui/                  # Optional web dashboard
│   ├── server.ts           # Hono server, auth middleware, static serving
│   └── routes/             # 11 API route groups (status, tools, logs, memory, soul, plugins, mcp, tasks, workspace, config, marketplace)
├── constants/              # Centralized limits, timeouts, API endpoints
├── utils/                  # Logger, sanitize, retry, fetch
├── workspace/              # Path validator (anti-traversal, anti-symlink)
├── templates/              # Workspace template files (SOUL.md, etc.)
└── cli/                    # CLI commands (setup, config, doctor, mcp)

web/                        # React + Vite frontend (10 pages)
packages/sdk/               # Published @teleton-agent/sdk
```

---

## Security

### Multi-Layer Defense

| Layer | Protection |
|-------|-----------|
| **Prompt injection** | `sanitizeForPrompt()` strips control chars, invisible unicode, markdown injection. `sanitizeForContext()` for RAG results |
| **Immutable config** | SOUL.md, STRATEGY.md, SECURITY.md cannot be modified by the agent |
| **Workspace sandbox** | Agent confined to `~/.teleton/workspace/`, recursive URL decoding blocks double-encoding attacks, symlinks detected and blocked |
| **Plugin isolation** | Frozen SDK objects, sanitized config (no API keys), isolated per-plugin databases, `npm ci --ignore-scripts` |
| **Wallet protection** | File permissions `0o600`, KeyPair cached (single PBKDF2), mnemonic never exposed to plugins |
| **Memory protection** | Memory writes blocked in group chats to prevent poisoning |
| **Payment security** | `INSERT OR IGNORE` on tx hashes prevents double-spend, atomic status transitions prevent race conditions |
| **Tool scoping** | Financial tools DM-only, moderation group-only, per-chat permissions configurable at runtime |

### Reporting Vulnerabilities

Do not open public issues for security vulnerabilities. Contact maintainers (t.me/zkproof) directly or use GitHub's private security advisory feature.

### Best Practices

1. Use a dedicated Telegram account
2. Backup your 24-word mnemonic securely offline
3. Start with restrictive policies (`allowlist`)
4. Set file permissions: `chmod 600 ~/.teleton/wallet.json`
5. Never commit `config.yaml` to version control
6. Review `SECURITY.md` and customize for your use case

---

## Troubleshooting

### Windows: `node-gyp` errors during `npm install`

Some native modules (like `better-sqlite3`) need a C++ compiler:

```powershell
# Install Windows Build Tools (run PowerShell as Administrator)
npm install -g windows-build-tools
# OR install Visual Studio Build Tools manually from:
# https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

Then retry `npm install`.

### Telegram session expired

```bash
# Delete old session and restart (will ask for verification code again)
# Windows:
del %USERPROFILE%\.teleton\telegram_session.txt

# macOS/Linux:
rm ~/.teleton/telegram_session.txt

# Then restart:
teleton start
```

### `ERR_MODULE_NOT_FOUND: playwright`

The market scraper needs Playwright + Chromium:

```bash
npm install playwright
npx playwright install chromium
```

### `error: unknown option '--webui'`

You need to rebuild after pulling updates:

```bash
npm run build
```

### Agent not responding in groups

- Check `require_mention: true` in config — you must @mention the agent
- Check `group_policy` — if `allowlist`, add the group ID to `group_allow_from`
- Try `/resume` — the agent might be paused

### Health check

```bash
teleton doctor
```

---

## Development

### Setup

```bash
git clone https://github.com/dysticl/teleton-agent.git
cd teleton-agent
npm install
npm run build
npm link
teleton setup
npm run dev  # Watch mode with auto-restart
```

### Commands

```bash
npm run build       # SDK → backend (tsup) → frontend (vite)
npm run start       # Start agent (compiled)
npm run dev         # Development mode (watch, tsx)
npm run dev:web     # Frontend dev server (port 5173, proxied to 7777)
npm run setup       # Run setup wizard
npm run doctor      # Health checks
npm run typecheck   # Type checking
npm run lint        # ESLint
npm run test        # Vitest
npm run format      # Prettier
```

### Plugins

Plugins extend the agent with custom tools. Drop a `.js` file or folder in `~/.teleton/plugins/` - loaded at startup, hot-reloaded in dev mode, no rebuild needed. See [official example plugins](https://github.com/TONresistor/teleton-plugins) for complete working examples.

```
~/.teleton/plugins/
├── weather.js              # Single-file plugin
└── my-plugin/
    ├── index.js            # Folder plugin
    ├── package.json        # npm deps (auto-installed via npm ci)
    └── package-lock.json
```

Plugins export a `tools` function (recommended) or array, plus optional lifecycle hooks:

```js
// ~/.teleton/plugins/weather.js

export const manifest = {
  name: "weather",
  version: "1.0.0",
  sdkVersion: "^1.0.0",
};

// Optional: creates an isolated database at ~/.teleton/plugins/data/weather.db
export function migrate(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS weather_cache (
    city TEXT PRIMARY KEY, data TEXT, cached_at INTEGER
  )`);
}

// Required: tools as a function receiving the Plugin SDK
export const tools = (sdk) => [
  {
    name: "weather_get",
    description: "Get current weather for a city",
    parameters: {
      type: "object",
      properties: { city: { type: "string", description: "City name" } },
      required: ["city"],
    },
    execute: async (params) => {
      sdk.log.info(`Fetching weather for ${params.city}`);
      const res = await fetch(`https://wttr.in/${params.city}?format=j1`);
      if (!res.ok) return { success: false, error: "City not found" };
      const data = await res.json();
      return { success: true, data: { temp: data.current_condition[0].temp_C } };
    },
  },
];
```

#### Plugin SDK

When `tools` is a function, the SDK provides namespaced access to core services:

| Namespace | Methods |
|-----------|---------|
| `sdk.ton` | **Wallet**: `getAddress()`, `getBalance()`, `getPrice()`, `sendTON()`, `getTransactions()`, `verifyPayment()` |
| | **Jettons**: `getJettonBalances()`, `getJettonInfo()`, `sendJetton()`, `getJettonWalletAddress()` |
| | **NFT**: `getNftItems()`, `getNftInfo()` |
| | **Utils**: `toNano()`, `fromNano()`, `validateAddress()` |
| `sdk.telegram` | **Messages**: `sendMessage()`, `editMessage()`, `deleteMessage()`, `forwardMessage()`, `pinMessage()`, `searchMessages()`, `scheduleMessage()`, `getReplies()` |
| | **Media**: `sendPhoto()`, `sendVideo()`, `sendVoice()`, `sendFile()`, `sendGif()`, `sendSticker()`, `downloadMedia()` |
| | **Chat & Users**: `getChatInfo()`, `getUserInfo()`, `resolveUsername()`, `getParticipants()` |
| | **Interactive**: `sendDice()`, `sendReaction()`, `createPoll()`, `createQuiz()` |
| | **Moderation**: `banUser()`, `unbanUser()`, `muteUser()` |
| | **Stars & Gifts**: `getStarsBalance()`, `sendGift()`, `getAvailableGifts()`, `getMyGifts()`, `getResaleGifts()`, `buyResaleGift()` |
| | **Advanced**: `getMe()`, `isAvailable()`, `getRawClient()`, `setTyping()`, `sendStory()` |
| `sdk.secrets` | `get()`, `require()`, `has()` - 3-tier resolution (env var → secrets file → plugin config) |
| `sdk.storage` | `get()`, `set()`, `delete()`, `has()`, `clear()` - KV store with TTL support |
| `sdk.db` | Raw `better-sqlite3` database - isolated per plugin at `~/.teleton/plugins/data/<name>.db` |
| `sdk.config` | Sanitized app config (no API keys exposed) |
| `sdk.pluginConfig` | Plugin-specific config from `config.yaml` `plugins:` section |
| `sdk.log` | `info()`, `warn()`, `error()`, `debug()` - Prefixed logger |

**Lifecycle hooks**: `migrate(db)`, `start(ctx)`, `stop()`, `onMessage(event)`, `onCallbackQuery(event)`

**Security**: all SDK objects are `Object.freeze()`-ed. Plugins never see API keys or other plugins' data.

Plugin config in `config.yaml`:
```yaml
plugins:
  weather:
    api_key: "abc123"
```

Backward compatible: plugins can export `tools` as a static array without the SDK.

At startup:
```
🔌 Plugin "weather": 1 tool registered
✅ 115 tools loaded (1 from plugins)
```

---

## Documentation

Full documentation is available in the [`docs/`](docs/) directory:

| Section | Description |
|---------|-------------|
| [Configuration Guide](docs/configuration.md) | Complete reference for every config option |
| [Deployment Guide](docs/deployment.md) | Docker, systemd, docker-compose, VPS |
| [Plugin Development](docs/plugins.md) | Step-by-step plugin tutorial |
| [Telegram Setup](docs/telegram-setup.md) | API credentials, policies, 2FA, admin commands |
| [TON Wallet](docs/ton-wallet.md) | Wallet setup, DEX trading, security |

---

## Syncing with Upstream

This fork tracks [TONresistor/teleton-agent](https://github.com/TONresistor/teleton-agent). To pull upstream updates:

```bash
git remote add upstream https://github.com/TONresistor/teleton-agent.git
git fetch upstream
git merge upstream/main --no-ff -m "merge: sync with upstream"
npm install && npm run build
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the upstream guide.

1. Fork the repository
2. Create a feature branch from `dev`
3. Make your changes
4. Verify: `npm run typecheck && npm run lint && npm test`
5. Open a Pull Request against `dev`

---

## Contributors

<a href="https://github.com/TONresistor/teleton-agent/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=TONresistor/teleton-agent" />
</a>

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Credits

### Built With

- [pi-ai](https://github.com/mariozechner/pi-ai) - Multi-provider LLM SDK
- [GramJS](https://gram.js.org/) - Telegram MTProto library
- [Grammy](https://grammy.dev/) - Telegram Bot API framework
- [TON SDK](https://github.com/ton-org/ton) - TON blockchain client
- [STON.fi SDK](https://www.npmjs.com/package/@ston-fi/sdk) - DEX integration
- [DeDust SDK](https://www.npmjs.com/package/@dedust/sdk) - DEX integration
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) - Model Context Protocol client
- [sqlite-vec](https://github.com/asg017/sqlite-vec) - Vector search for SQLite
- [Hono](https://hono.dev/) - Lightweight web framework

---

## Support

- **This fork**: [GitHub Issues](https://github.com/dysticl/teleton-agent/issues)
- **Upstream**: [TONresistor/teleton-agent](https://github.com/TONresistor/teleton-agent)
- **Upstream Channel**: [@ResistanceTools](https://t.me/ResistanceTools)
- **Upstream Group Chat**: [@ResistanceForum](https://t.me/ResistanceForum)
