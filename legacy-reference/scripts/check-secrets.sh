#!/usr/bin/env bash
# scripts/check-secrets.sh — quét toàn repo tìm secret trước khi commit/push.
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

BAD=0
patterns=(
  'JWT_SECRET[[:space:]]*=[[:space:]]*['"'"'"]?[A-Za-z0-9_\-]{20,}'
  'PRIVATE[[:space:]]+KEY-----'
  '-----BEGIN[[:space:]]+(RSA|OPENSSH|EC|PGP)[[:space:]]+PRIVATE'
  'AKIA[0-9A-Z]{16}'
  'sk-[A-Za-z0-9]{20,}'
  'ghp_[A-Za-z0-9]{36}'
  'xoxb-[A-Za-z0-9\-]+'
  'password[[:space:]]*[:=][[:space:]]*['"'"'"][^'"'"'"]{8,}'
  'REDIS_PASSWORD[[:space:]]*=[[:space:]]*['"'"'"]?[A-Za-z0-9_\-]{16,}'
)

# Skip patterns for files that legitimately contain the KEYWORD but with placeholder value
allowlist_glob=(
  ".git/*"
  "*/node_modules/*"
  ".env.example"
  "*.env.example"
  "SECURITY.md"
  "check-secrets.sh"
  "pre-commit"
  "*.md"          # docs may reference secret patterns as strings — see below
)

# --- Actually scan tracked files only (safer) ---
tmpfile="$(mktemp)"
if git -C "$ROOT" rev-parse >/dev/null 2>&1; then
  git -C "$ROOT" ls-files > "$tmpfile"
else
  find "$ROOT" -type f -not -path "*/.git/*" -not -path "*/node_modules/*" > "$tmpfile"
fi

while IFS= read -r f; do
  # allowlist
  skip=0
  for a in "${allowlist_glob[@]}"; do
    case "$f" in $a) skip=1;; esac
  done
  [[ $skip -eq 1 ]] && continue
  [[ -f "$ROOT/$f" ]] || continue
  # binary?
  if file "$ROOT/$f" | grep -q "binary"; then continue; fi

  for pat in "${patterns[@]}"; do
    if grep -EnI --color=never "$pat" "$ROOT/$f" 2>/dev/null | grep -v "change-me" | grep -v "example" >/dev/null; then
      echo -e "${RED}✗ Possible secret in $f${NC}"
      grep -EnI --color=always "$pat" "$ROOT/$f" | grep -v "change-me" | grep -v "example" | head -5
      BAD=1
    fi
  done
done < "$tmpfile"
rm -f "$tmpfile"

if [[ $BAD -eq 0 ]]; then
  echo -e "${GREEN}✓ No obvious secrets found.${NC}"
  exit 0
else
  echo -e "${RED}Refusing to proceed — remove or move to .env before commit.${NC}"
  exit 1
fi
