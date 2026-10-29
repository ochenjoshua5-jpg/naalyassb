#!/usr/bin/env bash
# Secrets audit for the enquiry pipeline. Fails (exit 1) if a secret-like value is found in
# tracked files or in the client JavaScript produced by the build.
set -u
cd "$(dirname "$0")/.."
fail=0

echo "1. Tracked env files (only .env.example may be tracked)"
tracked_env=$(git ls-files | grep -E '(^|/)\.env' | grep -v '^\.env\.example$' || true)
if [ -n "$tracked_env" ]; then echo "   FAIL: $tracked_env"; fail=1; else echo "   ok"; fi

echo "2. Secret-shaped values in tracked files"
patterns='eyJ[A-Za-z0-9_-]{30,}|sb_secret_[A-Za-z0-9_]+|sk_(live|test)_[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY|UPSTASH_REDIS_REST_TOKEN=[A-Za-z0-9+/=_-]{12,}|TURNSTILE_SECRET_KEY=[A-Za-z0-9_-]{8,}|SUPABASE_SERVICE_ROLE_KEY=[A-Za-z0-9._-]{12,}|0x4[A-Za-z0-9_-]{20,}'
hits=$(git ls-files -z | xargs -0 grep -I -n -E "$patterns" -- 2>/dev/null | grep -v 'scripts/secrets-audit.sh' | grep -v 'package-lock.json' || true)
if [ -n "$hits" ]; then echo "$hits" | sed 's/^/   FAIL: /'; fail=1; else echo "   ok"; fi

echo "3. Server-only variable names must not appear in the client bundle (.next/static)"
if [ -d .next/static ]; then
  leak=$(grep -r -l -E 'SUPABASE_SERVICE_ROLE_KEY|service_role|TURNSTILE_SECRET_KEY|UPSTASH_REDIS_REST_TOKEN|UPSTASH_REDIS_REST_URL|SUPABASE_URL|ENQUIRY_SCHOOL_APPROVED' .next/static 2>/dev/null || true)
  if [ -n "$leak" ]; then echo "   FAIL: $leak"; fail=1; else echo "   ok"; fi
else
  echo "   skipped: run npm run build first"
fi

echo "4. No NEXT_PUBLIC_ variable carries a secret"
if git grep -n -E 'NEXT_PUBLIC_[A-Z_]*(SECRET|SERVICE|TOKEN|PRIVATE)' -- ':!scripts/secrets-audit.sh' >/dev/null 2>&1; then
  echo "   FAIL"; git grep -n -E 'NEXT_PUBLIC_[A-Z_]*(SECRET|SERVICE|TOKEN|PRIVATE)' -- ':!scripts/secrets-audit.sh' | sed 's/^/   /'; fail=1
else echo "   ok"; fi

if [ "$fail" -eq 0 ]; then echo "RESULT: pass"; else echo "RESULT: FAIL"; fi
exit "$fail"
