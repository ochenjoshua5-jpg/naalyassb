import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SCHOOL } from "@/lib/site";

/**
 * Verified routes shown whenever the online form is not available.
 * Phone and email appear only when the school has confirmed them in lib/site.ts.
 */
export function EnquiryFallback({ variant }: { variant: "closed" | "error" }) {
  const heading =
    variant === "closed" ? "Online enquiries aren’t open yet" : "We couldn’t send your enquiry just now";
  const intro =
    variant === "closed"
      ? "While we finish setting up this form, you can reach the school in these ways."
      : "Your details have not been saved. You can try again in a few minutes, or use one of these routes.";

  return (
    <section aria-labelledby="fallback-title" className="space-y-8">
      <div>
        <h2 id="fallback-title" className="font-serif text-3xl font-semibold tracking-[-0.02em] text-navy sm:text-4xl">
          {heading}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">{intro}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full p-7">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl">Apply on the Education Hub</CardTitle>
          </CardHeader>
          <CardContent className="mt-4 p-0">
            <p className="text-base leading-[1.75] text-ink-muted">
              The school’s official application system. Start or continue your application there.
            </p>
            <Button asChild className="mt-6">
              <a href={SCHOOL.applyUrl}>
                Start an application
                <ArrowUpRight aria-hidden />
                <span className="sr-only">(opens the Education Hub)</span>
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="h-full p-7">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl">Admissions steps and questions</CardTitle>
          </CardHeader>
          <CardContent className="mt-4 p-0">
            <p className="text-base leading-[1.75] text-ink-muted">
              Read how to join and the questions parents ask most often on our admissions page.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/admissions">See the admissions page</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="h-full p-7 md:col-span-2">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl">Call, email or write</CardTitle>
          </CardHeader>
          <CardContent className="mt-4 p-0">
            {SCHOOL.phone || SCHOOL.email ? (
              <ul className="space-y-3 text-base text-ink-muted">
                {SCHOOL.phone ? (
                  <li className="flex items-center gap-3">
                    <Phone aria-hidden className="size-5 text-navy" />
                    <a className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4" href={`tel:${SCHOOL.phone.replace(/\s/g, "")}`}>
                      {SCHOOL.phone}
                    </a>
                  </li>
                ) : null}
                {SCHOOL.email ? (
                  <li className="flex items-center gap-3">
                    <Mail aria-hidden className="size-5 text-navy" />
                    <a className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4" href={`mailto:${SCHOOL.email}`}>
                      {SCHOOL.email}
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="text-base leading-[1.75] text-ink-muted">
                The school’s phone number and email address will be shown here once the school confirms them. Until then,
                please use the Education Hub or the admissions page above, or follow the school on{" "}
                <a className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4" href={SCHOOL.socialUrl} rel="noopener noreferrer">
                  X ({SCHOOL.socialHandle})
                </a>
                .
              </p>
            )}
            <p className="mt-4 text-base text-ink-muted">
              You can also see the <Link href="/contact" className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4">contact page</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
