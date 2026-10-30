import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { getStaffMode } from "@/lib/staff/config";
import { getStaffSession } from "@/lib/staff/session";
import { StaffProviders } from "@/components/staff/providers";
import { StaffViewerProvider } from "@/components/staff/staff-context";
import { StaffShell } from "@/components/staff/shell";
import { Callout } from "@/components/staff/ui";

export const dynamic = "force-dynamic";

/**
 * Every staff page goes through here. The proxy has already sent signed-out visitors to sign-in;
 * this layout checks the session again on the server before any data is rendered.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const mode = getStaffMode();
  if (mode === "disabled") notFound();

  const result = await getStaffSession(await headers());
  if (result.status === "anonymous") redirect("/staff/sign-in");

  const signOut =
    mode === "clerk" ? (
      <SignOutButton redirectUrl="/staff/sign-in">
        <button type="button" className="inline-flex min-h-11 items-center rounded-xl border-2 border-navy px-4 font-semibold text-navy hover:bg-navy hover:text-warm-white">
          Sign out
        </button>
      </SignOutButton>
    ) : (
      <Link href="/staff/sign-in" className="inline-flex min-h-11 items-center rounded-xl border-2 border-navy px-4 font-semibold text-navy hover:bg-navy hover:text-warm-white">
        Sign out
      </Link>
    );

  if (result.status === "unavailable") {
    return (
      <StaffProviders>
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-16">
          <Callout tone="urgent" title="The sign-in check is unavailable right now.">
            <p>Nothing has been changed. Please refresh in a minute. If it continues, tell the Headmaster.</p>
          </Callout>
        </div>
      </StaffProviders>
    );
  }

  const { session } = result;
  if (!session.role) {
    return (
      <StaffProviders>
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-16">
          <Callout tone="urgent" title="This account does not have staff access.">
            <p>Please ask the Headmaster to check your account. You can sign out below.</p>
          </Callout>
          <div>{signOut}</div>
        </div>
      </StaffProviders>
    );
  }

  return (
    <StaffProviders>
      <StaffViewerProvider viewer={{ displayName: session.displayName, role: session.role }}>
        <StaffShell signOut={signOut}>{children}</StaffShell>
      </StaffViewerProvider>
    </StaffProviders>
  );
}
