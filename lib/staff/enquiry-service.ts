import { z } from "zod";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/enquiry/status";
import { getEnquiryMode } from "@/lib/enquiry/config";
import { createStore, StoreUnavailableError, type EnquiryRecord, type EnquiryStore } from "@/lib/enquiry/store";

/** What staff see. Matches the stored record: no internal fields, no request metadata. */
export interface StaffEnquiryView {
  id: string;
  reference: string;
  parentName: string;
  phone: string;
  email: string | null;
  desiredLevel: "O-Level" | "A-Level";
  learnerAge: number;
  preferredIntake: "next-available" | "not-sure";
  question: string | null;
  status: EnquiryStatus;
  contactedAt: string | null;
  createdAt: string;
  consentNoticeVersion: string;
}

export function toStaffView(record: EnquiryRecord): StaffEnquiryView {
  return {
    id: record.id,
    reference: record.reference,
    parentName: record.parentName,
    phone: record.phone,
    email: record.email,
    desiredLevel: record.desiredLevel,
    learnerAge: record.learnerAge,
    preferredIntake: record.preferredIntake,
    question: record.question,
    status: record.status,
    contactedAt: record.contactedAt ?? null,
    createdAt: record.createdAt,
    consentNoticeVersion: record.consentNoticeVersion,
  };
}

/** Strict: a PATCH may change only "status". Any other key (for example parentName) is refused. */
export const statusPatchSchema = z
  .object({ status: z.enum(ENQUIRY_STATUSES) })
  .strict();

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isEnquiryId(value: string): boolean {
  return UUID.test(value);
}

/** The store for staff operations, or null when storage is switched off. */
export function staffStore(): EnquiryStore | null {
  return createStore(getEnquiryMode());
}

export { StoreUnavailableError };
