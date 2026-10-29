#!/usr/bin/env node
/**
 * Apply Now verification: requests the school-confirmed Education Hub application link.
 * - 10 second timeout per attempt.
 * - Retries only on 5xx responses (up to 3 attempts, with a short back-off).
 * - Network errors and 4xx responses are reported once and not retried.
 * - Every attempt is logged as one JSON line with UTC and EAT (UTC+3) timestamps.
 *
 * Exit codes: 0 = 2xx final response on the Hub host; 1 = non-2xx response; 2 = unreachable or timeout.
 * Usage: node scripts/check-hub.mjs [url]
 */
const EXPECTED_URL = "https://hub.naalyaschools.ac.ug/naalya-secondary-school/apply";
const EXPECTED_HOST = "hub.naalyaschools.ac.ug";
const url = process.argv[2] ?? EXPECTED_URL;
const TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [2_000, 4_000];

const eatFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Kampala",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function log(fields) {
  const now = new Date();
  console.log(JSON.stringify({ event: "hub_check", ts_utc: now.toISOString(), ts_eat: `${eatFormat.format(now)} EAT`, ...fields }));
}

async function attempt(n) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "naalya-site-hub-check/1.0 (+https://naalyaschools.ac.ug)" },
    });
    const finalHost = new URL(response.url).host;
    const elapsed = Date.now() - started;
    log({ attempt: n, status: response.status, final_host: finalHost, host_ok: finalHost === EXPECTED_HOST, elapsed_ms: elapsed });
    return { kind: "response", status: response.status, host_ok: finalHost === EXPECTED_HOST };
  } catch (error) {
    const elapsed = Date.now() - started;
    log({ attempt: n, status: "no-response", error: error instanceof Error ? error.name : "unknown", elapsed_ms: elapsed });
    return { kind: "unreachable" };
  }
}

let final = { kind: "unreachable" };
for (let n = 1; n <= MAX_ATTEMPTS; n++) {
  final = await attempt(n);
  if (final.kind === "response" && final.status >= 500 && n < MAX_ATTEMPTS) {
    await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS[n - 1]));
    continue;
  }
  break;
}

if (final.kind === "unreachable") {
  log({ result: "unreachable", url });
  process.exit(2);
}
const ok = final.status >= 200 && final.status < 300 && final.host_ok;
log({ result: ok ? "ok" : "fail", url, status: final.status, host_ok: final.host_ok });
process.exit(ok ? 0 : 1);
