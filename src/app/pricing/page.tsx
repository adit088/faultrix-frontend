"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Starter",
    price: { monthly: 0, annual: 0 },
    desc: "For solo engineers exploring chaos",
    color: "#4a4a6a",
    features: [
      { text: "10 chaos rules", included: true },
      { text: "1,000 events/day", included: true },
      { text: "Basic analytics", included: true },
      { text: "Community support", included: true },
      { text: "AI Insights", included: false },
      { text: "Webhooks", included: false },
      { text: "Team access", included: false },
      { text: "SSO / SAML", included: false },
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: { monthly: 399, annual: 299 },
    desc: "For serious resilience engineering",
    color: "#6c47ff",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "100 chaos rules", included: true },
      { text: "100K events/day", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support", included: true },
      { text: "AI Insights", included: true },
      { text: "Webhooks (5)", included: true },
      { text: "5 team members", included: true },
      { text: "SSO / SAML", included: false },
    ],
    cta: "Start Pro Trial",
  },
  {
    name: "Enterprise",
    price: { monthly: 999, annual: 799 },
    desc: "For large-scale production systems",
    color: "#00e5a0",
    features: [
      { text: "Unlimited rules", included: true },
      { text: "Unlimited events", included: true },
      { text: "Custom analytics", included: true },
      { text: "Dedicated SRE support", included: true },
      { text: "AI Insights + custom models", included: true },
      { text: "Unlimited webhooks", included: true },
      { text: "Unlimited team members", included: true },
      { text: "SSO / SAML", included: true },
    ],
    cta: "Contact Sales",
  },
]

