import { Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCHOOL } from "@/lib/site";

/* Thumb-reach actions on small screens. Hidden from md upwards. */
export function StickyActionBar() {
  const hasPhone = Boolean(SCHOOL.phone);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-3 border-t border-warm-white/10 bg-navy/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(19,31,56,0.5)] backdrop-blur supports-[backdrop-filter]:bg-navy/90 md:hidden"
      aria-label="Quick actions"
    >
      {hasPhone ? (
        <Button asChild variant="onDark" size="lg" className="w-full px-3 text-base">
          <a href={`tel:${SCHOOL.phone}`}>
            <Phone aria-hidden />
            Call admissions
          </a>
        </Button>
      ) : (
        <Button asChild variant="onDark" size="lg" className="w-full px-3 text-base">
          <a href={SCHOOL.enquiryUrl}>Make an enquiry</a>
        </Button>
      )}
      <Button asChild size="lg" className="w-full px-3 text-base">
        <a href={SCHOOL.applyUrl}>
          <FileText aria-hidden />
          Apply now
          <span className="sr-only">(opens the Education Hub)</span>
        </a>
      </Button>
    </div>
  );
}
