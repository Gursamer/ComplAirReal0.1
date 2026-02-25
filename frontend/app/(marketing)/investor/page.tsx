import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const milestones = [
  "Launch design partner pilot workflow",
  "Validate contract risk reduction outcomes",
  "Close first paid annual subscription",
  "Expand regulation coverage depth",
];

const useOfFunds = [
  { area: "Product Engineering", split: "45%", note: "Report quality, diff UX, and enterprise readiness." },
  { area: "Go-to-Market", split: "30%", note: "Founder-led sales + pilot conversions." },
  { area: "Security/Compliance", split: "15%", note: "Operational hardening and trust artifacts." },
  { area: "Operations", split: "10%", note: "Infra, tooling, and legal setup." },
];

export default function InvestorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:px-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Investor Brief</p>
        <h1 className="mt-3 text-4xl font-extrabold text-slate-100 md:text-5xl">
          ComplyAI: fast compliance intelligence for startup legal workflows
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          We help startups detect legal and regulatory risk in contracts and policies before customers, auditors, or investors do.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/upload">
            <Button>Run Live Demo</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Back Home</Button>
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Current stage</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">Working MVP + investor demo</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Funding target</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">$100,000</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Cost posture</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">Free-mode operation today</p>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-semibold text-slate-900">12-Month Milestones</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {milestones.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-semibold text-slate-900">Use of Funds</h2>
          <div className="mt-3 space-y-3">
            {useOfFunds.map((item) => (
              <div key={item.area} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{item.area}</p>
                  <p className="text-sm font-semibold text-emerald-700">{item.split}</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.note}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
