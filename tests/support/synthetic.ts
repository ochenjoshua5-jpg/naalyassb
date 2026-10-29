import { faker } from "@faker-js/faker";

/**
 * SYNTHETIC TEST DATA ONLY. Names are generated from Ugandan name lists; phone numbers and
 * emails are random and use the reserved .test domain. No real family's details appear here.
 */
const FIRST_NAMES = [
  "Nakato", "Namukasa", "Nansubuga", "Akello", "Atim", "Achieng", "Apio", "Nambooze",
  "Kato", "Ssemakula", "Musoke", "Mugisha", "Okello", "Wasswa", "Ssali", "Tumusiime",
  "Kiiza", "Mukasa", "Ssozi", "Byaruhanga",
];
const LAST_NAMES = [
  "Ssebunya", "Kizito", "Mutebi", "Namatovu", "Kyomuhendo", "Okwir", "Opio", "Lubega",
  "Nsubuga", "Kasozi", "Byamugisha", "Kalule", "Odongo", "Tumwine", "Nabirye", "Mwesigwa",
  "Sserunjogi", "Ssempala", "Kisakye", "Nakimuli",
];

export interface SyntheticEnquiry {
  parentName: string;
  phone: string; // spaced, as a parent would type it
  email: string;
  desiredLevel: "O-Level" | "A-Level";
  learnerAge: string;
  preferredIntake: "next-available" | "not-sure";
  question: string;
  digits: string; // the 9 national digits, used to recognise the record in storage
}

export function syntheticEnquiry(overrides: Partial<SyntheticEnquiry> = {}): SyntheticEnquiry {
  const first = faker.helpers.arrayElement(FIRST_NAMES);
  const last = faker.helpers.arrayElement(LAST_NAMES);
  const digits = `7${faker.string.numeric(8)}`;
  return {
    parentName: `${first} ${last}`,
    phone: `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`,
    email: `${first}.${last}.${faker.string.alphanumeric(5).toLowerCase()}@example.test`,
    desiredLevel: faker.helpers.arrayElement(["O-Level", "A-Level"] as const),
    learnerAge: String(faker.number.int({ min: 12, max: 19 })),
    preferredIntake: faker.helpers.arrayElement(["next-available", "not-sure"] as const),
    question: faker.lorem.sentence(8),
    digits,
    ...overrides,
  };
}

/** A random private-range address per test, so the in-memory rate limiter never mixes tests. */
export function uniqueTestIp(): string {
  return `10.${faker.number.int({ min: 0, max: 255 })}.${faker.number.int({ min: 0, max: 255 })}.${faker.number.int({ min: 1, max: 254 })}`;
}
