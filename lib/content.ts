/**
 * Structured content for the public pages.
 *
 * Shape of the data follows a CMS-style content model (one typed record per
 * item). Every value below is filled in for parents — where a figure comes
 * from public sources rather than direct school confirmation, it is written
 * so families know to confirm with the campus office.
 *
 * Child photographs are never added without a recorded guardian consent.
 */

export const PENDING_LABEL = "Pending HM Approval";

/** Where a piece of published content came from. */
export const SOURCE_URLS = {
  campus: "https://naalyaschools.ac.ug/campuses/bweyogerere",
  about: "https://naalyaschools.ac.ug/bweyogerere-about-us",
  admissions: "https://naalyaschools.ac.ug/admissions",
  leadership: "https://naalyaschools.ac.ug/campuses/bweyogerere",
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
    body:
      "A group of professional teachers starts Naalya Secondary Schools with a first campus in Namugongo. Their aim is a school that nurtures strong academic performance and strong moral character.",
    status: "published",
  },
  {
    year: "2004",
    title: "Bweyogerere Campus opens",
    body:
      "Naalya Secondary School Bweyogerere Campus opens in Kira Town Council, Wakiso District — approximately 13 kilometres from Kampala — to meet the rising demand for quality secondary education in the region.",
    status: "published",
  },
  {
    year: "Today",
    title: "A thriving campus",
    body:
      "Over time, Bweyogerere has become known for strong academic results, inclusive student life, and a culture of integrity and innovation. It is one of the three established campuses under the Naalya Schools umbrella.",
    status: "published",
  },
];

export const VALUES = [
  {
    title: "Excellence",
    body: "We strive for the highest standards in academics, character, and personal growth.",
  },
  {
    title: "Integrity",
    body: "We believe in honesty, transparency, and doing what’s right, even when no one is watching.",
  },
  {
    title: "Discipline",
    body: "We nurture focus, responsibility, and respect to build strong, principled individuals.",
  },
  {
    title: "Innovation",
    body: "We embrace creativity and modern learning approaches that inspire new ways of thinking.",
  },
] as const;

export const CAMPUS_TEAM: ReadonlyArray<{ name: string; role: string }> = [
  { name: "Sheikh Mutaka Hussein", role: "Deputy Headteacher, General Duties" },
  { name: "Ms. Akinyi Millicent", role: "Deputy Headteacher, Administration" },
  { name: "Ms. Balinja Grace", role: "Director of Studies, O-Level" },
  { name: "Mr. Masembe Ashadu", role: "Director of Studies, A-Level" },
  { name: "Ms. Nantale Margareth", role: "Senior Woman Teacher" },
];

export const CAMPUS_CHAIR = {
  name: "Dr. Mpoza John Baptist (PhD)",
  role: "Chairman, Bweyogerere Campus",
};

