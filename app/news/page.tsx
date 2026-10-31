import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionNav } from "@/components/page/section-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { NEWS_CATEGORIES, NEWS_ITEMS } from "@/lib/content";
import { SCHOOL } from "@/lib/site";

export const metadata: Metadata = {
  title: "News and events",
  description:
    "Notices, term dates and events from Naalya Secondary School, Bweyogerere Campus. Each item shows a confirmed date and the department that issued it.",
};

export default function NewsPage() {
  const hasItems = NEWS_ITEMS.length > 0;

  return (
    <>
      <PageHero
        id="news-title"
        eyebrow="News and events"
        title="Notices and dates from the campus."
        lead="Parents check this page for announcements, term dates and event reminders. Each item shows a confirmed date and the department that issued it."
      />

      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <p className="max-w-2xl text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Notice categories
          </p>
          <ul className="mt-4 flex flex-wrap gap-2.5" aria-label="Notice categories">
            {NEWS_CATEGORIES.map((category) => (
              <li key={category}>
                <Badge variant="outline" className="px-4 py-1.5 text-[0.95rem]">
                  {category}
                </Badge>
              </li>
            ))}
          </ul>
        </Reveal>

        {hasItems ? (
          <ul className="mt-14 grid gap-6 md:grid-cols-2">
            {NEWS_ITEMS.map((item) => (
              <Reveal as="li" key={`${item.date}-${item.title}`}>
                <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm shadow-navy/5">
                  <div className="flex flex-col gap-4 p-7 md:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="navy">
                        <CalendarDays aria-hidden className="size-4" />
                        {item.date}
                      </Badge>
                      <Badge>{item.category}</Badge>
                    </div>
                    <h2 className="font-serif text-2xl font-semibold text-navy">{item.title}</h2>
                    <p className="text-base leading-[1.7] text-ink-muted">{item.excerpt}</p>
                    <p className="text-sm font-semibold text-navy">{item.department}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        ) : (
          <Reveal className="mt-14">
            <div className="grid gap-8 rounded-3xl bg-card p-8 shadow-sm shadow-navy/5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-12">
              <div>
                <h2 className="font-serif text-3xl font-semibold text-navy md:text-4xl">
                  No notices are published yet
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-[1.75] text-ink-muted">
                  Once the school approves a notice, it will appear here with its confirmed date and the department
                  that issued it. Term dates will be listed on the{" "}
                  <Link href="/academics#calendar" className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4">
                    academics page
                  </Link>{" "}
                  when confirmed.
                </p>
              </div>
              <Button asChild variant="outline" size="lg">
                <a href={SCHOOL.socialUrl} target="_blank" rel="noopener noreferrer">
                  Follow the school on X
                  <ArrowUpRight aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </Button>
            </div>
          </Reveal>
        )}

        <Reveal className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-card p-8 shadow-sm shadow-navy/5">
            <h3 className="font-serif text-2xl font-semibold text-navy">Stay updated</h3>
            <p className="mt-3 text-base leading-[1.7] text-ink-muted">
              Follow Naalya Schools on social media for real-time updates, or check back here for new notices as they
              are approved by the school.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-4">
              <a href={SCHOOL.socialUrl} target="_blank" rel="noopener noreferrer">
                Follow on X
                <ArrowUpRight aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
          </div>
          <div className="rounded-2xl bg-card p-8 shadow-sm shadow-navy/5">
            <h3 className="font-serif text-2xl font-semibold text-navy">Term dates</h3>
            <p className="mt-3 text-base leading-[1.7] text-ink-muted">
              Confirmed term dates for 2026 are published on the academics page. Check there for the full calendar,
              holiday breaks and reporting dates.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-4">
              <Link href="/academics#calendar">View term dates</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </>
  );
}
