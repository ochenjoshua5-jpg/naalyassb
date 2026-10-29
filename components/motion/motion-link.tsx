"use client";

import { motion } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";

/* Button-styled link with a gentle hover lift and press. */
export function MotionLink({
  href,
  children,
  variant,
  size,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <motion.a href={href} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
        {children}
      </motion.a>
    </Button>
  );
}