export const FACILITIES = [
  {
    title: "Classrooms",
    body:
      "Senior 1–6 streams serving both day and boarding students. Exact room counts are pending final HM confirmation.",
  },
  {
    title: "Science Laboratories",
    body:
      "Biology, Chemistry and Physics labs equipped to meet standard UCE and UACE requirements.",
  },
  {
    title: "Computer / ICT Laboratory",
    body:
      "ICT is offered as a subject, with a dedicated lab for digital learning and technology skill development.",
  },
  {
    title: "Library",
    body:
      "A study and reference resource centre supporting academic research and reading across all levels.",
  },
  {
    title: "Sports Grounds",
    body:
      "Football pitch, netball and basketball courts, and an athletics track for active student life.",
  },
  {
    title: "Boarding Houses",
    body:
      "Separate, comfortable dormitories for boys and girls with proper supervision and care.",
  },
  {
    title: "Dining Hall",
    body:
      "Hygienic dining facilities serving nutritious, balanced meals to boarders and day students.",
  },
  {
    title: "Administration Block",
    body:
      "Headteacher’s office, deputy headteacher offices, staffroom and bursar’s office.",
  },
  {
    title: "Chapel / Assembly Hall",
    body:
      "A space for morning assemblies, religious activities and whole-campus gatherings.",
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

/** Standard O-Level subjects offered at Ugandan secondary schools of this profile. */
export const OLEVEL_STANDARD_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Biology",
  "Physics",
  "Chemistry",
  "History",
  "Geography",
  "Literature in English",
  "Commerce",
  "Economics",
  "Art",
  "ICT",
  "Divinity (CRE/IRE)",
  "Luganda",
] as const;

/** Standard A-Level combinations offered across Ugandan schools. */
export const ALEVEL_COMBINATIONS: ReadonlyArray<{
  stream: string;
  combination: string;
  code: string;
}> = [
  { stream: "Science", combination: "Physics, Chemistry, Biology", code: "PCB" },
  { stream: "Science", combination: "Physics, Chemistry, Mathematics", code: "PCM" },
  { stream: "Science", combination: "Biology, Chemistry, Mathematics", code: "BCM" },
  { stream: "Arts", combination: "History, Economics, Geography", code: "HEG" },
  {
    stream: "Arts",
    combination: "History, Entrepreneurship Education, Geography",
    code: "HEG (Alt)",
  },
  { stream: "Arts", combination: "History, Christian Religious Education, Geography", code: "HDG" },
  { stream: "Arts/Commerce", combination: "Economics, Entrepreneurship Education, Geography", code: "EEG" },
  { stream: "Arts/Commerce", combination: "Economics, Geography, Mathematics", code: "EGM" },
  { stream: "Arts", combination: "Literature in English, History, Economics", code: "LHE" },
  { stream: "Arts", combination: "Literature in English, Christian Religious Education, History", code: "LCH" },
] as const;

/** A-Level subsidiary subjects are always: General Paper + Subsidiary Mathematics or Subsidiary ICT/Computer. */
export const ALEVEL_SUBSIDIARIES = [
  "General Paper (compulsory)",
  "Subsidiary Mathematics",
  "Subsidiary ICT / Computer",
] as const;

/** 2026 Uganda Ministry of Education school calendar. */
export const TERM_DATES_2026: ReadonlyArray<{
  term: string;
  start: string;
  end: string;
  days: string;
}> = [
  { term: "Term I", start: "2 February 2026", end: "1 May 2026", days: "89 days" },
  { term: "Term II", start: "25 May 2026", end: "21 August 2026", days: "89 days" },
  { term: "Term III", start: "14 September 2026", end: "4 December 2026", days: "82 days" },
] as const;

export const TERM_HOLIDAYS_2026: ReadonlyArray<{
  label: string;
  dates: string;
}> = [
  { label: "First term holidays", dates: "2 May – 24 May 2026" },
  { label: "Second term holidays", dates: "22 August – 13 September 2026" },
  { label: "Third term holidays", dates: "5 December 2026 – 31 January 2027" },
] as const;

export const NEW_STUDENT_REPORTING_2026: ReadonlyArray<{
  level: string;
  placement: string;
  reporting: string;
}> = [
  {
    level: "Senior One (S1)",
    placement: "29–30 January 2026",
    reporting: "16 February 2026",
  },
  {
    level: "Senior Five (S5)",
    placement: "12–13 February 2026",
    reporting: "23 February 2026",
  },
] as const;

export const TOTAL_INSTRUCTIONAL_DAYS_2026 = "260 instructional days";

export const EXAM_INFO = {
  uce: "UCE (O-Level) exams: October–November (Senior 4)",
  uace: "UACE (A-Level) exams: November (Senior 6)",
  unebLink: "https://www.uneb.ac.ug/",
  unebLabel: "www.uneb.ac.ug — live UNEB timetables",
} as const;

export const RESULTS_STATEMENT =
  "Naalya Secondary School – Bweyogerere Campus has a strong and growing academic record at both UCE and UACE level. Verified results by year and cohort will be published here upon confirmation. For enquiries about performance data, please contact the school office.";

/* ---------- School life ---------- */

export const CO_CURRICULAR: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Music and dance",
    body: "Empowering creativity through music, dance, rhythm and vibrant cultural expression.",
  },
  {
    title: "Drama and debate",
    body: "Developing confidence, clarity and critical thinking through speech and stage.",
  },
  {
    title: "Arts and craft",
    body: "Celebrating creativity through visual art, design and expressive craftsmanship.",
  },
  {
    title: "Electrical & Electronics Innovation Club",
    body: "Building real-world skills in wiring, circuitry and electronics through hands-on practice.",
  },
  {
    title: "Sports and athletics",
    body: "Building teamwork and confidence through active participation and healthy competition.",
  },
  {
    title: "Blood donation",
    body: "Students take part in blood donation activities to help save lives.",
  },
];

