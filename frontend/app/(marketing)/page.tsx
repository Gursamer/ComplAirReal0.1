"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Risk Scoring",
    desc: "Instant 0-100 compliance score with clear severity tiers.",
    icon: ShieldCheck,
  },
  {
    title: "Clause Rewrites",
    desc: "Suggested text grounded in matched regulation citations.",
    icon: Sparkles,
  },
  {
    title: "GDPR Citations",
    desc: "Every flagged issue links back to specific article snippets.",
    icon: CheckCircle2,
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-10 md:px-8">
      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="rounded-3xl border border-slate-200 bg-white/75 p-8 shadow-panel backdrop-blur md:p-12"
      >
        <p className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Investor Demo</p>
        <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-text md:text-5xl">
          Upload a contract and get a compliance report in minutes.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          ComplyAI is an AI compliance copilot for fintech startups and SMBs. It flags risky clauses, cites GDPR articles,
          and suggests stronger language.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button className="gap-2">Open Demo App <ArrowRight size={16} /></Button>
          </Link>
          <Link href="/upload">
            <Button variant="secondary">Upload Document</Button>
          </Link>
        </div>
      </motion.section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.09 }}
            >
              <Card className="h-full p-5">
                <Icon className="text-accent" size={20} />
                <h3 className="mt-3 text-lg font-semibold text-text">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
              </Card>
            </motion.div>
          );
        })}
      </section>

      <section className="mt-10 rounded-3xl border border-slate-200 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["Upload", "Analyze", "Fix"].map((step, idx) => (
            <div key={step} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">Step {idx + 1}</p>
              <p className="mt-1 text-lg font-semibold text-text">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
