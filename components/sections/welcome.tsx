import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoPlaceholder } from "@/components/brand/photo-placeholder";
import { Reveal } from "@/components/motion/reveal";
import { COPY, SCHOOL } from "@/lib/site";

export function Welcome() {
  const { welcome } = COPY;

  return (
    <section id="welcome" aria-labelledby="welcome-title" className="scroll-mt-20 bg-background py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-5 md:grid-cols-12 md:items-start md:gap-10">
        <Reveal className="md:col-span-7 md:pr-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">{welcome.eyebrow}</p>
          <h2 id="welcome-title" className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl lg:text-[3.5rem]">
            {welcome.title}
          </h2>

          {/* The headteacher's words, as a letter: first person, warm, unhurried */}
          <blockquote className="mt-10 space-y-6 border-l-4 border-gold pl-6 text-lg leading-[1.8] text-navy md:text-xl">
            {welcome.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </blockquote>

          <div className="mt-10">
            <p className="font-hand text-4xl leading-none text-navy">{SCHOOL.headteacher.name}</p>
            <p className="mt-2 text-base text-ink-muted">{SCHOOL.headteacher.title}</p>
          </div>
        </Reveal>

        <Reveal className="md:col-span-5 md:mt-28" delay={0.12}>
          <PhotoPlaceholder
            tone="navy"
            className="aspect-[4/5] w-full rotate-[1.5deg] rounded-2xl shadow-xl shadow-navy/15"
            caption="Portrait of the headteacher: to be added with consent"
          />
          <p className="mt-8 font-serif text-2xl leading-snug text-navy">
            <span aria-hidden className="mr-2 text-gold">“</span>
            {welcome.pullQuote}
            <span aria-hidden className="ml-1 text-gold">”</span>
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-24 grid max-w-4xl grid-cols-1 gap-6 px-5 md:grid-cols-2">
        <Reveal>
          <Card className="h-full border-l-4 border-gold">
            <CardHeader>
              <CardTitle className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Our mission
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <p className="font-serif text-xl leading-relaxed text-navy">{welcome.mission}</p>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="h-full border-l-4 border-navy">
            <CardHeader>
              <CardTitle className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Our vision
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <p className="font-serif text-xl leading-relaxed text-navy">{welcome.vision}</p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