const vsGremlin = [
  { feature: "Starting price", faultrix: "Free tier", gremlin: "$500/mo" },
  { feature: "Chaos rules", faultrix: "Unlimited (Ent)", gremlin: "Limited" },
  { feature: "AI Insights", faultrix: "✓ Built-in", gremlin: "✗ None" },
  { feature: "Self-hosted", faultrix: "✓ Yes", gremlin: "✗ No" },
  { feature: "Spring Boot native", faultrix: "✓ Yes", gremlin: "~ Partial" },
  { feature: "Blast radius control", faultrix: "✓ Granular", gremlin: "~ Basic" },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(true)

  return (
    <div className="space-y-10 animate-slide-up max-w-5xl mx-auto pb-8">
      {/* Hero */}
      <div className="text-center pt-2 lg:pt-4">
        <div className="inline-flex items-center gap-2 bg-[#6c47ff]/15 border border-[#6c47ff]/30 rounded-full px-4 py-1.5 mb-5">
          <span className="text-[#a78bfa] text-xs font-mono">✦ Chaos Engineering Done Right</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
          <span className="gradient-text">Pricing that doesn&apos;t hurt</span>
        </h1>
        <p className="text-[#8888aa] text-sm lg:text-base">Break things on purpose. Not your budget.</p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className={cn("text-sm transition-colors", !annual && "text-[#e8e8f0] font-medium", annual && "text-[#4a4a6a]")}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(a => !a)}
            className={cn("w-12 h-6 rounded-full transition-all relative flex-shrink-0", annual ? "bg-[#6c47ff]" : "bg-[#2a2a3e]")}
            aria-label="Toggle billing period"
          >
            <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow", annual ? "translate-x-7" : "translate-x-1")} />
          </button>
          <span className={cn("text-sm transition-colors", annual && "text-[#e8e8f0] font-medium", !annual && "text-[#4a4a6a]")}>
            Annual
            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 bg-[#00e5a0]/15 text-[#00e5a0] rounded border border-[#00e5a0]/30">
              SAVE 25%
            </span>
          </span>
        </div>
      </div>

      {/* Plans grid — 1 col on mobile, 3 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={cn(
              "relative rounded-2xl border p-5 lg:p-6 flex flex-col transition-all",
              plan.highlight
                ? "bg-gradient-to-b from-[#6c47ff]/15 to-[#111118] border-[#6c47ff]/50 shadow-lg shadow-[#6c47ff]/10"
                : "bg-[#111118] border-[#1e1e2e]"
            )}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#6c47ff] text-white text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Plan header — horizontal on mobile for space efficiency */}
            <div className="flex items-start justify-between gap-4 mb-4 lg:block lg:mb-5">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-widest" style={{ color: plan.color }}>{plan.name}</h3>
                <p className="text-xs text-[#4a4a6a] mt-0.5 lg:mt-1">{plan.desc}</p>
              </div>
              <div className="text-right lg:text-left lg:mt-2">
                <div className="flex items-end gap-1 justify-end lg:justify-start">
                  <span className="text-3xl lg:text-4xl font-bold text-[#e8e8f0]">
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && <span className="text-[#4a4a6a] text-sm mb-1">/mo</span>}
                </div>
              </div>
            </div>

            {/* Features — 2 col on mobile to save space, 1 col on desktop */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-1 gap-x-3 gap-y-2 lg:gap-y-2.5 mb-5">
              {plan.features.map(f => (
                <div key={f.text} className="flex items-center gap-2 text-sm">
                  <span className={cn("flex-shrink-0 text-xs", f.included ? "text-[#00e5a0]" : "text-[#2a2a3e]")}>
                    {f.included ? "✓" : "✗"}
                  </span>
                  <span className={cn("text-xs lg:text-sm truncate", f.included ? "text-[#e8e8f0]" : "text-[#4a4a6a] line-through")}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              className={cn(
                "w-full py-3 rounded-xl font-medium text-sm transition-all active:scale-[0.98]",
                plan.highlight
                  ? "bg-[#6c47ff] text-white hover:bg-[#7c57ff] shadow-lg shadow-[#6c47ff]/30"
                  : "border border-[#1e1e2e] text-[#8888aa] hover:border-[#6c47ff]/40 hover:text-[#e8e8f0]"
              )}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Vs Gremlin — scrollable on mobile */}
      <div className="bg-[#111118] rounded-2xl border border-[#1e1e2e] p-4 lg:p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
          <h3 className="text-base font-semibold text-[#e8e8f0]">Faultrix vs Gremlin</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/30 rounded whitespace-nowrap">
            We win on 5/6
          </span>
        </div>
        {/* Horizontal scroll on very small screens */}
        <div className="overflow-x-auto -mx-1">
          <div className="min-w-[320px]">
            {/* Header row */}
            <div className="grid grid-cols-3 gap-2 pb-2 mb-1 border-b border-[#1e1e2e]">
              <span className="text-[10px] font-mono uppercase text-[#4a4a6a] tracking-wider">Feature</span>
              <span className="text-[10px] font-mono uppercase text-[#00e5a0] tracking-wider">Faultrix</span>
              <span className="text-[10px] font-mono uppercase text-[#4a4a6a] tracking-wider">Gremlin</span>
            </div>
            <div className="space-y-0">
              {vsGremlin.map(row => (
                <div key={row.feature} className="grid grid-cols-3 gap-2 py-2.5 border-b border-[#1e1e2e]/50 text-xs lg:text-sm">
                  <span className="text-[#4a4a6a]">{row.feature}</span>
                  <span className="text-[#00e5a0] font-medium">{row.faultrix}</span>
                  <span className="text-[#4a4a6a]">{row.gremlin}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div className="relative rounded-2xl border border-[#6c47ff]/40 p-6 lg:p-8 text-center overflow-hidden bg-gradient-to-br from-[#6c47ff]/10 to-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6c47ff]/5 to-transparent animate-pulse-slow" />
        <h2 className="text-xl lg:text-2xl font-bold text-[#e8e8f0] mb-2">Ready to break things?</h2>
        <p className="text-[#8888aa] text-sm mb-5">Start free. Break production safely. Ship with confidence.</p>
        <button className="px-6 lg:px-8 py-3 rounded-xl bg-[#6c47ff] text-white font-semibold text-sm hover:bg-[#7c57ff] transition-all shadow-lg shadow-[#6c47ff]/30 active:scale-[0.98]">
          Get Started for Free →
        </button>
      </div>
    </div>
  )
}