import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Crest } from "@/components/brand/crest";
import { NAV_ITEMS, SCHOOL } from "@/lib/site";

const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-lg text-warm-white/85 transition-colors hover:text-gold";

export function SiteFooter() {
  return (
    <footer className="relative bg-navy pb-10 pt-24 text-warm-white md:pt-28">
      {/* School badge floats over the top edge of the footer */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warm-white p-2 shadow-lg shadow-navy-deep/20">
        <Crest className="size-20" tone="navy" title={`${SCHOOL.name} crest`} />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 md:grid-cols-3 md:gap-10">
        <section aria-labelledby="footer-about" className="text-center md:text-left">
          <h2 id="footer-about" className="font-serif text-2xl font-semibold">
            {SCHOOL.name}
          </h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-gold">{SCHOOL.campus}</p>
          <p className="mx-auto mt-4 max-w-sm leading-relaxed text-warm-white/80 md:mx-0">
            To provide high quality integrated education in a safe, respectful and inclusive setting.
          </p>
        </section>

        <nav aria-labelledby="footer-links" className="text-center md:text-left">
          <h2 id="footer-links" className="font-serif text-xl font-semibold">
            Quick links
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 md:grid-cols-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link href={`#${item.id}`} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={SCHOOL.applyUrl} className={linkClass}>
                Education Hub
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            </li>
            <li>
              <a href={SCHOOL.websiteUrl} className={linkClass}>
                Naalya schools website
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            </li>
          </ul>
        </nav>

        <section aria-labelledby="footer-contact" className="text-center md:text-left">
          <h2 id="footer-contact" className="font-serif text-xl font-semibold">
            Find us
          </h2>
          <address className="mt-4 not-italic leading-relaxed text-warm-white/85">
            {SCHOOL.campus}
            <br />
            {SCHOOL.locationLine}
          </address>
          <p className="mt-4 text-sm leading-relaxed text-warm-white/70">
            {SCHOOL.phone ? (
              <a href={`tel:${SCHOOL.phone}`} className={linkClass}>
                {SCHOOL.phone}
              </a>
            ) : (
              "Phone number to be confirmed by the school."
            )}
          </p>
          <p className="mt-2">
            <a href={SCHOOL.socialUrl} className={linkClass} target="_blank" rel="noopener noreferrer">
              X: {SCHOOL.socialHandle}
              <ArrowUpRight aria-hidden className="size-4" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </p>
        </section>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-3 border-t border-warm-white/15 px-5 pt-6 text-sm text-warm-white/70 md:flex-row md:items-center md:justify-between">
        <p>© 2026 {SCHOOL.name}, {SCHOOL.campus}.</p>
        <p>Preview for school review. Privacy notice being prepared with the school.</p>
      </div>
    </footer>
  );
}
