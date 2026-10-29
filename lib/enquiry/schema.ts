import { z } from "zod";

/**
 * Shared enquiry schema. Used by the form (react-hook-form + zodResolver) and
 * by the API route, so client and server apply exactly the same rules.
 *
 * Messages are deliberately warm and specific. Do not replace them with generic text.
 *
 * Deviations from the implementation guide, agreed for Day 4 (see docs/DAY4-ENQUIRY.md):
 * - desiredLevel is O-Level / A-Level only (the school offers secondary only).
 * - preferredIntake uses non-dated options; term dates are pending HM approval.
 * - learnerAge is a sanity check only; eligibility is pending school confirmation.
 */

export const DESIRED_LEVELS = ["O-Level", "A-Level"] as const;

export const INTAKE_OPTIONS = [
  { value: "next-available", label: "Next available intake" },
  { value: "not-sure", label: "Not sure yet, please advise me" },
] as const;

/** Version of the privacy notice the parent agreed to. Bump when the school approves new text. */
export const PRIVACY_NOTICE_VERSION = "draft-2026-10-29";

export const CONSENT_LABEL =
  "I have read the privacy notice and agree that Naalya Secondary School, Bweyogerere Campus, may use these details to reply to my enquiry.";

export const MAX = {
  parentName: 80,
  email: 254,
  question: 500,
} as const;

/**
 * Uganda phone numbers, checked after normalisation to +256XXXXXXXXX.
 * TODO(school): replace with the exact pattern approved for launch if it differs.
 */
export const PHONE_PATTERN = /^\+256[1-9]\d{8}$/;

/** Accepts spaces, dashes, brackets and 0 / 00256 / 256 / +256 prefixes; returns +256XXXXXXXXX (or the cleaned input). */
export function normalisePhone(raw: string): string {
  const cleaned = raw.replace(/[\s\-().]/g, "");
  if (cleaned.startsWith("+256")) return cleaned;
  if (cleaned.startsWith("00256")) return `+256${cleaned.slice(5)}`;
  if (cleaned.startsWith("256")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+256${cleaned.slice(1)}`;
  return cleaned;
}

/** Basic guard against ID numbers pasted into the free-text question (Uganda NIN, long digit runs). */
const SENSITIVE_PATTERN = /\b(?:CM|CF|CN)[A-Z0-9]{12}\b|\b\d{13,}\b/i;

export const enquirySchema = z.object({
  parentName: z
    .string({ required_error: "Please enter the parent or guardian’s name so we know who to reply to." })
    .trim()
    .min(2, "Please enter the parent or guardian’s name so we know who to reply to.")
    .max(MAX.parentName, `Please keep the name under ${MAX.parentName} characters.`)
    .regex(/^[\p{L}][\p{L} .'’-]*$/u, "Please use letters only for the name, for example Nakato Grace."),

  phone: z
    .string({ required_error: "Please enter a phone number so the admissions team can call or text you." })
    .trim()
    .min(1, "Please enter a phone number so the admissions team can call or text you.")
    .transform(normalisePhone)
    .refine((value) => PHONE_PATTERN.test(value), {
      message: "That phone number doesn’t look quite right. Please enter a Ugandan number, for example 07xx xxx xxx.",
    }),

  email: z
    .string()
    .trim()
    .max(MAX.email, "That email address is too long. Please check it, or leave the box blank.")
    .optional()
    .transform((value) => (value ? value.toLowerCase() : undefined))
    .refine((value) => value === undefined || z.string().email().safeParse(value).success, {
      message: "That email address doesn’t look quite right. Please check it, or leave the box blank.",
    }),

  desiredLevel: z.enum(DESIRED_LEVELS, {
    errorMap: () => ({ message: "Please choose O-Level or A-Level." }),
  }),

  learnerAge: z
    .string({ required_error: "Please enter the learner’s age." })
    .trim()
    .regex(/^\d{1,2}$/, "Please enter the learner’s age in whole years, for example 15.")
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(10, "Please check the age. Our secondary levels are for learners aged about 10 to 25.")
        .max(25, "Please check the age. Our secondary levels are for learners aged about 10 to 25."),
    ),

  preferredIntake: z.enum(["next-available", "not-sure"], {
    errorMap: () => ({ message: "Please choose one option so the admissions team knows what to expect." }),
  }),

  question: z
    .string()
    .trim()
    .max(MAX.question, `Please keep your question under ${MAX.question} characters.`)
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || !SENSITIVE_PATTERN.test(value), {
      message:
        "For your child’s privacy, please leave out ID numbers and medical details here. The admissions team will ask for anything they need.",
    }),

  consent: z.literal(true, {
    errorMap: () => ({
      message: "Please tick the box to confirm you have read the privacy notice. We can’t send your enquiry without it.",
    }),
  }),

  /** Honeypot. Hidden from people; the API refuses any submission where it is filled. */
  website: z.string().max(200).optional(),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryData = z.output<typeof enquirySchema>;

/** Honeypot field name. Real parents never see or fill this field. */
export const HONEYPOT_FIELD = "website" as const;
