import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* Buttons are at least 48px tall for comfortable thumb taps. */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-sans font-semibold transition-colors duration-200 select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Primary: gold fill, navy text */
        default: "bg-gold text-navy shadow-sm shadow-navy/10 hover:bg-gold-deep",
        /* Secondary on light surfaces: navy outline */
        outline: "border-2 border-navy bg-transparent text-navy hover:bg-navy hover:text-warm-white",
        /* Secondary on navy surfaces */
        onDark:
          "border-2 border-warm-white/70 bg-transparent text-warm-white hover:border-gold hover:text-gold",
        ghost: "bg-transparent text-navy hover:bg-navy/5",
        /* Text link with a gold underline */
        link: "h-auto whitespace-normal rounded-sm p-0 text-left font-semibold text-navy underline decoration-gold decoration-2 underline-offset-[6px] hover:decoration-navy",
      },
      size: {
        default: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        sm: "h-10 px-4 text-sm",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
