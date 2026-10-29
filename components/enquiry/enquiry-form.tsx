"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Checkbox,
  Description,
  Field,
  Fieldset,
  Input,
  Label,
  Legend,
  Radio,
  RadioGroup,
  Textarea,
} from "@headlessui/react";
import { Toaster, toast } from "sonner";
import { ArrowUpRight, Check, CircleCheck, LoaderCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/components/enquiry/turnstile-widget";
import {
  CONSENT_LABEL,
  DESIRED_LEVELS,
  HONEYPOT_FIELD,
  INTAKE_OPTIONS,
  MAX,
  enquirySchema,
  type EnquiryData,
  type EnquiryInput,
} from "@/lib/enquiry/schema";
import { cn } from "@/lib/utils";

type FormValues = EnquiryInput;

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; reference: string; submittedAtEat: string }
  | { kind: "error"; message: string; fieldErrors?: Record<string, string> };

const EAT_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Kampala",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const INPUT_CLASS =
  "mt-2 block w-full rounded-xl border-2 border-navy/20 bg-warm-white px-4 py-3 text-base text-ink shadow-sm placeholder:text-ink-muted/70 focus:border-navy focus:outline-none focus:ring-4 focus:ring-gold/60 data-[invalid]:border-red-700 disabled:opacity-60 min-h-12";

const ERROR_TEXT = "mt-2 flex items-start gap-2 text-sm font-semibold text-red-800";
const HINT_TEXT = "mt-2 text-sm leading-relaxed text-ink-muted";

/** Moves focus to the control for a field (radio groups focus their first option). */
function focusField(name: string) {
  const byName = document.querySelector<HTMLElement>(`[name="${name}"]`);
  const group = document.getElementById(`enquiry-${name}`);
  const target =
    byName ?? group?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"], [role="radio"]') ?? group ?? null;
  target?.focus();
}

