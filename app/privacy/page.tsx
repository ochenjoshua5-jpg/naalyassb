import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page/page-hero";
import { SectionNav } from "@/components/page/section-nav";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { DATA_RETENTION } from "@/lib/content";
import { SCHOOL, COPY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "How Naalya Secondary School, Bweyogerere Campus, handles information about families, children and visitors.",
};

const SECTIONS = [
  { id: "plain-words", label: "In plain words" },
  { id: "what-we-collect", label: "What this website collects" },
  { id: "cookies", label: "Cookies" },
  { id: "photos", label: "Photographs of children" },
  { id: "enquiries", label: "Enquiries and applications" },
  { id: "data-retention", label: "Data retention" },
  { id: "your-rights", label: "Your rights" },
  { id: "contact", label: "Who to ask" },
] as const;

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
      <Reveal>
        <h2 id={`${id}-title`} className="font-serif text-3xl font-semibold tracking-[-0.02em] text-navy md:text-4xl">
          {title}
        </h2>
        <div className="mt-5 max-w-2xl space-y-5 text-lg leading-[1.8] text-navy/90">{children}</div>
      </Reveal>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        id="privacy-title"
        eyebrow="Privacy notice"
        title="How we look after information about your family."
        lead="Sharing information about your child is a big step, so we keep it to the minimum and use it only for school purposes. This notice explains what this website does, and how to ask us questions."
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-5 py-20 md:py-28 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-16">
        <div className="min-w-0 space-y-24">
          <SectionNav label="On this page, mobile" items={SECTIONS} className="lg:hidden" />

          <Block id="plain-words" title="In plain words">
            <p>
              This website is a public information site for {SCHOOL.name}, {SCHOOL.campus}. It explains the school,
              its programmes and how to apply. It does not take payments and it does not hold student records.
            </p>
            <p>
              Applications are made on the official Education Hub. Enquiries go through the school’s admissions
              page. Those services have their own privacy arrangements, which the school will confirm and link to
              from here.
            </p>
          </Block>

          <Block id="what-we-collect" title="What this website collects">
            <p>
              This website has no sign-up, login, payment or contact form. It does not ask for national ID numbers,
              medical records, marks or financial details.
            </p>
            <p>
              This site does not use analytics or advertising trackers, and it loads its fonts from the website
              itself rather than from a third-party service.
            </p>
          </Block>

          <Block id="cookies" title="Cookies">
            <p>
              The site sets one essential cookie. It remembers your choice on the cookie banner, so the banner does
              not keep appearing. Essential cookies cannot be switched off, because the site cannot remember your
              choice without them.
            </p>
            <p>
              Analytics and marketing are off. No analytics or marketing script is loaded. If the school adds either
              later, it will load only after you give your consent.
            </p>
          </Block>

          <Block id="photos" title="Photographs of children">
            <p>
              We publish photographs of children only when a parent or guardian has given permission, and that
              permission is recorded before the photograph is shown. This applies to any photograph where a child can
              be recognised.
            </p>
            <p>
              Photographs published on this website and any school social media platforms are shared with recorded
              guardian consent. Consent forms are available from the school office. If you wish to withdraw consent
              already given, please contact the school administration in writing.
            </p>
          </Block>

          <Block id="enquiries" title="Enquiries and applications">
            <p>
              If you contact the school or apply, we use your details to answer your question or process your
              application, and for nothing else without asking you first.
            </p>
          </Block>

          <Block id="data-retention" title="Data retention">
            <p>
              The school keeps personal records only for as long as they are needed for the purpose they were
              collected, in line with good practice and Uganda’s Data Protection and Privacy Act, 2019.
            </p>
            <table className="mt-4 w-full text-left border-collapse text-base leading-[1.7] text-ink-muted">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-3 text-left text-sm font-semibold text-navy">Data type</th>
                  <th className="py-3 text-left text-sm font-semibold text-navy">Retention period</th>
                  <th className="py-3 text-left text-sm font-semibold text-navy">Access</th>
                </tr>
              </thead>
              <tbody>
                {DATA_RETENTION.map((row) => (
                  <tr key={row.type} className="border-b border-line/50 hover:bg-soft-grey">
                    <td className="py-3 font-semibold text-navy">{row.type}</td>
                    <td className="py-3">{row.retention}</td>
                    <td className="py-3">{row.access}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Exact figures are subject to school sign-off. Uganda’s Data Protection and Privacy Act, 2019 governs
              personal data — compliance with this Act is mandatory.
            </p>
          </Block>

          <Block id="your-rights" title="Your rights">
            <p>
              Uganda’s Data Protection and Privacy Act, 2019 gives you rights over your personal data. These include
              the right to access the personal data held about you, and the right to ask us to stop processing it
              where that causes unwarranted damage or distress, or where it is used for direct marketing.
            </p>
            <p>
              The Act requires the consent of a parent or guardian before a child’s personal data is collected or
              processed. The school’s process for this is confirmed through the consent forms available from the
              school office.
            </p>
          </Block>

          <Block id="contact" title="Who to ask">
            <p>
              For any question about your information, please contact the school. The privacy contact details will
              appear here once confirmed by the Headteacher’s office.
            </p>
            <p className="mt-3">
              In the meantime, use the{" "}
              <Link href="/contact" className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4">
                contact page
              </Link>
              to reach the campus office.
            </p>
          </Block>
        </div>

        <aside className="hidden lg:block" aria-label="Page navigation">
          <SectionNav label="On this page" items={SECTIONS} />
        </aside>
      </div>
    </>
  );
}
