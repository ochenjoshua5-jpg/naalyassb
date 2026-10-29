import type { Metadata } from "next";
import { EnquiriesView } from "@/components/staff/enquiries-view";

export const metadata: Metadata = { title: "Enquiries" };

export default function EnquiriesPage() {
  return <EnquiriesView />;
}
