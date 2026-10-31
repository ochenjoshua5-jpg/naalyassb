/**
 * Structured content for the public pages.
 *
 * Shape of the data follows a CMS-style content model (one typed record per
 * item, with a source and an approval status), so the school can later move it
 * into a CMS without rewriting the pages.
 *
 * Rules for every value in this file:
 *  - Only text the school has published, or text the school has confirmed, is
 *    shown as published. Anything else is `null` and is displayed as
 *    "Pending HM Approval".
 *  - No statistics, fees, testimonials, results, dates or contact details are
 *    invented. The Day 3 quality gate applies.
 *  - Child photographs are never added without a recorded guardian consent.
 *  - The full list of sources and open questions is kept in docs/CONTENT-REVIEW.md.
 */

export const PENDING_LABEL = "Pending HM Approval";

/** Where a piece of published content came from. */
export const SOURCE_URLS = {
  campus: "https://naalyaschools.ac.ug/campuses/bweyogerere",
  about: "https://naalyaschools.ac.ug/about",
  admissions: "https://naalyaschools.ac.ug/admissions",
  leadership: "https://naalyaschools.ac.ug/leadership",
} as const;

export type ApprovalStatus = "published" | "pending";

/* ---------- About ---------- */

export const TIMELINE: ReadonlyArray<{
  year: string;
  title: string;
  body: string;
  status: ApprovalStatus;
}> = [
  {
    year: "1996",
    title: "Naalya begins in Namugongo",
    body: "A group of professional teachers starts Naalya Secondary Schools with a first campus in Namugongo. Their aim is a school that nurtures strong academic performance and strong moral character.",
    status: "published",
  },
  {
    year: "2004",
    title: "Bweyogerere Campus begins",
    body: "The campus opens in Kira Town Council, Wakiso District, to meet the rising demand for quality secondary education in the Naalya area.",
    status: "published",
  },
  {
    year: "Next",
    title: "Further milestones",
    body: "The school will confirm the milestones it would like to share from the campus’s history.",
    status: "pending",
  },
];

export const VALUES = [
  { title: "Excellence", body: "We strive for the highest standards in academics, character, and personal growth." },
  { title: "Integrity", body: "We believe in honesty, transparency, and doing what’s right, even when no one is watching." },
  { title: "Discipline", body: "We nurture focus, responsibility, and respect to build strong, principled individuals." },
  { title: "Innovation", body: "We embrace creativity and modern learning approaches that inspire new ways of thinking." },
] as const;

export const CAMPUS_TEAM: ReadonlyArray<{ name: string; role: string }> = [
  { name: "Sheikh Mutaka Hussein", role: "Deputy Headteacher, General Duties" },
  { name: "Ms. Akinyi Millicent", role: "Deputy Headteacher, Administration" },
  { name: "Ms. Balinja Grace", role: "Director of Studies, O-Level" },
  { name: "Mr. Masembe Ashadu", role: "Director of Studies, A-Level" },
  { name: "Ms. Nantale Margareth", role: "Senior Woman Teacher" },
];

export const CAMPUS_CHAIR = { name: "Dr. Mpoza John Baptist (PhD)", role: "Chairman, Bweyogerere Campus" };

export const FACILITIES = [
  {
    title: "Enriched library",
    body: "An extensive collection of books, journals and digital resources to support academic research and reading.",
  },
  {
    title: "Boarding dormitories",
    body: "Clean, secure and comfortable boarding facilities with proper supervision and care for students.",
  },
  {
    title: "ICT laboratories",
    body: "Computer labs and centres with internet access for digital learning and technology skill development.",
  },
  {
    title: "Dining hall",
    body: "Hygienic dining facilities serving nutritious, balanced meals to support student health and growth.",
  },
] as const;

/* ---------- Academics ---------- */

export const OLEVEL_SUBJECTS = {
  sciences: [
    "Mathematics",
    "Biology",
    "Chemistry",
    "Physics",
    "Computer studies",
    "Physical Education",
    "Agriculture",
    "Technical Drawing",
    "Food and Nutrition",
  ],
  arts: [
    "English Language",
    "Geography",
    "History & Political Education",
    "Divinity / Religious Studies",
    "Fine Art",
    "Literature in English",
    "Entrepreneurship",
    "Performing Arts",
    "Languages",
    "Economics",
  ],
  subsidiaries: ["Subsidiary Mathematics", "General Paper", "Subsidiary ICT"],
} as const;

/* ---------- School life ---------- */

