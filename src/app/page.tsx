"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { calculateQuote, type QuoteInput } from "../lib/pricing";
import { DownloadQuote } from "../components/DownloadQuote";
import { saveQuote } from "../lib/quotes";
import { sendToGHL } from "../lib/ghl";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Build Quote Calculator | Chromapages",
  description: "Instant, transparent estimates for your next web project. Get a detailed breakdown in minutes.",
};

type QuoteFormValues = QuoteInput & {
  contactName: string;
  email: string;
  projectNotes: string;
};

const steps = [
  {
    id: "site",
    title: "Site type",
    kicker: "Pick the build that matches your business.",
  },
  {
    id: "pages",
    title: "Page count",
    kicker: "How much content should we plan for?",
  },
  {
    id: "features",
    title: "Features",
    kicker: "Select the functionality you need.",
  },
  {
    id: "design",
    title: "Design level",
    kicker: "Choose the visual polish you want.",
  },
  {
    id: "timeline",
    title: "Timeline",
    kicker: "How fast do you need to launch?",
  },
  {
    id: "review",
    title: "Review",
    kicker: "Confirm the details and see your estimate.",
  },
];

const siteTypes = [
  {
    value: "business",
    label: "Business site",
    description: "Services, about, contact, and lead capture.",
  },
  {
    value: "ecommerce",
    label: "Ecommerce store",
    description: "Catalog, cart, checkout, and inventory tools.",
  },
  {
    value: "webapp",
    label: "Web app",
    description: "Dashboards, portals, and secure workflows.",
  },
  {
    value: "landing",
    label: "Landing page",
    description: "Single campaign page for conversions.",
  },
];

const featureOptions = [
  { value: "cms", label: "CMS", detail: "Easy page editing" },
  { value: "booking", label: "Bookings", detail: "Appointments + calendar" },
  { value: "payments", label: "Payments", detail: "Stripe-ready checkout" },
  { value: "blog", label: "Blog", detail: "Long-form content" },
  { value: "membership", label: "Membership", detail: "Logins + gated content" },
  { value: "customForms", label: "Custom forms", detail: "Advanced lead forms" },
  { value: "seo", label: "SEO setup", detail: "Technical SEO essentials" },
  { value: "analytics", label: "Analytics", detail: "Dashboards + events" },
];

const designLevels = [
  {
    value: "template",
    label: "Template refresh",
    description: "Polished, fast, and efficient.",
  },
  {
    value: "custom",
    label: "Custom design",
    description: "Tailored layout, brand-aligned visuals.",
  },
  {
    value: "premium",
    label: "Premium brand build",
    description: "Art direction, motion, and unique UX.",
  },
];

const timelineOptions = [
  {
    value: "rush",
    label: "Rush",
    description: "2-3 weeks",
  },
  {
    value: "standard",
    label: "Standard",
    description: "4-6 weeks",
  },
  {
    value: "flexible",
    label: "Flexible",
    description: "6-8 weeks",
  },
];

