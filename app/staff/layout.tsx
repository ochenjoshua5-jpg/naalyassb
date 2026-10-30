import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { getStaffMode } from "@/lib/staff/config";

export const dynamic = "force-dynamic";

/** Staff pages are never indexed, and are not linked from the public site. */
export const metadata: Metadata = {
  title: "Staff portal",
  robots: { index: false, follow: false, nocache: true },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  // ClerkProvider only when the Clerk keys are configured. Otherwise the staff pages are a 404 anyway.
  if (getStaffMode() === "clerk") {
    return <ClerkProvider>{children}</ClerkProvider>;
  }
  return <>{children}</>;
}
