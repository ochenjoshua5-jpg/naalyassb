import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page/page-hero";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { EnquiryFallback } from "@/components/enquiry/enquiry-fallback";
import { getEnquiryMode } from "@/lib/enquiry/config";

/** Decided at request time from server configuration. The public preview has the form switched off. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Make an enquiry",
  description:
    "Send an enquiry to the admissions team at Naalya Secondary School, Bweyogerere Campus, or find the official routes to apply.",
  // Not for search results: the page is a working route, not a public landing page.
  robots: { index: false, follow: false },
};

export default function EnquiryPage() {
  const mode = getEnquiryMode();
  const formOpen = mode !== "disabled";

  return (
    <>
      <PageHero
        id="enquiry-title"
        eyebrow="Admissions"
        title="Make an enquiry."
        lead={
          formOpen
            ? "Tell us who you are and how to reach you. A member of the admissions team will reply using the details you give."
            : "Online enquiries are not open yet. The official routes below are always available."
        }
      >
        <Link
          href="/admissions"
          className="inline-flex items-center gap-2 rounded-sm text-base font-semibold text-warm-white underline decoration-gold decoration-2 underline-offset-[6px] hover:text-gold"
        >
          Back to admissions
        </Link>
      </PageHero>

      <div className="mx-auto max-w-4xl px-5 py-20 md:py-28">
        {formOpen ? (
          <EnquiryForm turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || null} />
        ) : (
          <EnquiryFallback variant="closed" />
        )}
      </div>
    </>
  );
}
