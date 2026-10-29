"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Public chrome (skip link, header, <main>, footer, sticky action bar) for the website.
 * Staff pages under /staff render with their own shell and get none of it.
 */
export function PublicFrame({
  skip,
  header,
  footer,
  sticky,
  children,
}: {
  skip: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  sticky: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/staff" || pathname.startsWith("/staff/")) {
    return <>{children}</>;
  }
  return (
    <>
      {skip}
      {header}
      <main id="main" className="flex-1 outline-none" tabIndex={-1}>
        {children}
      </main>
      {footer}
      {sticky}
    </>
  );
}
