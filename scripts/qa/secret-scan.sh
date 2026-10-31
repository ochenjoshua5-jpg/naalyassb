#!/usr/bin/env bash
# Day 6 secret scan (substitute for `trufflehog --only-verified`, which could not be downloaded in this sandbox).
# Regex only: findings are NOT verified against providers. Scans the full git history, the working tree and .next/static.
set -u
PATTERNS='AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----|sk_live_[0-9a-zA-Z]{20,}|sk_test_[0-9a-zA-Z]{20,}|rk_live_[0-9a-zA-Z]{20,}|xox[baprs]-[0-9a-zA-Z-]{10,}|ghp_[0-9A-Za-z]{30,}|github_pat_[0-9A-Za-z_]{40,}|eyJhbGciOi[0-9A-Za-z_-]{10,}\.[0-9A-Za-z_-]{10,}\.[0-9A-Za-z_-]{10,}|sbp_[0-9a-f]{40}|https://[0-9a-f]{32}@[a-z0-9.-]+\.ingest\.[a-z.]+/[0-9]+|user_[0-9A-Za-z]{20,}|sk_(live|test)_[A-Za-z0-9]{24,}'
echo "== working tree (tracked + untracked, excluding node_modules/.next) =="
git ls-files -co --exclude-standard | grep -v -E '^(node_modules|\.next|qa-screenshots|\.lighthouseci)/' | grep -v -E 'package-lock\.json$' | xargs -r grep -n -E "$PATTERNS" 2>/dev/null | cut -c1-200 | head -40
echo "== .next/static (built client bundles) =="
grep -r -l -E "$PATTERNS" .next/static 2>/dev/null | head -20 || true
echo "== git history (all refs, added lines only) =="
git log --all -p --no-color -G"$PATTERNS" -- . ':!package-lock.json' 2>/dev/null | grep -E '^\+' | grep -E "$PATTERNS" | cut -c1-200 | head -40
echo "== done =="
