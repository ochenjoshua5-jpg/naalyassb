import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Globe, MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionNav } from "@/components/page/section-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { SCHOOL, COPY } from "@/lib/site";
import { OFFICE_HOURS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to reach Naalya Secondary School, Bweyogerere Campus: location, phone, email, office hours, the official application route and social media.",
};

/** A contact detail card with an icon. */
function ContactCard({
  icon: Icon,
  title,
  value,
  href,
  children,
}: {
  icon: typeof Phone | typeof Mail | typeof MessageCircle | typeof Clock | typeof MapPin | typeof Globe;
  title: string;
  value?: string;
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col p-7">
      <CardHeader className="gap-3 p-0">
        <span className="grid size-12 place-items-center rounded-full bg-gold-tint text-navy">
          <Icon aria-hidden className="size-6" />
        </span>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-4 p-0 text-base leading-[1.7] text-ink-muted">
        {value ? (
          href ? (
            <a
              href={href}
              className="text-lg font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:decoration-navy"
            >
              {value}
            </a>
          ) : (
            <p className="text-lg font-semibold text-navy">{value}</p>
          )
        ) : (
          <p className="text-lg font-semibold text-navy">To be confirmed by the school.</p>
        )}
        {children ? <div className="mt-3">{children}</div> : null}
      </CardContent>
    </Card>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        id="contact-title"
        eyebrow="Contact"
        title="How to reach Bweyogerere Campus."
        lead="Get in touch with Naalya Secondary School – Bweyogerere Campus by phone, email, or in person during office hours."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href={SCHOOL.enquiryUrl}>
              Make an enquiry
              <ArrowUpRight aria-hidden />
              <span className="sr-only">(opens the school’s admissions page)</span>
            </a>
          </Button>
          <Button asChild variant="onDark" size="lg">
            <a href={SCHOOL.applyUrl}>
              Start an application
              <ArrowUpRight aria-hidden />
              <span className="sr-only">(opens the Education Hub)</span>
            </a>
          </Button>
        </div>
      </PageHero>

      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <h2 className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
            Ways to reach us
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">
            Contact the campus office directly for the fastest response.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Reveal>
            <Card className="flex h-full flex-col p-7">
              <CardHeader className="gap-3 p-0">
                <span className="grid size-12 place-items-center rounded-full bg-gold-tint text-navy">
                  <MapPin aria-hidden className="size-6" />
                </span>
                <CardTitle className="text-2xl">Location</CardTitle>
              </CardHeader>
              <CardContent className="mt-4 p-0 text-base leading-[1.7] text-ink-muted">
                <address className="not-italic">
                  <p className="text-lg font-semibold text-navy">
                    {SCHOOL.name}, {SCHOOL.campus}
                  </p>
                  <p>{SCHOOL.locationLine}</p>
                </address>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                  Landmark: turn off Namugongo Road just after the Shell fuel station, or turn at Bweyogerere Town
                  Centre. Google Maps Plus Code: <span className="font-mono text-navy">9MCG+969</span>.
                </p>
              </CardContent>
            </Card>
          </Reveal>
          <Reveal>
            <ContactCard
              icon={Phone}
              title="Phone"
              value={SCHOOL.phone}
              href={`tel:+256782444516`}
            />
          </Reveal>
          <Reveal>
            <ContactCard
              icon={Mail}
              title="Email"
              value={SCHOOL.email}
              href={`mailto:${SCHOOL.email}`}
            />
          </Reveal>
          <Reveal>
            <ContactCard
              icon={MessageCircle}
              title="WhatsApp"
              value="Click to chat"
              href="https://wa.me/256782444516"
            >
              <p className="text-sm text-ink-muted">
                Message the admissions office directly on WhatsApp.
              </p>
            </ContactCard>
          </Reveal>
          <Reveal>
            <ContactCard icon={Clock} title="Office hours">
              <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                {OFFICE_HOURS.map((hour) => (
                  <li key={hour.day}>
                    <span className="font-semibold">{hour.day}</span>: {hour.hours}
                  </li>
                ))}
              </ul>
            </ContactCard>
          </Reveal>
          <Reveal>
            <Card className="flex h-full flex-col p-7">
              <CardHeader className="gap-3 p-0">
                <span className="grid size-12 place-items-center rounded-full bg-gold-tint text-navy">
                  <Globe aria-hidden className="size-6" />
                </span>
                <CardTitle className="text-2xl">Online</CardTitle>
              </CardHeader>
              <CardContent className="mt-4 p-0">
                <ul className="space-y-3 text-base">
                  <li>
                    <a
                      href={SCHOOL.socialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:decoration-navy"
                    >
                      Follow the school on X: {SCHOOL.socialHandle}
                      <ArrowUpRight aria-hidden className="size-4" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={SCHOOL.campusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:decoration-navy"
                    >
                      The campus page on the school website
                      <ArrowUpRight aria-hidden className="size-4" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <Reveal className="mt-20 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-navy md:text-4xl">Finding the campus</h2>
            <p className="mt-4 max-w-xl text-base leading-[1.75] text-ink-muted">
              From Kampala: head northeast on the Namugongo Road. After passing Bweyogerere Town Centre, look for the
              Shell petrol station on your right. Turn onto the road just after the Shell station and follow signs to
              Naalya Secondary School – Bweyogerere Campus (Bbuto Village). The campus is approximately 13 km from
              Kampala city centre and is within Kira Town Council, Wakiso District.
            </p>
            <p className="mt-4 max-w-xl text-base leading-[1.75] text-ink-muted">
              From Kireka/Bweyogerere Town: follow Bweyogerere Centre road directly toward the campus.
            </p>
          </div>
          <div className="hidden lg:block">
            <iframe
              title="Campus location"
              src="https://www.google.com/maps/search/?api=1&query=9MCG+969&output=embed"
              className="w-full h-64 rounded-2xl shadow-md shadow-navy/10 border border-line"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>

        <Reveal className="mt-20">
          <div className="grid gap-8 rounded-3xl bg-navy p-8 text-warm-white shadow-xl shadow-navy/20 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div>
              <h2 className="font-serif text-3xl font-semibold md:text-4xl">Visiting the campus</h2>
              <p className="mt-4 max-w-xl text-base leading-[1.75] text-warm-white/85">
                Prospective parents and students are welcome to visit. To arrange a guided campus tour, please contact
                the school office during working hours (Monday–Friday, 8:00 AM – 5:00 PM).
              </p>
            </div>
            <Button asChild size="lg">
              <a href={SCHOOL.enquiryUrl}>Make an enquiry</a>
            </Button>
          </div>
        </Reveal>

        <Reveal className="mt-16">
          <p className="max-w-2xl text-base leading-[1.75] text-ink-muted">
            This site does not have a contact form. Enquiries go through the school’s own admissions page. For how
            information is handled, see the{" "}
            <Link href="/privacy" className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:decoration-navy">
              privacy notice
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </>
  );
}
