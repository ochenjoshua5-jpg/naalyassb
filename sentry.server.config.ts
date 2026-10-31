// Node server error monitoring (Sentry). Disabled until SENTRY_DSN is set.
import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/sentry.shared";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({ ...sentryOptions, dsn, enabled: true });
}
