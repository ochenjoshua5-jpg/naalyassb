import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * Mini-hero for every content page: eyebrow, one clear title, a short lead.
 * It has no stock imagery; the navy band and gold accent carry the page.
 */
export function PageHero({
  id,
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn("relative overflow-hidden bg-navy pb-20 pt-36 text-warm-white md:pb-24 md:pt-44", className)}
    >
      <div aria-hidden className="grain absolute inset-0 -z-10 opacity-40" />
      <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-[28rem] rounded-full bg-gold/15 blur-3xl" />
      <Reveal className="mx-auto max-w-6xl px-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
        <h1 id={id} className="mt-4 max-w-3xl font-serif text-4xl font-semibold tracking-[-0.025em] sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-[1.75] text-warm-white/85 md:text-xl">{lead}</p>
        {children ? <div className="mt-10">{children}</div> : null}
      </Reveal>
    </section>
  );
}