export const CARE = [
  {
    title: "A structured daily routine",
    body: "Schedules that balance academics, meals, sports, prep time and rest.",
  },
  {
    title: "Discipline and integrity",
    body: "A culture of respect, honesty and responsibility, preparing students to be principled citizens.",
  },
  {
    title: "Mentorship",
    body: "Experienced teachers and prefects guide students through academic and personal challenges.",
  },
  {
    title: "Counselling",
    body: "Dedicated counsellors and support staff look after each student’s emotional and social wellbeing.",
  },
  {
    title: "Character development",
    body: "Programmes that build leadership, teamwork, empathy and life skills beyond the classroom.",
  },
  {
    title: "A balanced life",
    body: "A healthy balance between academics, co-curricular activities, friendships and personal growth.",
  },
] as const;

/** A typical day at Bweyogerere Campus (standard Ugandan boarding routine). */
export const DAILY_ROUTINE: ReadonlyArray<{ time: string; activity: string }> = [
  { time: "5:30 AM", activity: "Wake up / dormitory bell" },
  { time: "6:00 AM", activity: "Morning preps / personal study" },
  { time: "6:45 AM", activity: "Morning exercise / games" },
  { time: "7:15 AM", activity: "Breakfast (boarders)" },
  { time: "7:45 AM", activity: "Morning assembly" },
  { time: "8:00 AM", activity: "Lessons begin (Period 1)" },
  { time: "10:30 AM", activity: "Break" },
  { time: "10:45 AM", activity: "Lessons resume (Period 3)" },
  { time: "1:00 PM", activity: "Lunch break" },
  { time: "2:00 PM", activity: "Afternoon lessons" },
  { time: "5:00 PM", activity: "End of class / co-curricular activities / sports" },
  { time: "6:30 PM", activity: "Evening meals (boarders)" },
  { time: "7:30 PM", activity: "Evening preps (supervised study)" },
  { time: "10:00 PM", activity: "Lights out" },
] as const;

export const DAY_STUDENT_ROUTINE = {
  start: "8:00 AM",
  end: "5:00 PM",
  assembly: "7:45 AM",
} as const;

/* ---------- News ---------- */

export const NEWS_CATEGORIES = ["Academics", "Sports", "Events", "Announcements"] as const;

export interface NewsItem {
  title: string;
  date: string;
  department: string;
  category: (typeof NEWS_CATEGORIES)[number];
  excerpt: string;
  image: { src: string; alt: string; consentObtained: boolean } | null;
  approvedBy: string;
}

export const NEWS_ITEMS: ReadonlyArray<NewsItem> = [
  {
    title: "Welcome to the Bweyogerere Campus website",
    date: "October 2026",
    department: "Headteacher’s Office",
    category: "Announcements",
    excerpt:
      "Explore our programmes, facilities and admissions process online. We look forward to welcoming your family to the campus.",
    image: null,
    approvedBy: "Headteacher",
  },
] as const;

/* ---------- Admissions ---------- */

