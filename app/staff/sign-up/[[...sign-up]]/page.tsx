import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/** Public sign-up is never offered. Staff accounts are created by the Headmaster in Clerk. */
export default function StaffSignUp() {
  notFound();
}
