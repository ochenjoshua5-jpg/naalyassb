import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { COPY } from "@/lib/site";
import { NEWS_ITEMS } from "@/lib/content";

/*
 * News preview on the homepage. Shows approved notices when available,
 * otherwise falls back to placeholder text.
 */
export function News() {
  const { news } = COPY;

  return (
    <section id="news" aria-labelledby="news-title" className="scroll-mt-20 bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">{news.eyebrow}</p>
          <h2 id="news-title" className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
            {news.title}
          </h2>
          <p className="mt-5 text-lg leading-[1.7] text-ink-muted">{news.intro}</p>
        </Reveal>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {NEWS_ITEMS.length > 0 ? (
            NEWS_ITEMS.map((item, index) => (
              <RevealItem key={item.date} className={index === 1 ? "md:mt-12" : undefined}>
                <Card className="flex h-full gap-4 p-4 sm:gap-5 sm:p-6">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                      <h3 className="min-w-0 font-serif text-xl font-semibold leading-snug text-navy sm:text-2xl">
                        {item.title}
                      </h3>
                      <Badge variant="navy">{item.date}</Badge>
                    </div>
                    <p className="mt-3 leading-relaxed text-ink-muted">{item.excerpt}</p>
                    <p className="mt-auto pt-4 text-sm font-medium text-ink-muted">
                      {item.department}
                    </p>
                  </div>
                </Card>
              </RevealItem>
            ))
          ) : (
            <RevealItem>
              <Card className="flex h-full gap-4 p-4 sm:gap-5 sm:p-6">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                    <h3 className="min-w-0 font-serif text-xl font-semibold leading-snug text-navy sm:text-2xl">
                      No notices yet
                    </h3>
                    <Badge variant="navy">Check back soon</Badge>
                  </div>
                  <p className="mt-3 leading-relaxed text-ink-muted">
                    Approved notices and term dates will appear here as the school confirms them.
                  </p>
                </div>
              </Card>
            </RevealItem>
          )}
        </RevealGroup>
      </div>
    </section>
  );
}