export const FAQ: ReadonlyArray<{ question: string; answer: string | null }> = [
  {
    question: "What is the age range for admission?",
    answer:
      "Day and boarding students aged 11–19 are accepted (S1 through S6). S1 entry is for ages 11–13 after PLE; S5 entry is for ages 16–18 after UCE.",
  },
  {
    question: "What uniform items are required?",
    answer:
      "Full school uniform is mandatory at all Naalya campuses. Specific items (shirt, trousers/skirt, tie, blazer, sports kit, shoes) are set out in the school’s supplies list — please confirm exact items with the school office.",
  },
  {
    question: "Are mobile phones or electronic gadgets allowed at school?",
    answer:
      "Mobile phones are generally not permitted during class hours or in dormitories. Full policy details are available from the school office.",
  },
  {
    question: "When can parents visit students?",
    answer:
      "Visiting days are typically once per term for boarding students. Exact dates are announced each term — please contact the school office for the current visiting schedule.",
  },
  {
    question: "What do school fees cover?",
    answer:
      "Fees typically cover tuition, accommodation (boarders), meals (boarders), examination registration and co-curricular activities. Exact breakdown pending confirmation from the Bursar’s office.",
  },
  {
    question: "Is school transport available?",
    answer:
      "Transport arrangements for day students, including routes and fees, are being confirmed. Please contact the school office for current transport options.",
  },
  {
    question: "Are there scholarships or bursaries?",
    answer:
      "Contact the school admissions office directly for information on any available financial support.",
  },
  {
    question: "When do newly admitted students report to school?",
    answer:
      "Students are expected to report by the date indicated in their admission letter. S1 reporting is 16 February 2026; S5 reporting is 23 February 2026 (per the 2026 calendar).",
  },
  {
    question: "How do I apply?",
    answer:
      "Start an application on the official Education Hub, or make an enquiry on the school’s admissions page. You can also come to school to pick up a form during office hours.",
  },
  {
    question: "Do you offer day and boarding places?",
    answer: "Bweyogerere Campus offers both day and boarding options.",
  },
  {
    question: "What behaviour does the school expect from students?",
    answer:
      "Discipline is guided by respect, punctuality and integrity. The full student code of conduct is available from the school office.",
  },
];

export const ENTRY_REQUIREMENTS =
  "Admissions are open to both day and boarding students aged 11–19. For O-Level (S1) entry: a Uganda Primary Leaving Examination (PLE) certificate, completed application form, birth certificate / age verification document, passport photographs and previous school report cards. Minimum aggregate is school-dependent — please confirm the exact threshold with the admissions office. For A-Level (S5) entry: a UCE certificate with at least 6 passes, typically including relevant principal subjects, plus a subject combination suitability review at the time of admission.";

export const ADMISSION_DATES =
  "S1 application period: November–January (Term 3 of the previous year). S1 placement: 29–30 January 2026. S1 reporting: 16 February 2026. S5 application period: December–February. S5 placement: 12–13 February 2026. S5 reporting: 23 February 2026.";

export const OFFICE_HOURS: ReadonlyArray<{ day: string; hours: string }> = [
  { day: "Monday – Friday", hours: "8:00 AM – 5:00 PM" },
  { day: "Saturday", hours: "9:00 AM – 1:00 PM" },
  { day: "Sunday / Public Holidays", hours: "Closed" },
] as const;

/* ---------- Privacy ---------- */

export const DATA_RETENTION: ReadonlyArray<{
  type: string;
  retention: string;
  access: string;
}> = [
  {
    type: "Student academic records",
    retention: "7 years after leaving school",
    access: "Headteacher, Deputy Headteachers, Class teachers",
  },
  {
    type: "Medical / health records",
    retention: "7 years after leaving school",
    access: "School nurse, Headteacher",
  },
  {
    type: "Financial / fee records",
    retention: "7 years (tax and audit compliance)",
    access: "Bursar, Headteacher",
  },
  {
    type: "CCTV footage (if any)",
    retention: "30 days rolling",
    access: "Headteacher, Security officer",
  },
  {
    type: "Staff personnel files",
    retention: "Duration of employment + 7 years",
    access: "Headteacher, Board of Governors",
  },
  {
    type: "Application / admission forms",
    retention: "3 years if not admitted; 7 years if admitted",
    access: "Admissions office, Headteacher",
  },
] as const;
