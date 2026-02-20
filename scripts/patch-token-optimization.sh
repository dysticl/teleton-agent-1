#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# Teleton Token Optimization Patch
# Reduces input token usage by ~80-90% per message
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/TONresistor/teleton-agent/main/scripts/patch-token-optimization.sh | bash
#
# Or locally:
#   bash scripts/patch-token-optimization.sh
# ──────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

echo ""
echo -e "${BOLD}  ╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}  ║  Teleton Token Optimization Patch    ║${NC}"
echo -e "${BOLD}  ║  Reduces input tokens by ~80-90%     ║${NC}"
echo -e "${BOLD}  ╚══════════════════════════════════════╝${NC}"
echo ""

# ── Find teleton installation ──
TELETON_DIR=""

# Check 1: git clone install at ~/.teleton-app
if [ -d "${HOME}/.teleton-app" ] && [ -f "${HOME}/.teleton-app/package.json" ]; then
  TELETON_DIR="${HOME}/.teleton-app"
  info "Found git clone installation at ${TELETON_DIR}"
fi

# Check 2: Current directory is teleton repo
if [ -z "$TELETON_DIR" ] && [ -f "package.json" ]; then
  if grep -q '"name": "teleton"' package.json 2>/dev/null; then
    TELETON_DIR="$(pwd)"
    info "Found teleton in current directory"
  fi
fi

# Check 3: npm global install
if [ -z "$TELETON_DIR" ]; then
  NPM_GLOBAL=""
  if command -v npm &>/dev/null; then
    NPM_GLOBAL=$(npm root -g 2>/dev/null || true)
  fi
  if [ -n "$NPM_GLOBAL" ] && [ -d "${NPM_GLOBAL}/teleton" ]; then
    TELETON_DIR="${NPM_GLOBAL}/teleton"
    info "Found npm global installation at ${TELETON_DIR}"
  fi
fi

if [ -z "$TELETON_DIR" ]; then
  error "Could not find teleton installation. Install it first:
  curl -fsSL https://raw.githubusercontent.com/TONresistor/teleton-agent/main/install.sh | bash"
fi

# ── Verify it's teleton ──
if ! grep -q '"name": "teleton"' "${TELETON_DIR}/package.json" 2>/dev/null; then
  error "Directory ${TELETON_DIR} does not contain teleton"
fi

CURRENT_VERSION=$(grep '"version"' "${TELETON_DIR}/package.json" | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
info "Current version: ${CURRENT_VERSION}"

# ── Update from git ──
has_git_remote=false
if [ -d "${TELETON_DIR}/.git" ]; then
  has_git_remote=true
fi

if $has_git_remote; then
  info "Updating from git..."
  cd "$TELETON_DIR"
  git fetch origin main 2>/dev/null || warn "git fetch failed, trying update anyway"
  git pull --ff-only origin main 2>/dev/null || {
    warn "git pull failed, resetting to origin/main..."
    git reset --hard origin/main
  }
  ok "Updated from git"
else
  info "Not a git repo — updating via npm..."
  npm install -g teleton@latest 2>/dev/null || {
    warn "npm update failed, trying with sudo..."
    sudo npm install -g teleton@latest || error "Could not update teleton"
  }
  ok "Updated via npm"
  # Re-find the dir after npm update
  NPM_GLOBAL=$(npm root -g 2>/dev/null || true)
  if [ -n "$NPM_GLOBAL" ] && [ -d "${NPM_GLOBAL}/teleton" ]; then
    TELETON_DIR="${NPM_GLOBAL}/teleton"
  fi
fi

cd "$TELETON_DIR"

# ── Install deps & build (for git installs) ──
if $has_git_remote; then
  info "Installing dependencies..."
  npm install --ignore-scripts 2>/dev/null || npm install
  info "Building..."
  npm run build 2>/dev/null || error "Build failed"
  ok "Build complete"
fi

# ── Clear old sessions to benefit from optimization ──
echo ""
info "Clearing old session transcripts to start fresh with optimized context..."
SESSIONS_DIR="${HOME}/.teleton/sessions"
if [ -d "$SESSIONS_DIR" ]; then
  SESSION_COUNT=$(find "$SESSIONS_DIR" -name "*.jsonl" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$SESSION_COUNT" -gt 0 ]; then
    # Archive old sessions instead of deleting
    ARCHIVE_DIR="${SESSIONS_DIR}/archived_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$ARCHIVE_DIR"
    mv "$SESSIONS_DIR"/*.jsonl "$ARCHIVE_DIR/" 2>/dev/null || true
    mv "$SESSIONS_DIR"/*.archived "$ARCHIVE_DIR/" 2>/dev/null || true
    ok "Archived ${SESSION_COUNT} old sessions to ${ARCHIVE_DIR}"
    info "This ensures the agent starts with the optimized sliding window context"
  fi
fi

# ── Show results ──
NEW_VERSION=$(grep '"version"' "${TELETON_DIR}/package.json" | head -1 | sed 's/.*: *"\(.*\)".*/\1/')

echo ""
echo -e "${BOLD}  ╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}  ║          Patch Applied!               ║${NC}"
echo -e "${BOLD}  ╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "  Version: ${YELLOW}${CURRENT_VERSION}${NC} → ${GREEN}${NEW_VERSION}${NC}"
echo ""
echo -e "  ${BOLD}What changed:${NC}"
echo "  • Sliding window: only last 8 messages in context (was: all)"
echo "  • Tool results: max 8K chars (was: 50K)"
echo "  • Observation masking: keep 3 recent (was: 10)"
echo "  • Compaction: triggers at 30 msgs (was: 200)"
echo "  • System prompt: trimmed ~40%"
echo "  • Daily log memory: 40 lines (was: 100)"
echo "  • RAG search provides historical context"
echo ""
echo -e "  ${BOLD}Expected savings:${NC}"
echo "  • Input tokens: ~5-15K per message (was: 100K+)"
echo "  • Cost reduction: ~80-90%"
echo ""
echo -e "  ${BOLD}Next step:${NC}"
echo "  Restart your agent: ${GREEN}teleton start${NC}"
echo ""

ok "Done! 🎉"
