import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Button-styled link with a gentle hover lift and press (CSS only; off for reduced motion). */
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
      <a href={href} className={cn("btn-lift")}>
        {children}
      </a>
    </Button>
  );
}
