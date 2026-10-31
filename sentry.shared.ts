// Shared Sentry settings for the browser, the Node server and the edge runtime.
import { scrubEvent, scrubValue } from "@/lib/observability/scrub";

export const sentryOptions = {
  // Off unless a DSN is configured: no account, no data leaves the site until the school sets one up.
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  beforeSend: <E>(event: E): E => scrubEvent(event),
  beforeBreadcrumb: <B extends { data?: unknown }>(breadcrumb: B): B => {
    if (breadcrumb.data) breadcrumb.data = scrubValue(breadcrumb.data);
    return breadcrumb;
  },
};
