import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page/page-hero";
import { PendingNote, PendingTag } from "@/components/page/pending";
import { SectionNav } from "@/components/page/section-nav";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { SCHOOL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "How Naalya Secondary School, Bweyogerere Campus, handles information about families, children and visitors. A draft for school review.",
};

const SECTIONS = [
  { id: "plain-words", label: "In plain words" },
  { id: "what-we-collect", label: "What this website collects" },
  { id: "photos", label: "Photographs of children" },
  { id: "enquiries", label: "Enquiries and applications" },
  { id: "your-rights", label: "Your rights" },
  { id: "contact", label: "Who to ask" },
  { id: "to-confirm", label: "Still to confirm" },
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
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default" className="px-4 py-1.5 text-[0.95rem]">
            Draft for school review
          </Badge>
          <PendingTag />
        </div>
      </PageHero>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-5 py-20 md:py-28 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-16">
        <div className="min-w-0 space-y-24">
          <SectionNav label="On this page, mobile" items={SECTIONS} className="lg:hidden" />

          <Block id="plain-words" title="In plain words">
            <p>
              This website is a public information site for {SCHOOL.name}, {SCHOOL.campus}. It explains the school, its
              programmes and how to apply. It does not take payments and it does not hold student records.
            </p>
            <p>
              Applications are made on the official Education Hub. Enquiries go through the school’s admissions page.
              Those services have their own privacy arrangements, which the school will confirm and link to from here.
            </p>
          </Block>

          <Block id="what-we-collect" title="What this website collects">
            <p>
              This website has no sign-up, login, payment or contact form. It does not ask for national ID numbers,
              medical records, marks or financial details.
            </p>
            <p>
              This preview does not use analytics or advertising trackers, and it loads its fonts from the website itself
              rather than from a third-party service. Before launch, the school will confirm whether any analytics are
              added, and this notice will say so.
            </p>
          </Block>

          <Block id="cookies" title="Cookies">
            <p>
              The site sets one essential cookie. It remembers your choice on the cookie banner, so the banner does not
              keep appearing. Essential cookies cannot be switched off, because the site cannot remember your choice
              without them.
            </p>
            <p>
              Analytics and marketing are off. The banner starts with both unticked, and no analytics or marketing
              script is loaded. If the school adds either later, it will load only after you tick that category. To see
              the banner again, clear this site’s cookies.
            </p>
          </Block>

          <Block id="photos" title="Photographs of children">
            <p>
              We publish photographs of children only when a parent or guardian has given permission, and that permission
              is recorded before the photograph is shown. This applies to any photograph where a child can be recognised.
            </p>
            <p>
              Until the school approves its photographs, this website shows colour placeholders instead of pictures of
              students. Nothing on this site shows a real child who has not been approved.
            </p>
          </Block>

          <Block id="enquiries" title="Enquiries and applications">
            <p>
              If you contact the school or apply, we use your details to answer your question or process your application,
              and for nothing else without asking you first.
            </p>
            <PendingNote>
              How long enquiry and application records are kept, and who can see them at the school, are pending school
              confirmation.
            </PendingNote>
          </Block>

          <Block id="your-rights" title="Your rights">
            <p>
              Uganda’s Data Protection and Privacy Act, 2019 gives you rights over your personal data. These include the
              right to access the personal data held about you, and the right to ask us to stop processing it where that
              causes unwarranted damage or distress, or where it is used for direct marketing.
            </p>
            <p>
              The Act requires the consent of a parent or guardian before a child’s personal data is collected or
              processed. The school’s process for this is still to be confirmed.
            </p>
          </Block>

          <Block id="contact" title="Who to ask">
            <p>
              For any question about your information, please contact the school. The school will name the person who
              handles privacy questions, and the contact details will appear here once confirmed.
            </p>
            <PendingNote>
              Name, role and contact details of the privacy contact: pending HM approval. Until then, use the{" "}
              <Link href="/contact" className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4">
                contact page
              </Link>
              .
            </PendingNote>
          </Block>

          <Block id="to-confirm" title="Still to confirm">
            <p>
              This notice is a draft. The school should confirm each of the following before it is published, and we
              will update the notice with the answers.
            </p>
            <ul className="list-disc space-y-3 pl-6 text-base leading-[1.7] text-ink-muted marker:text-gold">
              <li>The legal name of the organisation that is responsible for personal data at the campus.</li>
              <li>The privacy contact person, role and contact details.</li>
              <li>How long enquiry and application records are kept, and how they are deleted.</li>
              <li>
                Where the website is hosted. If data is stored or processed outside Uganda, this notice must say so.
              </li>
              <li>The school’s child protection and safeguarding statement.</li>
              <li>Whether the school will use any analytics or messaging tools on this site.</li>
            </ul>
            <p className="text-base leading-[1.7] text-ink-muted">
              This draft is not legal advice. The school’s privacy contact should review it before it is published.
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
