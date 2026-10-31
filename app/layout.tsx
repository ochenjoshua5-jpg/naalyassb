import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SkipLink } from "@/components/site/skip-link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StickyActionBar } from "@/components/site/sticky-action-bar";
import { CookieConsentBanner } from "@/components/site/cookie-consent";
import { PublicFrame } from "@/components/site/public-frame";
import { SCHOOL } from "@/lib/site";

/* Fonts are self-hosted (no third-party request) and subset to Latin. */
const fraunces = localFont({
  src: "./fonts/Fraunces-Variable.woff2",
  variable: "--font-fraunces",
  weight: "100 900",
  display: "swap",
  preload: true,
});

const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
  preload: true,
});

/*
 * Handwritten accent, used only for the headteacher's name. It is decorative, so it never blocks
 * text: "optional" uses it only if it arrives almost at once, and it is not preloaded.
 */
const caveat = localFont({
  src: "./fonts/Caveat-700.woff2",
  variable: "--font-caveat",
  weight: "700",
  display: "optional",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: `${SCHOOL.name}, ${SCHOOL.campus}`,
    template: `%s · ${SCHOOL.name}, ${SCHOOL.campus}`,
  },
  description: `${SCHOOL.name}, ${SCHOOL.campus}, in ${SCHOOL.locationLine}. O-Level and A-Level education with day and boarding options.`,
  applicationName: `${SCHOOL.name} ${SCHOOL.campus}`,
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: `${SCHOOL.name}, ${SCHOOL.campus}`,
    description: "Welcome to the place where your child’s story begins.",
    locale: "en_UG",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B2A4A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background pb-24 md:pb-0">
        <PublicFrame
          skip={<SkipLink />}
          header={<SiteHeader />}
          footer={<SiteFooter />}
          sticky={<StickyActionBar />}
        >
          {children}
        </PublicFrame>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
