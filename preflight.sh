#!/bin/bash

# Second Mind -- Ralph Loop Preflight Check
# Run this before launching the ralph loop to catch issues early.
# Usage: chmod +x preflight.sh && ./preflight.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

pass=0
fail=0
warn=0

passed() {
  echo -e "  ${GREEN}✓${NC} $1"
  pass=$((pass + 1))
}

failed() {
  echo -e "  ${RED}✗${NC} $1"
  fail=$((fail + 1))
}

warned() {
  echo -e "  ${YELLOW}!${NC} $1"
  warn=$((warn + 1))
}

echo ""
echo -e "${BOLD}Second Mind -- Preflight Check${NC}"
echo -e "${BOLD}==============================${NC}"
echo ""

# ------------------------------------------------------------------
# 1. Node.js
# ------------------------------------------------------------------
echo -e "${BOLD}1. Node.js${NC}"

if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 20 ]; then
    passed "Node.js v${NODE_VERSION} (>= 20 required)"
  else
    failed "Node.js v${NODE_VERSION} -- version 20+ required. Run: nvm install 20"
  fi
else
  failed "Node.js not found. Install via nvm: nvm install 20"
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  passed "npm v${NPM_VERSION}"
else
  failed "npm not found"
fi

echo ""

# ------------------------------------------------------------------
# 2. Docker
# ------------------------------------------------------------------
echo -e "${BOLD}2. Docker${NC}"

if command -v docker &> /dev/null; then
  passed "Docker CLI found"
else
  failed "Docker not found. Install Docker Desktop: https://docker.com/products/docker-desktop"
fi

if docker info &> /dev/null; then
  passed "Docker daemon is running"
else
  failed "Docker daemon is not running. Start Docker Desktop and try again."
fi

echo ""

# ------------------------------------------------------------------
# 3. Supabase CLI
# ------------------------------------------------------------------
echo -e "${BOLD}3. Supabase CLI${NC}"

if command -v supabase &> /dev/null; then
  SUPA_VERSION=$(supabase --version 2>&1 | head -1)
  passed "Supabase CLI: ${SUPA_VERSION}"
elif npx supabase --version &> /dev/null; then
  SUPA_VERSION=$(npx supabase --version 2>&1 | head -1)
  passed "Supabase CLI (via npx): ${SUPA_VERSION}"
else
  failed "Supabase CLI not found. Run: npm install -g supabase"
fi

# Test if Supabase local can start (check if images are pulled)
if docker image ls | grep -q "supabase/postgres"; then
  passed "Supabase Docker images already pulled"
else
  warned "Supabase Docker images not yet pulled. First 'supabase start' will take 5-10 min to download. Consider running 'npx supabase start' now."
fi

echo ""

# ------------------------------------------------------------------
# 4. Git
# ------------------------------------------------------------------
echo -e "${BOLD}4. Git${NC}"

if command -v git &> /dev/null; then
  passed "Git found: $(git --version)"
else
  failed "Git not found"
fi

if git rev-parse --is-inside-work-tree &> /dev/null; then
  passed "Inside a git repository"
  
  BRANCH=$(git branch --show-current)
  passed "Current branch: ${BRANCH}"

  if git diff --quiet && git diff --cached --quiet; then
    passed "Working tree is clean (no uncommitted changes)"
  else
    warned "Uncommitted changes detected. The agent will commit on top of these. Consider committing or stashing first."
  fi
else
  failed "Not inside a git repository. Run: git init && git add -A && git commit -m 'initial commit'"
fi

echo ""

# ------------------------------------------------------------------
# 5. Required repo files
# ------------------------------------------------------------------
echo -e "${BOLD}5. Required repo files${NC}"

REQUIRED_FILES=("prd.json" "prompt.md" "progress.txt" "second-mind-spec.md")

for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "$f" ]; then
    passed "${f} exists"
  else
    failed "${f} missing. This file must be in the repo root."
  fi
done

if [ -f "prd.json" ]; then
  STORY_COUNT=$(python3 -c "import json; print(len(json.load(open('prd.json'))['userStories']))" 2>/dev/null || echo "0")
  if [ "$STORY_COUNT" -gt 0 ]; then
    passed "prd.json has ${STORY_COUNT} stories"
  else
    failed "prd.json has no stories or is malformed"
  fi

  INCOMPLETE=$(python3 -c "import json; stories=json.load(open('prd.json'))['userStories']; print(len([s for s in stories if not s['passes']]))" 2>/dev/null || echo "?")
  if [ "$INCOMPLETE" != "?" ]; then
    passed "${INCOMPLETE} stories remaining (passes: false)"
  fi
fi

echo ""

# ------------------------------------------------------------------
# 6. Environment variables
# ------------------------------------------------------------------
echo -e "${BOLD}6. Environment variables${NC}"

# Check .env.local if it exists
if [ -f ".env.local" ]; then
  passed ".env.local file exists"

  check_env_var() {
    local var_name=$1
    local required=$2
    if grep -q "^${var_name}=" .env.local && [ -n "$(grep "^${var_name}=" .env.local | cut -d= -f2-)" ]; then
      passed "${var_name} is set"
    elif [ "$required" = "required" ]; then
      failed "${var_name} is missing or empty in .env.local"
    else
      warned "${var_name} is not set (optional, has default)"
    fi
  }

  check_env_var "ANTHROPIC_API_KEY" "required"
  check_env_var "NEXT_PUBLIC_SUPABASE_URL" "optional"
  check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "optional"
  check_env_var "SUPABASE_SERVICE_ROLE_KEY" "optional"
  check_env_var "ROUTER_MODEL" "optional"
  check_env_var "GENERATION_MODEL" "optional"

