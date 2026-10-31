// Browser error monitoring (Sentry). Disabled until NEXT_PUBLIC_SENTRY_DSN is set.
// The SDK is loaded with a dynamic import only when a DSN is configured. The DSN is inlined at build time,
// so with no DSN the bundler drops the SDK and visitors download none of it.
import type * as SentryNext from "@sentry/nextjs";
import { sentryOptions } from "@/sentry.shared";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
let sentry: typeof SentryNext | undefined;

if (dsn) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({ ...sentryOptions, dsn, enabled: true });
    sentry = Sentry;
  });
}

export function onRouterTransitionStart(href: string, navigationType: "push" | "replace" | "traverse") {
  sentry?.captureRouterTransitionStart(href, navigationType);
}
