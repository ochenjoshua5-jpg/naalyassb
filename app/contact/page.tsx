import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Globe, MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { PendingNote, PendingTag } from "@/components/page/pending";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { SCHOOL } from "@/lib/site";
import { SOURCE_URLS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to reach Naalya Secondary School, Bweyogerere Campus: location, enquiries, the official application route and social media.",
};

/** A contact detail that is shown only after the school confirms it. */
function ContactCard({
  icon: Icon,
  title,
  value,
  children,
}: {
  icon: typeof Phone;
  title: string;
  value: string | null;
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
        {value ? <p className="text-lg font-semibold text-navy">{value}</p> : <PendingTag />}
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
        lead="The campus phone number, email and office hours are being confirmed with the school, so they are not shown yet. You can make an enquiry, start an application, or follow the school on X in the meantime."
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
          <h2 className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">Ways to reach us</h2>
          <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">
            Each detail appears here only once the school has confirmed it. We do not show numbers or addresses from
            other pages until they are verified.
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
                  <p className="text-lg font-semibold text-navy">{SCHOOL.name}, {SCHOOL.campus}</p>
                  <p>{SCHOOL.locationLine}</p>
                </address>
                <div className="mt-4">
                  <PendingTag />
                </div>
                <p className="mt-2">The street address and landmark are pending school confirmation.</p>
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={0.06}>
            <ContactCard icon={Phone} title="Phone" value={SCHOOL.phone}>
              The campus phone number will appear here once confirmed.
            </ContactCard>
          </Reveal>
          <Reveal delay={0.12}>
            <ContactCard icon={Mail} title="Email" value={SCHOOL.email}>
              The campus email address will appear here once confirmed.
            </ContactCard>
          </Reveal>
          <Reveal>
            <ContactCard icon={MessageCircle} title="WhatsApp" value={null}>
              Whether the campus uses WhatsApp for enquiries is pending school confirmation.
            </ContactCard>
          </Reveal>
          <Reveal delay={0.06}>
            <ContactCard icon={Clock} title="Office hours" value={null}>
              Opening hours for the campus office are pending school confirmation.
            </ContactCard>
          </Reveal>
          <Reveal delay={0.12}>
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
                      href={SOURCE_URLS.campus}
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
              The campus is in Kira Town Council, Wakiso District. A map and directions will be added once the school
              has confirmed the campus location. We are not showing a map pin until the coordinates have been checked
              against the campus itself.
            </p>
          </div>
          <PendingNote>
            <span className="font-semibold text-navy">Map and directions.</span> Pending school confirmation of the
            campus location.
          </PendingNote>
        </Reveal>

        <Reveal className="mt-20">
          <div className="grid gap-8 rounded-3xl bg-navy p-8 text-warm-white shadow-xl shadow-navy/20 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div>
              <h2 className="font-serif text-3xl font-semibold md:text-4xl">Visiting the campus</h2>
              <p className="mt-4 max-w-xl text-base leading-[1.75] text-warm-white/85">
                Campus visits are a good way to see the school. How to book one is pending HM approval. Until then, please
                make an enquiry and the admissions team will get back to you.
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
