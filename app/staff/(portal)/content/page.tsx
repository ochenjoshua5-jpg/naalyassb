import type { Metadata } from "next";
import { headers } from "next/headers";
import { ContentEditor } from "@/components/staff/content-editor";
import { getStaffSession } from "@/lib/staff/session";
import { hasPermission } from "@/lib/staff/roles";

export const metadata: Metadata = { title: "News and notices" };

export default async function ContentPage() {
  const result = await getStaffSession(await headers());
  const canPublish = result.status === "signed-in" && hasPermission(result.session.role, "news:publish");
  return <ContentEditor canPublish={canPublish} />;
}