/** One Toaster for the whole flow, so feedback survives the switch to the success panel. */
export function EnquiryForm({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  return (
    <>
      <Toaster position="bottom-center" richColors closeButton />
      <EnquiryFormBody turnstileSiteKey={turnstileSiteKey} />
    </>
  );
}

function EnquiryFormBody({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const formId = useId();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileMissing, setTurnstileMissing] = useState(false);

  // After a successful save, move focus to the confirmation so keyboard and screen-reader users hear it.
  useEffect(() => {
    if (status.kind === "success") document.getElementById(`${formId}-success`)?.focus();
  }, [status.kind, formId]);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    reset,
    setError,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<FormValues, unknown, EnquiryData>({
    resolver: zodResolver(enquirySchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      parentName: "",
      phone: "",
      email: "",
      desiredLevel: undefined,
      learnerAge: "",
      preferredIntake: undefined,
      question: "",
      consent: undefined,
      website: "",
    },
  });

  const summaryItems = Object.entries(errors).filter(([, value]) => value?.message) as [string, { message?: string }][];

  const levelDescId = `${formId}-level-desc`;
  const intakeDescId = `${formId}-intake-desc`;

  // The server runs the same schema as the client, so it receives the raw form values (strings).
  const onSubmit = async () => {
    const data = getValues();
    if (turnstileSiteKey && !turnstileToken) {
      setTurnstileMissing(true);
      setStatus({ kind: "error", message: "Please complete the short security check, then send your enquiry again." });
      return;
    }
    setTurnstileMissing(false);
    setStatus({ kind: "submitting" });

    let response: Response;
    try {
      response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, turnstileToken: turnstileToken || undefined }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      const message =
        "We couldn’t reach the enquiry service. Please check your connection and try again. Your details have not been saved.";
      setStatus({ kind: "error", message });
      toast.error("Your enquiry has not been sent", { description: message });
      return;
    }

    let body: { ok?: boolean; reference?: string; submittedAtEat?: string; message?: string; fieldErrors?: Record<string, string> } = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    if (response.status === 201 && body.ok && body.reference) {
      setStatus({ kind: "success", reference: body.reference, submittedAtEat: body.submittedAtEat ?? EAT_FORMAT.format(new Date()) + " EAT" });
      toast.success("Thank you. Your enquiry has been received.");
      return;
    }

    if (response.status === 422 && body.fieldErrors) {
      for (const [key, message] of Object.entries(body.fieldErrors)) {
        setError(key as FieldPath<FormValues>, { type: "server", message });
      }
      const message = body.message ?? "Please check the highlighted fields. Your answers are still in the form.";
      setStatus({ kind: "error", message, fieldErrors: body.fieldErrors });
      toast.error("Please check the highlighted fields", { description: "Your answers are still in the form." });
      return;
    }

    const message =
      body.message ??
      "We couldn’t save your enquiry just now, so it has not been received. Please try again in a few minutes, or use the Education Hub or the admissions page.";
    setStatus({ kind: "error", message });
    toast.error("Your enquiry has not been sent", { description: message });
  };

  if (status.kind === "success") {
    return (
      <section aria-labelledby={`${formId}-success`} className="rounded-3xl border-2 border-gold bg-card p-8 shadow-md shadow-navy/5 md:p-12">
        <div className="flex items-start gap-4">
          <CircleCheck aria-hidden className="mt-1 size-8 shrink-0 text-navy" />
          <div>
            <h2 id={`${formId}-success`} tabIndex={-1} className="font-serif text-3xl font-semibold text-navy outline-none">
              Thank you. Your enquiry has been received.
            </h2>
            <p className="mt-4 text-lg leading-[1.75] text-ink-muted">
              The admissions team will reply using the phone number or email address you gave. Please keep your reference
              number.
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">Your reference</dt>
                <dd className="mt-1 font-mono text-lg font-semibold text-navy">{status.reference}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">Received</dt>
                <dd className="mt-1 text-lg font-semibold text-navy">{status.submittedAtEat}</dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="outline"
              className="mt-8"
              onClick={() => {
                reset();
                setTurnstileToken("");
                setStatus({ kind: "idle" });
              }}
            >
              Send another enquiry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const busy = isSubmitting || status.kind === "submitting";

  return (
    <>
      <form
        noValidate
        aria-labelledby={`${formId}-title`}
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-3xl bg-card p-6 shadow-md shadow-navy/5 md:p-10"
      >
        <h2 id={`${formId}-title`} className="font-serif text-3xl font-semibold text-navy">
          Make an enquiry
        </h2>
        <p className="mt-3 text-base leading-[1.75] text-ink-muted">
          Fields marked <span className="font-semibold text-navy">required</span> must be completed. Please don’t include ID
          numbers or medical details.
        </p>

        {status.kind === "error" || (submitCount > 0 && summaryItems.length > 0) ? (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-8 rounded-2xl border-2 border-red-700/40 bg-red-50 p-5 text-red-900"
          >
            <p className="flex items-start gap-2 text-base font-semibold">
              <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
              {status.kind === "error" ? status.message : "Please check the highlighted fields."}
            </p>
            {summaryItems.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-10 text-base">
                {summaryItems.map(([key, value]) => (
                  <li key={key}>
                    <button
                      type="button"
                      className="rounded-sm text-left font-semibold underline underline-offset-4"
                      onClick={() => focusField(key)}
                    >
                      {value.message}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {status.kind === "error" ? (
              <p className="mt-4 text-base">
                You can also use the{" "}
                <a className="font-semibold underline underline-offset-4" href="https://hub.naalyaschools.ac.ug/naalya-secondary-school/apply" rel="noopener noreferrer">
                  Education Hub
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>{" "}
                or the <Link className="font-semibold underline underline-offset-4" href="/admissions">admissions page</Link>.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <Field className="md:col-span-2">
            <Label className="block text-base font-semibold text-navy">Parent or guardian’s full name (required)</Label>
            <Input
              invalid={!!errors.parentName}
              autoComplete="name"
              maxLength={MAX.parentName}
              className={INPUT_CLASS}
              {...register("parentName")}
            />
            <Description className={errors.parentName ? ERROR_TEXT : HINT_TEXT}>
              {errors.parentName ? (
                <>
                  <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>{errors.parentName.message}</span>
                </>
              ) : (
                "So the admissions team knows whom to reply to."
              )}
            </Description>
          </Field>

          <Field>
            <Label className="block text-base font-semibold text-navy">Phone number (required)</Label>
            <Input
              invalid={!!errors.phone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={INPUT_CLASS}
              placeholder="07xx xxx xxx"
              {...register("phone")}
            />
            <Description className={errors.phone ? ERROR_TEXT : HINT_TEXT}>
              {errors.phone ? (
                <>
                  <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>{errors.phone.message}</span>
                </>
              ) : (
                "Spaces are fine. We use this number to reply to you."
              )}
            </Description>
          </Field>

          <Field>
            <Label className="block text-base font-semibold text-navy">Email address (optional)</Label>
            <Input
              invalid={!!errors.email}
              type="email"
              inputMode="email"
              autoComplete="email"
              className={INPUT_CLASS}
              {...register("email")}
            />
            <Description className={errors.email ? ERROR_TEXT : HINT_TEXT}>
              {errors.email ? (
                <>
                  <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>{errors.email.message}</span>
                </>
              ) : (
                "Leave this blank if you only have a phone."
              )}
            </Description>
          </Field>

          <Controller
            control={control}
            name="desiredLevel"
            render={({ field, fieldState }) => (
              <Fieldset className="md:col-span-1">
                <Legend className="block text-base font-semibold text-navy">Level of interest (required)</Legend>
                <RadioGroup
                  id="enquiry-desiredLevel"
                  name="desiredLevel"
                  aria-describedby={levelDescId}
                  value={field.value ?? null}
                  onChange={(value: string) => field.onChange(value)}
                  className="mt-3 flex flex-wrap gap-3"
                >
                  {DESIRED_LEVELS.map((level) => (
                    <Radio
                      key={level}
                      value={level}
                      className={({ checked, focus }) =>
                        cn(
                          "cursor-pointer rounded-xl border-2 px-5 py-3 text-base font-semibold transition-colors min-h-12",
                          checked ? "border-navy bg-navy text-warm-white" : "border-navy/25 bg-warm-white text-navy hover:border-navy",
                          focus && "ring-4 ring-gold/70",
                        )
                      }
                    >
                      {({ checked }) => (
                        <span className="inline-flex items-center gap-2">
                          {checked ? <Check aria-hidden className="size-4" /> : null}
                          {level}
                        </span>
                      )}
                    </Radio>
                  ))}
                </RadioGroup>
                <p id={levelDescId} className={fieldState.error ? ERROR_TEXT : HINT_TEXT}>
                  {fieldState.error ? (
                    <>
                      <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                      <span>{fieldState.error.message}</span>
                    </>
                  ) : (
                    "Our secondary levels are O-Level and A-Level."
                  )}
                </p>
              </Fieldset>
            )}
          />

          <Field>
            <Label className="block text-base font-semibold text-navy">Learner’s age (required)</Label>
            <Input
              invalid={!!errors.learnerAge}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={2}
              className={INPUT_CLASS}
              {...register("learnerAge")}
            />
            <Description className={errors.learnerAge ? ERROR_TEXT : HINT_TEXT}>
              {errors.learnerAge ? (
                <>
                  <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>{errors.learnerAge.message}</span>
                </>
              ) : (
                "In whole years."
              )}
            </Description>
          </Field>

          <Controller
            control={control}
            name="preferredIntake"
            render={({ field, fieldState }) => (
              <Fieldset className="md:col-span-2">
                <Legend className="block text-base font-semibold text-navy">Intake you have in mind (required)</Legend>
                <RadioGroup
                  id="enquiry-preferredIntake"
                  name="preferredIntake"
                  aria-describedby={intakeDescId}
                  value={field.value ?? null}
                  onChange={(value: string) => field.onChange(value)}
                  className="mt-3 flex flex-col gap-3 sm:flex-row"
                >
                  {INTAKE_OPTIONS.map((option) => (
                    <Radio
                      key={option.value}
                      value={option.value}
                      className={({ checked, focus }) =>
                        cn(
                          "cursor-pointer rounded-xl border-2 px-5 py-3 text-base font-semibold transition-colors min-h-12",
                          checked ? "border-navy bg-navy text-warm-white" : "border-navy/25 bg-warm-white text-navy hover:border-navy",
                          focus && "ring-4 ring-gold/70",
                        )
                      }
                    >
                      {({ checked }) => (
                        <span className="inline-flex items-center gap-2">
                          {checked ? <Check aria-hidden className="size-4" /> : null}
                          {option.label}
                        </span>
                      )}
                    </Radio>
                  ))}
                </RadioGroup>
                <p id={intakeDescId} className={fieldState.error ? ERROR_TEXT : HINT_TEXT}>
                  {fieldState.error ? (
                    <>
                      <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                      <span>{fieldState.error.message}</span>
                    </>
                  ) : (
                    "Intake dates will be confirmed by the school. We don’t show dates until they are approved."
                  )}
                </p>
              </Fieldset>
            )}
          />

          <Field className="md:col-span-2">
            <Label className="block text-base font-semibold text-navy">Your question (optional)</Label>
            <Textarea
              rows={4}
              maxLength={MAX.question}
              invalid={!!errors.question}
              className={cn(INPUT_CLASS, "min-h-32 resize-y")}
              {...register("question")}
            />
            <Description className={errors.question ? ERROR_TEXT : HINT_TEXT}>
              {errors.question ? (
                <>
                  <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>{errors.question.message}</span>
                </>
              ) : (
                `Up to ${MAX.question} characters. Please don’t include ID numbers, medical details or other sensitive information.`
              )}
            </Description>
          </Field>

          {/* Honeypot: hidden from people and assistive technology. */}
          <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <Field>
              <Label>Leave this field empty</Label>
              <Input tabIndex={-1} autoComplete="off" {...register(HONEYPOT_FIELD)} />
            </Field>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-soft-grey p-6">
          <Controller
            control={control}
            name="consent"
            render={({ field, fieldState }) => (
              <Field className="flex items-start gap-4">
                <Checkbox
                  as="button"
                  type="button"
                  checked={field.value === true}
                  onChange={(checked: boolean) => field.onChange(checked ? true : undefined)}
                  onBlur={field.onBlur}
                  className={cn(
                    "mt-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 border-navy bg-warm-white focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/70 data-[checked]:bg-navy",
                    fieldState.error && "border-red-700",
                  )}
                >
                  <Check aria-hidden className="size-5 text-warm-white opacity-0 data-[checked]:opacity-100" />
                </Checkbox>
                <div className="min-w-0">
                  <Label className="block text-base leading-[1.7] text-navy">
                    {CONSENT_LABEL}{" "}
                    <Link href="/privacy" className="font-semibold underline decoration-gold decoration-2 underline-offset-4">
                      Read the privacy notice
                    </Link>
                    .
                  </Label>
                  <Description className={fieldState.error ? ERROR_TEXT : HINT_TEXT}>
                    {fieldState.error ? (
                      <>
                        <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                        <span>{fieldState.error.message}</span>
                      </>
                    ) : (
                      "Required. We only use your details to reply to this enquiry."
                    )}
                  </Description>
                </div>
              </Field>
            )}
          />
        </div>

        {turnstileSiteKey ? (
          <div className="mt-8">
            <TurnstileWidget siteKey={turnstileSiteKey} onToken={(token) => { setTurnstileToken(token); if (token) setTurnstileMissing(false); }} />
            {turnstileMissing ? (
              <p className={ERROR_TEXT}>
                <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                Please complete the short security check above.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button type="submit" size="lg" disabled={busy} aria-busy={busy || undefined} className="w-full sm:w-auto">
            {busy ? (
              <>
                <LoaderCircle aria-hidden className="animate-spin" />
                Sending your enquiry…
              </>
            ) : (
              "Send enquiry"
            )}
          </Button>
          <p className="text-sm leading-relaxed text-ink-muted" role="status" aria-live="polite">
            {busy ? "Please keep this page open while we send your enquiry." : ""}
          </p>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink-muted">
          Not ready to send an enquiry?{" "}
          <a href="https://hub.naalyaschools.ac.ug/naalya-secondary-school/apply" className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4" rel="noopener noreferrer">
            Start an application on the Education Hub
            <ArrowUpRight aria-hidden className="ml-1 inline size-4" />
          </a>
          .
        </p>
      </form>
    </>
  );
}
