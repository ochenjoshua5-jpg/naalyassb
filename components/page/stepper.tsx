import { cn } from "@/lib/utils";

/**
 * Ordered admissions journey. A vertical list on phones and a horizontal track
 * on wide screens. The numbers are the reading order, and each step is a real
 * list item for screen readers.
 */
export function Stepper({
  steps,
  className,
}: {
  steps: ReadonlyArray<{ title: string; body: string }>;
  className?: string;
}) {
  return (
    <ol className={cn("grid gap-6 md:grid-cols-4 md:gap-4", className)}>
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="relative flex gap-5 rounded-2xl bg-card p-6 shadow-sm shadow-navy/5 md:flex-col md:p-7"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-navy font-serif text-xl font-semibold text-warm-white shadow-md shadow-navy/20">
            {index + 1}
          </span>
          <div>
            <h3 className="font-serif text-2xl font-semibold text-navy">{step.title}</h3>
            <p className="mt-2 text-base leading-[1.7] text-ink-muted">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
