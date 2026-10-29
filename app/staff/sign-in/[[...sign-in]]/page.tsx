import { notFound } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { getStaffMode } from "@/lib/staff/config";
import { Crest } from "@/components/brand/crest";

export const dynamic = "force-dynamic";

const clerkAppearance = {
  variables: {
    colorPrimary: "#D4A843",
    colorText: "#1B2A4A",
    colorTextSecondary: "#4A5571",
    colorBackground: "#FAF8F5",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#1B2A4A",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "shadow-2xl shadow-black/30",
    formButtonPrimary: "bg-[#D4A843] text-[#1B2A4A] hover:bg-[#c99b35] shadow-none",
    footerActionLink: "text-[#1B2A4A] underline",
  },
} as const;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-navy px-4 py-12 text-warm-white">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Crest className="size-16" />
          <p className="font-serif text-3xl font-semibold">Bweyogerere Staff Portal</p>
          <p className="text-sm text-warm-white/80">Naalya Secondary School, Bweyogerere Campus</p>
          <span aria-hidden className="h-1 w-16 rounded-full bg-gold" />
        </div>
        <div className="w-full rounded-3xl bg-warm-white p-6 text-navy shadow-2xl shadow-black/30 md:p-8">{children}</div>
        <p className="text-center text-xs text-warm-white/70">
          Staff only. Sessions end after 8 hours. Please sign out on shared computers.
        </p>
      </div>
    </div>
  );
}

export default function StaffSignIn() {
  const mode = getStaffMode();
  if (mode === "disabled") notFound();

  if (mode === "test") {
    return (
      <Frame>
        <p className="text-base">The staff sign-in is not connected in this preview yet, so the dashboard is switched off.</p>
      </Frame>
    );
  }

  return (
    <Frame>
      <SignIn routing="path" path="/staff/sign-in" signUpUrl={undefined} appearance={clerkAppearance} />
    </Frame>
  );
}