const locationOptions = [
  { value: "us", label: "US / Canada" },
  { value: "international", label: "International" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function Page() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    defaultValues: {
      siteType: "business",
      pageCount: 5,
      features: [],
      designLevel: "custom",
      timeline: "standard",
      location: "us",
      contactName: "",
      email: "",
      projectNotes: "",
    },
    mode: "onTouched",
  });

  const siteType = watch("siteType");
  const pageCount = watch("pageCount");
  const features = watch("features");
  const designLevel = watch("designLevel");
  const timeline = watch("timeline");
  const location = watch("location");

  const currentRequest: QuoteInput = useMemo(() => ({
    siteType: siteType ?? "business",
    pageCount: Number.isFinite(pageCount) ? (pageCount as number) : 1,
    features: Array.isArray(features) ? features : [],
    designLevel: designLevel ?? "template",
    timeline: timeline ?? "standard",
    location: location ?? "us",
  }), [siteType, pageCount, features, designLevel, timeline, location]);

  const quote = useMemo(() => {
    return calculateQuote(currentRequest);
  }, [currentRequest]);

  const selectedSite = siteTypes.find((item) => item.value === siteType);
  const selectedDesign = designLevels.find((item) => item.value === designLevel);
  const selectedTimeline = timelineOptions.find((item) => item.value === timeline);
  const selectedFeatures = featureOptions.filter((item) =>
    Array.isArray(features) ? features.includes(item.value) : false
  );

  const progress = ((step + 1) / steps.length) * 100;

  const stepFields: Array<(keyof QuoteFormValues)[]> = [
    ["siteType"],
    ["pageCount"],
    [],
    ["designLevel"],
    ["timeline", "location"],
    ["email"],
  ];

  const handleNext = async () => {
    const fields = stepFields[step];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) {
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: QuoteFormValues) => {
    // Save lead to Firestore
    await saveQuote({
      ...data,
      quoteResult: quote,
    });

    // Send lead to GoHighLevel
    await sendToGHL({
      ...quote.breakdown,
      total: quote.min, // Using min estimate as the deal value
      tier: data.designLevel,
      features: data.features,
      id: "quote-" + Date.now(),
      userInfo: {
        name: data.contactName,
        email: data.email,
        phone: "", // Not collected in this form version
      }
    });

    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fff5ec,transparent_55%),radial-gradient(circle_at_20%_20%,#e0f1ff,transparent_45%),radial-gradient(circle_at_90%_10%,#ffe7dc,transparent_40%)]">
      <div className="pointer-events-none absolute -top-40 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,#ffb59e,transparent_70%)] opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,#b5e2ff,transparent_70%)] opacity-70 blur-3xl" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:py-16">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#f46a4d]">
              Chromapages Web Studio
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-[#111118] sm:text-5xl">
              Build your 6-step quote in minutes.
            </h1>
            <p className="mt-4 text-base text-[#3c3f4a] sm:text-lg">
              Answer a few quick questions and we will generate a transparent, line-item
              estimate for your next website build.
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-[0_15px_60px_-35px_rgba(18,25,45,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a8f9f]">
              Typical Range
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#111118]">
              {formatCurrency(quote.min)} - {formatCurrency(quote.max)}
            </p>
            <p className="mt-1 text-sm text-[#4c5162]">
              Estimated timeline: {quote.timeline}
            </p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(18,25,45,0.55)] backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a8f9f]">
                  Step {step + 1} of {steps.length}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#111118]">
                  {steps[step].title}
                </h2>
                <p className="mt-2 text-sm text-[#4c5162]">{steps[step].kicker}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f0f0f4] bg-white text-sm font-semibold text-[#f46a4d]">
                {step + 1}
              </div>
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#f2f2f5]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#ff855f] via-[#ffb08f] to-[#f8c973]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={steps[step].id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {step === 0 && (
                    <div className="grid gap-4">
                      {siteTypes.map((item) => (
                        <label
                          key={item.value}
                          className="group relative flex cursor-pointer flex-col gap-2 rounded-2xl border border-[#eef0f4] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#f6a08a]"
                        >
                          <input
                            type="radio"
                            value={item.value}
                            className="peer sr-only"
                            {...register("siteType", {
                              required: "Select a site type.",
                            })}
                          />
                          <div className="absolute inset-0 rounded-2xl border border-transparent transition peer-checked:border-[#ff855f] peer-checked:bg-[#fff4ee]" />
                          <div className="relative z-10">
                            <h3 className="text-lg font-semibold text-[#111118]">
                              {item.label}
                            </h3>
                            <p className="text-sm text-[#4c5162]">{item.description}</p>
                          </div>
                        </label>
                      ))}
                      {errors.siteType && (
                        <p className="text-sm text-[#db3f2f]">{errors.siteType.message}</p>
                      )}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-[#eef0f4] bg-[#f9f9fb] p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#111118]">Number of pages</p>
                          <p className="text-lg font-semibold text-[#111118]">
                            {Number.isFinite(pageCount) ? pageCount : 1}
                          </p>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={30}
                          value={Number.isFinite(pageCount) ? pageCount : 1}
                          onChange={(event) =>
                            setValue("pageCount", Number(event.target.value), {
                              shouldValidate: true,
                            })
                          }
                          className="mt-4 w-full accent-[#ff855f]"
                        />
                        <div className="mt-2 flex justify-between text-xs text-[#6a6f80]">
                          <span>1 page</span>
                          <span>30 pages</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-[#111118]">Exact count</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          className="mt-2 w-full rounded-xl border border-[#e7e8ee] bg-white px-4 py-3 text-base text-[#111118] shadow-sm focus:border-[#ff855f] focus:outline-none"
                          {...register("pageCount", {
                            valueAsNumber: true,
                            required: "Page count is required.",
                            min: {
                              value: 1,
                              message: "Minimum 1 page.",
                            },
                            max: {
                              value: 30,
                              message: "Maximum 30 pages.",
                            },
                          })}
                        />
                        {errors.pageCount && (
                          <p className="mt-2 text-sm text-[#db3f2f]">
                            {errors.pageCount.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {featureOptions.map((feature) => (
                        <label
                          key={feature.value}
                          className="group relative flex cursor-pointer items-start gap-3 rounded-2xl border border-[#eef0f4] bg-white p-4 transition hover:border-[#9fc5ff]"
                        >
                          <input
                            type="checkbox"
                            value={feature.value}
                            className="mt-1 h-4 w-4 rounded border-[#cdd3dd] text-[#3fa2ff] focus:ring-[#3fa2ff]"
                            {...register("features")}
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#111118]">{feature.label}</p>
                            <p className="text-xs text-[#5b6070]">{feature.detail}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid gap-4">
                      {designLevels.map((item) => (
                        <label
                          key={item.value}
                          className="group relative flex cursor-pointer flex-col gap-2 rounded-2xl border border-[#eef0f4] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#a6d6c2]"
                        >
                          <input
                            type="radio"
                            value={item.value}
                            className="peer sr-only"
                            {...register("designLevel", {
                              required: "Select a design level.",
                            })}
                          />
                          <div className="absolute inset-0 rounded-2xl border border-transparent transition peer-checked:border-[#5bbf93] peer-checked:bg-[#eef8f2]" />
                          <div className="relative z-10">
                            <h3 className="text-lg font-semibold text-[#111118]">
                              {item.label}
                            </h3>
                            <p className="text-sm text-[#4c5162]">{item.description}</p>
                          </div>
                        </label>
                      ))}
                      {errors.designLevel && (
                        <p className="text-sm text-[#db3f2f]">{errors.designLevel.message}</p>
                      )}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="grid gap-4">
                        {timelineOptions.map((item) => (
                          <label
                            key={item.value}
                            className="group relative flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#eef0f4] bg-white p-5 transition hover:border-[#ffb08f]"
                          >
                            <input
                              type="radio"
                              value={item.value}
                              className="peer sr-only"
                              {...register("timeline", {
                                required: "Select a timeline.",
                              })}
                            />
                            <div className="relative z-10">
                              <h3 className="text-lg font-semibold text-[#111118]">
                                {item.label}
                              </h3>
                              <p className="text-sm text-[#4c5162]">{item.description}</p>
                            </div>
                            <div className="relative z-10 rounded-full border border-[#f0f0f4] px-3 py-1 text-xs font-semibold text-[#f46a4d]">
                              {item.value === "rush" ? "Priority" : "Balanced"}
                            </div>
                            <div className="absolute inset-0 rounded-2xl border border-transparent transition peer-checked:border-[#ff855f] peer-checked:bg-[#fff4ee]" />
                          </label>
                        ))}
                        {errors.timeline && (
                          <p className="text-sm text-[#db3f2f]">{errors.timeline.message}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#111118]">Location</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {locationOptions.map((option) => (
                            <label
                              key={option.value}
                              className="group relative flex cursor-pointer items-center gap-3 rounded-2xl border border-[#eef0f4] bg-white p-4"
                            >
                              <input
                                type="radio"
                                value={option.value}
                                className="peer sr-only"
                                {...register("location", {
                                  required: "Select a location.",
                                })}
                              />
                              <div className="absolute inset-0 rounded-2xl border border-transparent transition peer-checked:border-[#3fa2ff] peer-checked:bg-[#edf5ff]" />
                              <span className="relative z-10 text-sm font-semibold text-[#111118]">
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                        {errors.location && (
                          <p className="mt-2 text-sm text-[#db3f2f]">{errors.location.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-6">
                      {submitted ? (
                        <div className="rounded-2xl border border-[#b7e6cc] bg-[#eef8f2] p-6">
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#3d9a6c]">
                            Submitted
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-[#111118]">
                            Thanks for sharing the details!
                          </h3>
                          <p className="mt-2 text-sm text-[#4c5162]">
                            We will follow up within one business day with a tailored proposal.
                          </p>
                          <div className="mt-6">
                            <DownloadQuote
                              request={currentRequest}
                              breakdown={quote.breakdown}
                              min={quote.min}
                              max={quote.max}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="rounded-2xl border border-[#eef0f4] bg-[#f9f9fb] p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a8f9f]">
                              Estimate Range
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-[#111118]">
                              {formatCurrency(quote.min)} - {formatCurrency(quote.max)}
                            </p>
                            <p className="mt-2 text-sm text-[#4c5162]">
                              Suggested timeline: {quote.timeline}
                            </p>
                          </div>

                          <div className="grid gap-4 rounded-2xl border border-[#eef0f4] bg-white p-5">
                            <h3 className="text-lg font-semibold text-[#111118]">Project summary</h3>
                            <div className="grid gap-2 text-sm text-[#4c5162]">
                              <p>
                                <span className="font-semibold text-[#111118]">Site type:</span>{" "}
                                {selectedSite?.label}
                              </p>
                              <p>
                                <span className="font-semibold text-[#111118]">Pages:</span> {pageCount}
                              </p>
                              <p>
                                <span className="font-semibold text-[#111118]">Design:</span>{" "}
                                {selectedDesign?.label}
                              </p>
                              <p>
                                <span className="font-semibold text-[#111118]">Timeline:</span>{" "}
                                {selectedTimeline?.label}
                              </p>
                              <p>
                                <span className="font-semibold text-[#111118]">Features:</span>{" "}
                                {selectedFeatures.length > 0
                                  ? selectedFeatures.map((feature) => feature.label).join(", ")
                                  : "None selected"}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-4">
                            <div>
                              <label className="text-sm font-semibold text-[#111118]">
                                Contact name
                              </label>
                              <input
                                type="text"
                                className="mt-2 w-full rounded-xl border border-[#e7e8ee] bg-white px-4 py-3 text-base text-[#111118] shadow-sm focus:border-[#ff855f] focus:outline-none"
                                placeholder="Your name"
                                {...register("contactName")}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-[#111118]">
                                Email address
                              </label>
                              <input
                                type="email"
                                className="mt-2 w-full rounded-xl border border-[#e7e8ee] bg-white px-4 py-3 text-base text-[#111118] shadow-sm focus:border-[#ff855f] focus:outline-none"
                                placeholder="you@company.com"
                                {...register("email", {
                                  required: "Email is required to receive the proposal.",
                                  pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter a valid email address.",
                                  },
                                })}
                              />
                              {errors.email && (
                                <p className="mt-2 text-sm text-[#db3f2f]">{errors.email.message}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-[#111118]">
                                Project notes
                              </label>
                              <textarea
                                rows={4}
                                className="mt-2 w-full resize-none rounded-xl border border-[#e7e8ee] bg-white px-4 py-3 text-base text-[#111118] shadow-sm focus:border-[#ff855f] focus:outline-none"
                                placeholder="Share goals, inspiration, or must-haves."
                                {...register("projectNotes")}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0}
                className="rounded-full border border-[#e7e8ee] bg-white px-6 py-3 text-sm font-semibold text-[#4c5162] transition hover:border-[#111118] hover:text-[#111118] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>

              {step < steps.length - 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-full bg-[#111118] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#111118]/30 transition hover:-translate-y-0.5"
                >
                  Next step
                </button>
              )}

              {step === steps.length - 1 && !submitted && (
                <button
                  type="submit"
                  className="rounded-full bg-[#f46a4d] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f46a4d]/30 transition hover:-translate-y-0.5"
                >
                  Request proposal
                </button>
              )}
            </div>
          </form>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_-40px_rgba(18,25,45,0.45)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a8f9f]">
                Live estimate
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#111118]">
                {formatCurrency(quote.min)} - {formatCurrency(quote.max)}
              </p>
              <p className="mt-2 text-sm text-[#4c5162]">
                Includes base, pages, feature add-ons, and timeline adjustments.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-[#4c5162]">
                <div className="flex items-center justify-between">
                  <span>Base build</span>
                  <span className="font-semibold text-[#111118]">
                    {formatCurrency(quote.breakdown.base)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pages</span>
                  <span className="font-semibold text-[#111118]">
                    {formatCurrency(quote.breakdown.pages)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Features</span>
                  <span className="font-semibold text-[#111118]">
                    {formatCurrency(quote.breakdown.features)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Design level</span>
                  <span className="font-semibold text-[#111118]">
                    {formatCurrency(quote.breakdown.design)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Timeline</span>
                  <span className="font-semibold text-[#111118]">
                    {formatCurrency(quote.breakdown.timeline)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-[#111118] p-6 text-white shadow-[0_20px_60px_-40px_rgba(18,25,45,0.55)]">
              <h3 className="text-2xl font-semibold">What you get</h3>
              <p className="mt-2 text-sm text-white/70">
                Every build includes strategy, QA, performance testing, and a launch-ready
                checklist.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-white/80">
                <div className="flex items-center justify-between">
                  <span>Discovery workshop</span>
                  <span>Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Conversion copy pass</span>
                  <span>Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Post-launch support</span>
                  <span>30 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Analytics setup</span>
                  <span>Dashboards</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
