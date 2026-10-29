import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { COPY, SCHOOL } from "@/lib/site";

export function Visit() {
  const { visit } = COPY;

  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 bg-background py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">{visit.eyebrow}</p>
          <h2 id="contact-title" className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
            {visit.title}
          </h2>
          <p className="mt-6 text-lg leading-[1.7] text-ink-muted">{visit.body}</p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-5 md:col-span-7">
          <RevealItem>
            <Card className="border-l-4 border-gold">
              <CardHeader className="flex-row items-start gap-4 pb-2">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-tint text-navy">
                  <MapPin aria-hidden />
                </span>
                <CardTitle className="pt-1 text-2xl">Campus</CardTitle>
              </CardHeader>
              <CardContent className="pb-7">
                <p className="text-lg leading-[1.7] text-navy">
                  {SCHOOL.campus}, {SCHOOL.locationLine}
                </p>
                <p className="mt-2 text-sm text-ink-muted">Full street address and map link to be confirmed by the school.</p>
              </CardContent>
            </Card>
          </RevealItem>

          <RevealItem>
            <Card>
              <CardHeader className="flex-row items-start gap-4 pb-2">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-tint text-navy">
                  <Phone aria-hidden />
                </span>
                <CardTitle className="pt-1 text-2xl">Phone and email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-7 text-lg text-navy">
                {SCHOOL.phone ? (
                  <p>
                    <a className="rounded-md underline decoration-gold decoration-2 underline-offset-4 hover:decoration-navy" href={`tel:${SCHOOL.phone}`}>
                      {SCHOOL.phone}
                    </a>
                  </p>
                ) : (
                  <p className="text-ink-muted">Admissions phone number to be confirmed by the school.</p>
                )}
                {SCHOOL.email ? (
                  <p className="flex items-center gap-2">
                    <Mail aria-hidden className="size-5 text-ink-muted" />
                    <a className="rounded-md underline decoration-gold decoration-2 underline-offset-4 hover:decoration-navy" href={`mailto:${SCHOOL.email}`}>
                      {SCHOOL.email}
                    </a>
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </RevealItem>

          <RevealItem>
            <Card className="bg-navy text-warm-white">
              <CardHeader className="flex-row items-start gap-4 pb-2">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold text-navy">
                  <Send aria-hidden />
                </span>
                <CardTitle className="pt-1 text-2xl text-warm-white">Send an enquiry</CardTitle>
              </CardHeader>
              <CardContent className="pb-7">
                <p className="text-lg leading-[1.7] text-warm-white/85">
                  Use the school’s admissions enquiry page and a member of the team will get back to you.
                </p>
                <a
                  href={SCHOOL.enquiryUrl}
                  className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl font-semibold text-gold underline decoration-gold decoration-2 underline-offset-[6px] hover:text-warm-white hover:decoration-warm-white"
                >
                  Go to the enquiry page
                </a>
              </CardContent>
            </Card>
          </RevealItem>

          <RevealItem>
            <p className="px-1 text-base text-ink-muted">
              Follow the school on{" "}
              <a
                href={SCHOOL.socialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:decoration-navy"
              >
                X ({SCHOOL.socialHandle})
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              for updates.
            </p>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
