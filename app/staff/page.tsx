import { notFound, redirect } from "next/navigation";
import { getStaffMode } from "@/lib/staff/config";

export const dynamic = "force-dynamic";

export default function StaffIndex() {
  if (getStaffMode() === "disabled") notFound();
  redirect("/staff/dashboard");
}
