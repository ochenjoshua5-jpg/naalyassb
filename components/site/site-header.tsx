"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Crest } from "@/components/brand/crest";
import { useActiveSection, useScrolled } from "@/lib/hooks";
import { NAV_ITEMS, SCHOOL } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV_IDS = NAV_ITEMS.map((item) => item.id);

export function SiteHeader() {
  const scrolled = useScrolled(16);
  const active = useActiveSection(NAV_IDS);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500",
        scrolled ? "bg-navy shadow-md shadow-navy-deep/25" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="group flex min-w-0 items-center gap-3 rounded-xl" aria-label={`${SCHOOL.name}, ${SCHOOL.campus}: home`}>
          <Crest className="size-11" tone="gold" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-serif text-base font-semibold text-warm-white sm:text-lg">{SCHOOL.name}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{SCHOOL.campus}</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={`#${item.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "relative block rounded-lg px-3 py-2 text-[0.95rem] font-medium transition-colors",
                      isActive ? "text-warm-white" : "text-warm-white/80 hover:text-warm-white",
                    )}
                  >
                    {item.label}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-gold"
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="default" className="hidden md:inline-flex">
            <motion.a
              href={SCHOOL.applyUrl}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Apply now
              <ArrowUpRight aria-hidden />
              <span className="sr-only">(opens the Education Hub)</span>
            </motion.a>
          </Button>

          {/* Mobile and tablet menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="onDark" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent closeLabel="Close menu" className="p-0">
              <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-6">
                <div className="flex items-center gap-3 pr-14">
                  <Crest className="size-11" tone="gold" />
                  <div className="flex flex-col leading-tight">
                    <SheetTitle className="font-serif text-lg font-semibold">{SCHOOL.name}</SheetTitle>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{SCHOOL.campus}</span>
                  </div>
                </div>

                <nav aria-label="Mobile" className="mt-10">
                  <ul className="flex flex-col">
                    {NAV_ITEMS.map((item) => {
                      const isActive = active === item.id;
                      return (
                        <li key={item.id} className="border-b border-warm-white/10 last:border-b-0">
                          <SheetClose asChild>
                            <Link
                              href={`#${item.id}`}
                              aria-current={isActive ? "location" : undefined}
                              className={cn(
                                "flex min-h-14 items-center justify-between py-3 font-serif text-3xl font-semibold tracking-tight transition-colors",
                                isActive ? "text-gold" : "text-warm-white hover:text-gold",
                              )}
                            >
                              {item.label}
                              <span aria-hidden className="text-base text-gold/80">→</span>
                            </Link>
                          </SheetClose>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="mt-auto flex flex-col gap-3 pt-10">
                  <Button asChild size="lg" className="w-full">
                    <a href={SCHOOL.applyUrl}>
                      Apply now
                      <ArrowUpRight aria-hidden />
                      <span className="sr-only">(opens the Education Hub)</span>
                    </a>
                  </Button>
                  <Button asChild variant="onDark" size="lg" className="w-full">
                    <a href={SCHOOL.enquiryUrl}>Make an enquiry</a>
                  </Button>
                  <p className="pt-4 text-sm leading-relaxed text-warm-white/70">
                    {SCHOOL.campus}, {SCHOOL.locationLine}
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
