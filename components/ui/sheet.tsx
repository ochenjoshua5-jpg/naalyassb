"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Slide-over panel built on Radix Dialog (focus trap, Escape to close,
 * focus returned to the trigger). The slide is a CSS animation (.sheet-panel),
 * switched off for users who prefer reduced motion.
 */
const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetTitle = DialogPrimitive.Title;
const SheetDescription = DialogPrimitive.Description;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { closeLabel?: string }
>(({ className, children, closeLabel = "Close menu", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy-deep/60" />
    <DialogPrimitive.Content ref={ref} asChild {...props}>
      <div
        className={cn(
          "sheet-panel fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-sm flex-col bg-navy text-warm-white shadow-2xl shadow-navy-deep/40 outline-none",
          className,
        )}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 inline-flex size-12 items-center justify-center rounded-xl text-warm-white transition-colors hover:bg-warm-white/10 hover:text-gold"
        >
          <X aria-hidden />
          <span className="sr-only">{closeLabel}</span>
        </DialogPrimitive.Close>
      </div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription };
