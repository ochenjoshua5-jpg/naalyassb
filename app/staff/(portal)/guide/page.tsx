import type { Metadata } from "next";
import { Panel } from "@/components/staff/ui";

export const metadata: Metadata = { title: "Staff guide" };

const sections: { id?: string; title: string; body: string[] }[] = [
  {
    title: "Signing in",
    body: [
      "The Headmaster creates every staff account. There is no public sign-up.",
      "You will be asked for a second step (a code from your phone) each time you sign in on a new device.",
      "Your session ends after 8 hours. Sign out when you leave a shared computer.",
      "If you cannot sign in, do not try many times. Tell the Headmaster.",
    ],
  },
  {
    title: "Today’s enquiries",
    body: [
      "The Overview shows what needs you first. A red box means an enquiry has waited more than 24 hours. Reply to that family first.",
      "New enquiries arrive here within about 30 seconds. The bell at the top shows the newest ones.",
    ],
  },
  {
    title: "Working an enquiry",
    body: [
      "Open Enquiries. Each person’s enquiry shows their details and their question. Use View to open it.",
      "To change a status, choose Change next to it, or on the Board drag the card to another column. On a keyboard, focus the grip, press Space, use the arrow keys, then Space again.",
      "New means no reply yet. Contacted means you have replied. Visit scheduled and Enrolled are for when they happen. Withdrawn means the family has stopped.",
    ],
  },
  {
    title: "Many at once",
    body: [
      "Tick the boxes beside several enquiries, then choose Mark as Contacted. Only enquiries still marked New change. Others are left as they are.",
    ],
  },
  {
    title: "Finding someone",
    body: [
      "Type a name, a phone number or a reference (for example ENQ-) in the search box. Phone numbers work with 0772… or +256772….",
      "Press Ctrl K (or ⌘ K on a Mac) to search from anywhere.",
    ],
  },
  {
    title: "Exporting to a spreadsheet",
    body: [
      "Export to CSV saves the enquiries you are looking at. The file contains parents’ personal details.",
      "Keep it on the school’s computer, do not send it to a personal email account, and delete it when you no longer need it.",
    ],
  },
  {
    title: "Deleting an enquiry",
    body: [
      "Only the Headmaster can delete an enquiry, and only to correct a mistake or after a family asks. A deleted enquiry cannot be recovered.",
    ],
  },
  {
    title: "News and notices",
    body: [
      "Write the headline, then the article. Use Heading 2 or 3 for sections, Bullet list for lists, and Link for web addresses (they must start with https://).",
      "Every picture needs a description for people who cannot see it. Use only approved school photos.",
      "Preview shows how the article will look on the News page.",
      "Your draft is saved on this computer every 30 seconds. Publishing is not switched on yet, so drafts are not visible to parents.",
    ],
  },
  {
    id: "problem",
    title: "Reporting a problem",
    body: [
      "Tell the Headmaster in person, or use the school’s contact details once they are confirmed and shown here.",
      "Do not put parents’ names, phone numbers or other personal details in a message about a problem. Say which page you were on and what you saw.",
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold text-navy md:text-4xl">Staff guide</h1>
        <p className="mt-2 text-base text-ink-muted">
          How to use the staff portal, in plain English. Ask a colleague if anything is unclear.
        </p>
        <p className="mt-3 rounded-xl bg-gold-tint px-4 py-3 text-sm font-semibold text-navy">
          Some of this describes the sign-in set-up that the school confirms before the dashboard goes live.
        </p>
      </header>
      {sections.map((section) => (
        <Panel key={section.title} className="scroll-mt-24" >
          <section id={section.id} aria-labelledby={`guide-${section.id ?? section.title.replace(/\W+/g, "-").toLowerCase()}`}>
            <h2 id={`guide-${section.id ?? section.title.replace(/\W+/g, "-").toLowerCase()}`} className="font-serif text-2xl font-semibold text-navy">
              {section.title}
            </h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-base leading-[1.7] text-navy">
              {section.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        </Panel>
      ))}
    </div>
  );
}
