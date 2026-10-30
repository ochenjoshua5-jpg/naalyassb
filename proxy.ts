import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getStaffMode } from "@/lib/staff/config";
import { TEST_USER_HEADER } from "@/lib/staff/session";

/**
 * Next 16 renamed middleware.ts to proxy.ts. This runs only for the staff paths (see `config`), so the
 * public website and the public enquiry route are untouched.
 *
 * - disabled: pass through. The staff pages call notFound() and the API guard answers 404.
 * - test: a visitor without the test sign-in header is sent to the sign-in page.
 * - clerk: Clerk protects every staff page except the sign-in pages.
 *
 * Sign-up is never offered: /staff/sign-up is answered by a page that calls notFound().
 */

const isSignInRoute = createRouteMatcher(["/staff/sign-in(.*)"]);
const isSignUpRoute = createRouteMatcher(["/staff/sign-up(.*)"]);
const clerkStaffGate = clerkMiddleware(
  async (auth, req) => {
    // Sign-in is open. Sign-up is never offered: its page answers 404 instead of redirecting.
    if (isSignInRoute(req) || isSignUpRoute(req)) return;
    await auth.protect();
  },
  { signInUrl: "/staff/sign-in" },
);

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const mode = getStaffMode();

  if (mode === "clerk") {
    return clerkStaffGate(request, event);
  }

  const path = request.nextUrl.pathname;
  const isStaffPage = path === "/staff" || path.startsWith("/staff/");
  const isSignIn = path === "/staff/sign-in" || path.startsWith("/staff/sign-in/");

  if (mode === "test" && isStaffPage && !isSignIn && !request.headers.get(TEST_USER_HEADER)) {
    const url = request.nextUrl.clone();
    url.pathname = "/staff/sign-in";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff", "/staff/:path*", "/api/staff/:path*"],
};
