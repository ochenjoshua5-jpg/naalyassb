import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Trees } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhotoPlaceholder } from "@/components/brand/photo-placeholder";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { COPY, SCHOOL } from "@/lib/site";
import { cn } from "@/lib/utils";

const ICONS = {
  olevel: BookOpen,
  alevel: GraduationCap,
  campus: Trees,
} as const;

export function Programmes() {
  const { programmes } = COPY;

  return (
    <section id="programmes" aria-labelledby="programmes-title" className="scroll-mt-20 bg-soft-grey py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">{programmes.eyebrow}</p>
          <h2 id="programmes-title" className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
            {programmes.title}
          </h2>
          <p className="mt-5 text-lg leading-[1.7] text-ink-muted">{programmes.intro}</p>
        </Reveal>

        <RevealGroup className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start">
          {programmes.items.map((item, index) => {
            const Icon = ICONS[item.key];
            return (
              <RevealItem key={item.key} className={cn(index === 1 && "md:mt-20")}>
                <Card className="flex h-full flex-col overflow-hidden border-l-4 border-gold">
                  <PhotoPlaceholder
                    tone={item.key === "alevel" ? "gold" : "navy"}
                    className="h-44 rounded-none"
                  />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-3xl">{item.title}</CardTitle>
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-tint text-navy">
                        <Icon aria-hidden />
                      </span>
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">{item.kicker}</p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="text-[1.0625rem]">{item.body}</CardDescription>
                    {item.subjects.length > 0 ? (
                      <div className="mt-6">
                        <p className="mb-3 text-sm font-semibold text-navy">Subjects include</p>
                        <ul className="flex flex-wrap gap-2" aria-label={`${item.title} subjects`}>
                          {item.subjects.map((subject) => (
                            <li key={subject}>
                              <Badge variant="outline" className="font-medium">
                                {subject}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="link" size="default">
                      <Link href={SCHOOL.campusUrl}>
                        Learn more on the school website
                        <ArrowRight aria-hidden />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal className="mt-24 grid grid-cols-1 gap-10 border-t border-navy/10 pt-14 md:grid-cols-3 md:gap-8">
          {programmes.learning.map((point, index) => (
            <div key={point.title}>
              <p aria-hidden className="font-serif text-4xl font-semibold text-navy/30">
                0{index + 1}
              </p>
              <h3 className="mt-3 font-serif text-2xl font-semibold text-navy">{point.title}</h3>
              <p className="mt-3 leading-[1.7] text-ink-muted">{point.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
