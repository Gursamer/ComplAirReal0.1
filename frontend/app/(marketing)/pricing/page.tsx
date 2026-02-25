import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "$0",
    blurb: "For solo founders and trial demos",
    features: ["5 analyses/day", "Dashboard + charts", "Report history"],
  },
  {
    name: "Pro",
    price: "$49",
    blurb: "For growing teams needing more throughput",
    features: ["Unlimited analyses", "Priority processing", "Advanced exports"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    blurb: "For compliance teams with governance controls",
    features: ["Workspace controls", "Custom policies", "Dedicated support"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen w-full px-4 py-10 sm:px-6 md:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Pricing</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900 md:text-5xl">Simple plans for any team</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Investor demo pricing layout. No payment flow is required for the current free roadmap.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <Card
              key={plan.name}
              className={`h-full rounded-2xl border p-6 ${
                idx === 1 ? "border-slate-900 bg-slate-900 text-white shadow-lg" : "bg-white"
              }`}
            >
              <p className={`text-sm ${idx === 1 ? "text-slate-300" : "text-slate-500"}`}>{plan.name}</p>
              <p className="mt-2 text-3xl font-bold">{plan.price}</p>
              <p className={`mt-1 text-sm ${idx === 1 ? "text-slate-300" : "text-slate-600"}`}>{plan.blurb}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check size={16} className={idx === 1 ? "text-emerald-300" : "text-emerald-600"} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/signup">
                  <Button variant={idx === 1 ? "primary" : "secondary"} className="w-full">
                    {idx === 1 ? "Start Pro Trial" : "Get Started"}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