else
  warned ".env.local does not exist yet (SM-002 will create the template, but you need ANTHROPIC_API_KEY ready)"

  if [ -n "$ANTHROPIC_API_KEY" ]; then
    passed "ANTHROPIC_API_KEY found in shell environment"
  else
    warned "ANTHROPIC_API_KEY not found in shell environment either. Have your key ready for after SM-002."
  fi
fi

echo ""

# ------------------------------------------------------------------
# 7. Anthropic API connectivity
# ------------------------------------------------------------------
echo -e "${BOLD}7. Anthropic API${NC}"

# Try to find the API key from .env.local or shell
API_KEY=""
if [ -f ".env.local" ]; then
  API_KEY=$(grep "^ANTHROPIC_API_KEY=" .env.local 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'")
fi
if [ -z "$API_KEY" ] && [ -n "$ANTHROPIC_API_KEY" ]; then
  API_KEY="$ANTHROPIC_API_KEY"
fi

if [ -n "$API_KEY" ]; then
  # Quick API test with a minimal request
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    https://api.anthropic.com/v1/messages \
    -H "content-type: application/json" \
    -H "x-api-key: ${API_KEY}" \
    -H "anthropic-version: 2023-06-01" \
    -d '{
      "model": "claude-haiku-4-5-20251001",
      "max_tokens": 10,
      "messages": [{"role": "user", "content": "Say ok"}]
    }' 2>/dev/null || echo "000")

  if [ "$HTTP_STATUS" = "200" ]; then
    passed "Anthropic API key is valid (test call returned 200)"
  elif [ "$HTTP_STATUS" = "401" ]; then
    failed "Anthropic API key is invalid (401 Unauthorized)"
  elif [ "$HTTP_STATUS" = "429" ]; then
    warned "Anthropic API returned 429 (rate limited). Key works but you may be near limits."
  elif [ "$HTTP_STATUS" = "000" ]; then
    warned "Could not reach Anthropic API (network issue?)"
  else
    warned "Anthropic API returned HTTP ${HTTP_STATUS}. Key may still work -- check manually."
  fi
else
  warned "No Anthropic API key found. Cannot test connectivity. The agent will need this by SM-009."
fi

echo ""

# ------------------------------------------------------------------
# 8. Supabase local status
# ------------------------------------------------------------------
echo -e "${BOLD}8. Supabase local instance${NC}"

if npx supabase status &> /dev/null 2>&1; then
  passed "Supabase local is running"
  
  # Try to extract the local URL
  SUPA_URL=$(npx supabase status 2>/dev/null | grep "API URL" | awk '{print $NF}')
  if [ -n "$SUPA_URL" ]; then
    passed "Local API URL: ${SUPA_URL}"
  fi
else
  warned "Supabase local is not running. Run 'npx supabase start' before the ralph loop (or let SM-001 discover this)."
fi

echo ""

# ------------------------------------------------------------------
# 9. Disk space
# ------------------------------------------------------------------
echo -e "${BOLD}9. Disk space${NC}"

AVAILABLE_GB=$(df -g . 2>/dev/null | tail -1 | awk '{print $4}' || df -BG . 2>/dev/null | tail -1 | awk '{print $4}' | sed 's/G//')
if [ -z "$AVAILABLE_GB" ] || ! [[ "$AVAILABLE_GB" =~ ^[0-9]+$ ]]; then
  warned "Could not determine available disk space. Verify manually that you have at least 5GB free."
elif [ "$AVAILABLE_GB" -ge 10 ]; then
  passed "${AVAILABLE_GB}GB available (Supabase Docker images + node_modules + Playwright need ~5GB)"
elif [ "$AVAILABLE_GB" -ge 5 ]; then
  warned "${AVAILABLE_GB}GB available. Might be tight with Docker images + Playwright browsers."
else
  failed "${AVAILABLE_GB}GB available. Need at least 5GB for Docker images, node_modules, and Playwright."
fi

echo ""

# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------
echo -e "${BOLD}==============================${NC}"
echo -e "${BOLD}Summary${NC}"
echo -e "  ${GREEN}${pass} passed${NC}  ${YELLOW}${warn} warnings${NC}  ${RED}${fail} failures${NC}"
echo ""

if [ "$fail" -gt 0 ]; then
  echo -e "${RED}${BOLD}Fix the failures above before running the ralph loop.${NC}"
  echo ""
  exit 1
elif [ "$warn" -gt 0 ]; then
  echo -e "${YELLOW}${BOLD}Warnings present. The loop will probably work, but review them.${NC}"
  echo ""
  echo -e "When ready:"
  echo -e "  ${BOLD}/ralph-loop:ralph-loop \"Read prompt.md for instructions. Read prd.json for tasks.\" --max-iterations 32 --completion-promise \"COMPLETE\"${NC}"
  echo ""
  exit 0
else
  echo -e "${GREEN}${BOLD}All clear. Ready to run:${NC}"
  echo ""
  echo -e "  ${BOLD}/ralph-loop:ralph-loop \"Read prompt.md for instructions. Read prd.json for tasks.\" --max-iterations 32 --completion-promise \"COMPLETE\"${NC}"
  echo ""
  exit 0
fi