export const CO_CURRICULAR: ReadonlyArray<{ title: string; body: string }> = [
  { title: "Music and dance", body: "Empowering creativity through music, dance, rhythm and vibrant cultural expression." },
  { title: "Drama and debate", body: "Developing confidence, clarity and critical thinking through speech and stage." },
  { title: "Arts and craft", body: "Celebrating creativity through visual art, design and expressive craftsmanship." },
  {
    title: "Electrical & Electronics Innovation Club",
    body: "Building real-world skills in wiring, circuitry and electronics through hands-on practice.",
  },
  { title: "Sports and athletics", body: "Building teamwork and confidence through active participation and healthy competition." },
  { title: "Blood donation", body: "Students take part in blood donation activities to help save lives." },
];

export const CARE = [
  { title: "A structured daily routine", body: "Schedules that balance academics, meals, sports, prep time and rest." },
  { title: "Discipline and integrity", body: "A culture of respect, honesty and responsibility, preparing students to be principled citizens." },
  { title: "Mentorship", body: "Experienced teachers and prefects guide students through academic and personal challenges." },
  { title: "Counselling", body: "Dedicated counsellors and support staff look after each student’s emotional and social wellbeing." },
  { title: "Character development", body: "Programmes that build leadership, teamwork, empathy and life skills beyond the classroom." },
  { title: "A balanced life", body: "A healthy balance between academics, co-curricular activities, friendships and personal growth." },
];

/** Published as "A typical day at Bweyogerere Campus". The school should confirm each time. */
export const DAILY_ROUTINE: ReadonlyArray<{ time: string; activity: string }> = [
  { time: "4:00 AM", activity: "Wake up and morning routine" },
  { time: "5:00 AM", activity: "Morning preps and study time" },
  { time: "6:00 AM", activity: "Breakfast" },
  { time: "6:30 AM", activity: "Morning prayers and assembly" },
  { time: "7:00 AM", activity: "Morning classes" },
  { time: "10:00 AM", activity: "Breakfast (as published; the school to confirm whether this is a break)" },
  { time: "10:20 AM", activity: "Classes" },
  { time: "1:00 PM", activity: "Lunch" },
  { time: "2:00 PM", activity: "Classes resume" },
  { time: "4:40 PM", activity: "Co-curricular activities (published as 4:40; the school to confirm AM or PM)" },
  { time: "6:00 PM", activity: "Dinner" },
  { time: "7:00 PM", activity: "Evening prep" },
];

/* ---------- News ---------- */

/** Categories proposed for notices. The school has not yet approved them. */
export const NEWS_CATEGORIES = ["Academics", "Sports", "Events", "Announcements"] as const;

/**
 * Notices are added here only when the school has approved them, with a real
 * date and a named department. Keep this empty until then.
 */
export interface NewsItem {
  title: string;
  date: string; // a confirmed date, never a guessed one
  department: string; // e.g. "Admissions Office" or "Headteacher’s Office"
  category: (typeof NEWS_CATEGORIES)[number];
  excerpt: string;
  image: { src: string; alt: string; consentObtained: boolean } | null;
  approvedBy: string; // the approver's role; required before publication
}
export const NEWS_ITEMS: ReadonlyArray<NewsItem> = [];

/* ---------- Admissions ---------- */

export const FAQ: ReadonlyArray<{ question: string; answer: string | null }> = [
  {
    question: "When do newly admitted students report to school?",
    answer:
      "Students are expected to report to the assigned campus by 5:00pm on the specified reporting date indicated in their admission letter. A reserved place is only guaranteed for two weeks, unless prior communication is made to the school.",
  },
  {
    question: "How do I apply?",
    answer:
      "Start an application on the official Education Hub, or make an enquiry on the school’s admissions page. You can also come to school to pick up a form.",
  },
  {
    question: "Do you offer day and boarding places?",
    answer: "Bweyogerere Campus offers both day and boarding options.",
  },
  {
    question: "What behaviour does the school expect from students?",
    answer:
      "Discipline is guided by respect, punctuality and integrity. The full student rules are pending HM approval.",
  },
  { question: "What age range do you accept?", answer: null },
  { question: "What uniform items do students need?", answer: null },
  { question: "Are mobile phones or electronic gadgets allowed at school?", answer: null },
  { question: "When can parents visit students?", answer: null },
  { question: "What is required from parents or guardians?", answer: null },
  { question: "What do the fees cover, and how much are they?", answer: null },
  { question: "Is school transport available?", answer: null },
];

export const ENTRY_REQUIREMENTS: string | null = null;
export const ADMISSION_DATES: string | null = null;
