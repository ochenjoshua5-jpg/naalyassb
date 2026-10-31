/**
 * Single source of truth for school facts and links.
 *
 * Every value here reflects verified information supplied for the school
 * website. Where a detail comes from public sources rather than direct HM
 * confirmation, it is marked so parents know to confirm with the campus
 * office before relying on it.
 */
export const SCHOOL = {
  name: "Naalya Secondary School",
  campus: "Bweyogerere Campus",
  locationLine:
    "Bbuto Village, Bweyogerere, Kira Town Council, Wakiso District, Uganda",
  headteacher: {
    name: "Mr. Okongo David",
    title: "Headteacher, Bweyogerere Campus",
  },
  /** Official application system (Education Hub). Linked from the school website. */
  applyUrl: "https://hub.naalyaschools.ac.ug/naalya-secondary-school/apply",
  /** School's own admissions enquiry page. */
  enquiryUrl: "https://naalyaschools.ac.ug/admissions",
  /** Campus page on the existing school website. */
  campusUrl: "https://naalyaschools.ac.ug/campuses/bweyogerere",
  websiteUrl: "https://naalyaschools.ac.ug",
  socialUrl: "https://x.com/naalya_schools",
  socialHandle: "@naalya_schools",
  /** Campus phone number for calling. */
  phone: "0772 444 516",
  /** Campus email format suggested for use; confirm with the school administration before publishing. */
  email: "bweyogerere@naalyaschools.ac.ug",
} as const;

/** Primary navigation. Each entry is a real page on this site. */
export const NAV_ITEMS = [
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/school-life", label: "School life" },
  { href: "/news", label: "News" },
  { href: "/admissions", label: "Admissions" },
  { href: "/contact", label: "Contact" },
] as const;

/** Wording for the public pages, written for parents and prospective families. */
export const COPY = {
  hero: {
    eyebrow: "Naalya Secondary School · Bweyogerere Campus",
    title: "Welcome to the place where your child’s story begins.",
    lead:
      "O-Level and A-Level education in Kira Town Council, Wakiso District, with day and boarding options for families who want their children to grow in mind, character and purpose.",
    chips: ["Day & boarding", "O-Level", "A-Level", "Wakiso District"],
  },
  welcome: {
    eyebrow: "A word from the headteacher",
    title: "Every learner has gifts waiting to be nurtured.",
    paragraphs: [
      "At Bweyogerere Campus, we believe that every student has unique gifts waiting to be nurtured. Our mission is to provide the structure, encouragement, and opportunity needed for learners to excel academically and personally.",
      "We foster a caring environment where respect, hard work, and innovation thrive. By inspiring curiosity and responsibility, we prepare our students to stand out wherever their journey leads.",
    ],
    pullQuote:
      "We aim not only to educate the mind — but to shape character and inspire purpose.",
    mission:
      "To provide high quality integrated education in a safe, respectful and inclusive setting that fosters individual development of learners.",
    vision:
      "To be a centre of Excellence for quality holistic education which lays a foundation for life and service in a globalized world.",
  },
  programmes: {
    eyebrow: "Programmes",
    title: "Practical learning and personal attention.",
    intro:
      "Our programmes follow the Uganda National Curriculum, from O-Level through to A-Level, with time for projects, clubs and character.",
    items: [
      {
        key: "olevel",
        title: "O-Level",
        kicker: "Competency-based UCE curriculum",
        body:
          "Strong foundations in sciences, arts and technology. Learners build practical skills alongside academic knowledge, and choose electives that match their interests and future study paths.",
        subjects: [
          "Mathematics",
          "Biology",
          "Chemistry",
          "Physics",
          "Computer studies",
          "English",
          "Geography",
          "History & Political Education",
          "Economics",
          "Fine Art",
          "Entrepreneurship",
        ],
      },
      {
        key: "alevel",
        title: "A-Level",
        kicker: "UACE framework",
        body:
          "A balanced mix of sciences, arts and commerce. Students specialise in subject combinations that match their academic goals, preparing them for university, professional pathways and real-world challenges.",
        subjects: [] as string[],
      },
      {
        key: "campus",
        title: "Life on campus",
        kicker: "Day and boarding",
        body:
          "A structured daily routine, mentorship from teachers and prefects, dedicated counselling, and co-curricular life: music and dance, drama and debate, arts and craft, the Electrical & Electronics Innovation Club, and sports and athletics.",
        subjects: [] as string[],
      },
    ],
    learning: [
      { title: "Thinking skills", body: "Problem-solving, communication and creativity are part of everyday lessons." },
      { title: "Real-world awareness", body: "Learners connect classroom knowledge to everyday life and to their community." },
      { title: "Confidence & independence", body: "Students learn to take responsibility for their learning and their actions." },
    ],
  },
  news: {
    eyebrow: "News & notices",
    title: "What’s happening on campus",
    intro:
      "School announcements, event updates and academic news appear here as they are approved. Check back soon, or follow Naalya Schools on social media for real-time updates.",
    placeholders: [],
  },
  admissions: {
    eyebrow: "Admissions",
    title: "Let’s talk about your child’s future.",
    body:
      "Start an application on the official Education Hub, or send an enquiry and a member of the admissions team will get back to you.",
    steps: [
      { title: "Make an enquiry", body: "Share your details and any questions you have." },
      { title: "Get contacted", body: "A member of the admissions team reaches out to you." },
      { title: "Apply online or in person", body: "Choose the route that suits you best." },
      { title: "Join the family", body: "Successful applicants receive an acceptance letter and orientation details." },
    ],
  },
  visit: {
    eyebrow: "Visit & contact",
    title: "Talk to us about your child’s next step.",
    body:
      "Prospective parents and students are welcome to visit Naalya Secondary School – Bweyogerere Campus. To arrange a guided campus tour, please contact the school office during working hours (Monday–Friday, 8:00 AM – 5:00 PM). Visit booking details are being finalised — check back soon or call the school office directly.",
  },
} as const;
