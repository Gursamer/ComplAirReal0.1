"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, Network, ShieldCheck, Sparkles } from "lucide-react";

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

const steps = [
  {
    title: "1. Upload Document",
    desc: "Drop PDF, DOCX, or TXT and start analysis in seconds.",
    json: `{"stage":"upload","status":"received","file":"vendor_agreement.pdf"}`,
    tags: ["Input", "Parsing"],
  },
  {
    title: "2. Extract Clauses",
    desc: "Segment legal language into structured clause units.",
    json: `{"stage":"extract","clauses":42,"strategy":"rule-based-split"}`,
    tags: ["Clauses", "Structure"],
  },
  {
    title: "3. Match Regulations",
    desc: "Link clauses to GDPR, SOC2, and PCI controls with citations.",
    json: `{"stage":"match","top":"GDPR Art.32","hits":18}`,
    tags: ["GDPR Art.32", "SOC2 CC6.1"],
  },
  {
    title: "4. Score Risk",
    desc: "Generate deterministic risk scores and severity levels.",
    json: `{"stage":"score","overall":82,"high_risk":7,"severity":"medium"}`,
    tags: ["Scoring", "Severity"],
  },
  {
    title: "5. Suggest Fixes",
    desc: "Return rewrite-ready recommendations with rationale.",
    json: `{"stage":"fixes","suggestions":14,"status":"ready"}`,
    tags: ["Rewrites", "Citations"],
  },
];

const useCases = [
  {
    title: "Vendor Contract Reviews",
    text: "Detect broad liability gaps, data-processing ambiguity, and missing breach response clauses before signature.",
    kpi: "38% faster legal turnaround",
  },
  {
    title: "Policy Readiness Checks",
    text: "Continuously test internal policies against GDPR, SOC2, and PCI expectations with citation-backed evidence.",
    kpi: "Up to 62% fewer redline cycles",
  },
  {
    title: "Board & Investor Reporting",
    text: "Package risk posture into executive-level visuals with measurable trend movement over time.",
    kpi: "Audit narrative ready in minutes",
  },
];

const timeline = [
  { time: "00:00", event: "Document upload accepted", detail: "File hash and profile generated." },
  { time: "00:08", event: "Clause extraction complete", detail: "42 clauses indexed and normalized." },
  { time: "00:15", event: "Regulation matching", detail: "GDPR + SOC2 + PCI links attached." },
  { time: "00:21", event: "Risk scoring finalized", detail: "Overall score: 82, high-risk clauses: 7." },
  { time: "00:28", event: "Fix recommendations ready", detail: "14 suggested rewrites with citations." },
];

function ComplianceGraph() {
  const edges = [
    { x1: 120, y1: 70, x2: 320, y2: 210 },
    { x1: 220, y1: 210, x2: 420, y2: 90 },
    { x1: 320, y1: 70, x2: 520, y2: 210 },
    { x1: 420, y1: 210, x2: 620, y2: 90 },
    { x1: 520, y1: 70, x2: 720, y2: 210 },
    { x1: 620, y1: 210, x2: 840, y2: 90 },
  ];
  const nodes = [
    { cx: 120, cy: 70, r: 8, fill: "rgba(16,185,129,0.95)" },
    { cx: 220, cy: 210, r: 6, fill: "rgba(167,139,250,0.9)" },
    { cx: 320, cy: 70, r: 9, fill: "rgba(16,185,129,0.95)" },
    { cx: 420, cy: 210, r: 6, fill: "rgba(167,139,250,0.9)" },
    { cx: 520, cy: 70, r: 8, fill: "rgba(16,185,129,0.95)" },
    { cx: 620, cy: 210, r: 6, fill: "rgba(167,139,250,0.9)" },
    { cx: 720, cy: 70, r: 9, fill: "rgba(16,185,129,0.95)" },
    { cx: 840, cy: 210, r: 6, fill: "rgba(167,139,250,0.9)" },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/94 p-4">
      <motion.svg viewBox="0 0 960 280" className="h-[270px] w-full rounded-xl border border-slate-800 bg-slate-950">
        <defs>
          <linearGradient id="edge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(16,185,129,0.75)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.75)" />
          </linearGradient>
        </defs>
        {edges.map((edge, idx) => (
          <motion.line
            key={`edge-${idx}`}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="url(#edge)"
            strokeWidth="2.4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.25 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: idx * 0.08 }}
          />
        ))}
        {nodes.map((node, idx) => (
          <motion.circle
            key={`node-${idx}`}
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill={node.fill}
            initial={{ scale: 0.6, opacity: 0.4 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
          />
        ))}
      </motion.svg>
      <p className="mt-3 text-sm text-slate-300">
        Nodes represent clauses, edges represent regulation matches, and clusters indicate risk categories.
      </p>
    </div>
  );
}

function DataStreamField({ depthY }: { depthY: import("framer-motion").MotionValue<number> }) {
  const streams = Array.from({ length: 24 }).map((_, i) => {
    const top = 6 + i * 3.7;
    const width = 20 + (i % 7) * 9;
    const delay = (i % 8) * 0.4;
    const duration = 8 + (i % 5) * 1.25;
    const opacity = 0.16 + (i % 5) * 0.08;
    return { top, width, delay, duration, opacity };
  });

  return (
    <motion.div
      style={{ y: depthY }}
      className="relative h-full min-h-[420px] w-full overflow-hidden bg-[radial-gradient(circle_at_72%_54%,rgba(34,197,94,0.22),transparent_42%)]"
    >
      {streams.map((s, idx) => (
        <motion.div
          key={idx}
          className="absolute h-px bg-gradient-to-r from-transparent via-sky-500 to-indigo-500"
          style={{ top: `${s.top}%`, width: `${s.width}%`, left: "-32%", opacity: s.opacity }}
          animate={{ x: ["0%", "205%"] }}
          transition={{ duration: s.duration, repeat: Infinity, ease: "linear", delay: s.delay }}
        />
      ))}
      {streams.map((s, idx) => (
        <motion.div
          key={`d-${idx}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
          style={{ top: `${s.top - 0.35}%`, left: "-28%" }}
          animate={{ x: ["0%", "214%"] }}
          transition={{ duration: s.duration, repeat: Infinity, ease: "linear", delay: s.delay + 0.2 }}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.16),transparent_25%,transparent_75%,rgba(2,6,23,0.16))]" />
    </motion.div>
  );
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const fgY = useTransform(scrollYProgress, [0, 1], [0, -95]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -45]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 pb-16 pt-4 sm:px-6 md:px-10">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-8 h-96 w-96 rounded-full bg-emerald-500/16 blur-3xl"
        animate={{ x: [0, -12, 6, 0], y: [0, 14, -7, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        style={{ y: bgY }}
        className="pointer-events-none absolute left-1/4 top-2 h-72 w-72 rounded-full bg-violet-500/12 blur-3xl"
      />

      <nav className="sticky top-4 z-30 mb-6 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/72 px-4 py-3 shadow-[0_12px_34px_rgba(0,0,0,0.4)] backdrop-blur">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/complai-logo.png"
            alt="ComplyAI logo"
            width={150}
            height={44}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        <div className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#workflow" className="hover:text-white">How It Works</a>
          <Link href="/investor" className="hover:text-white">Investor</Link>
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
          <Link href="/upload" className="hover:text-white">Try Demo</Link>
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button className="h-9 px-3 text-xs">Open App</Button>
          </Link>
        </div>
      </nav>

      <motion.section
        style={{ y: heroY }}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.78 }}
        className="relative min-h-[calc(100vh-8.5rem)] overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/56 p-0 shadow-[0_26px_54px_rgba(2,6,23,0.5)]"
      >
        <div className="accent-line absolute inset-x-0 top-0 h-[2px]" />
        <div className="absolute inset-0">
          <DataStreamField depthY={bgY} />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-slate-950/92 via-slate-950/72 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.12),transparent_36%)]" />
        </div>

        <div className="relative h-full">
          <motion.div style={{ y: fgY }} className="relative z-10 max-w-2xl px-8 py-10 md:px-10 md:py-12">
            <p className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              Dedicated Demo Home
            </p>
            <p className="mt-3 inline-flex rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-300">
              100% Free Mode: no paid AI API required for demo
            </p>
            <h1 className="type-h1 mt-6 max-w-xl font-extrabold text-slate-100">
              Compliance Intelligence for the AI Era
            </h1>
            <p className="mt-4 max-w-lg text-slate-300">
              Upload contracts. Detect risk. Stay audit-ready.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/upload">
                <Button className="gap-2">
                  Try Demo
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">View Dashboard</Button>
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 grid max-w-md gap-3 sm:grid-cols-2"
            >
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                <p className="text-xs text-slate-400">Live compliance score</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">82 / 100</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                <p className="text-xs text-slate-400">Open risk findings</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">17 clauses</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <section id="features" className="mt-10 grid gap-4 md:grid-cols-3">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full border-slate-300/30 bg-slate-50/95 p-5">
                <Icon className="text-slate-700" size={20} />
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
              </Card>
            </motion.div>
          );
        })}
      </section>

      <section id="workflow" className="mt-14">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Workflow Story</p>
          <h2 className="type-h2 mt-2 font-bold text-slate-100">How Compliance Intelligence Works</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.48, delay: idx * 0.07 }}
            >
              <Card className="h-full border-slate-300/50 bg-white/95 p-4 text-slate-900">
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="mt-2 text-xs text-slate-600">{step.desc}</p>
                <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-2 text-[11px] leading-relaxed text-emerald-300">
                  {step.json}
                </pre>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {step.tags.map((tag) => (
                    <span key={`${step.title}-${tag}`} className="rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-4 flex items-center gap-2">
          <Network size={18} className="text-emerald-300" />
          <h2 className="type-h2 font-bold text-slate-100">Signature Compliance Graph</h2>
        </div>
        <ComplianceGraph />
      </section>

      <section className="mt-16">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Use Cases</p>
          <h2 className="type-h2 mt-2 font-bold text-slate-100">Built For Compliance-Critical Teams</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {useCases.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
            >
              <Card className="h-full border-slate-800 bg-slate-950/74 p-5 text-slate-100">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.text}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">{item.kpi}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Live Timeline</p>
          <h2 className="type-h2 mt-2 font-bold text-slate-100">From Upload To Decision In Under 30 Seconds</h2>
        </div>
        <div className="space-y-3">
          {timeline.map((item, idx) => (
            <motion.div
              key={`${item.time}-${item.event}`}
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.07 }}
              className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-[88px,1fr]"
            >
              <div className="rounded-lg border border-violet-400/40 bg-violet-500/10 px-2 py-1 text-center text-sm font-semibold text-violet-200">
                {item.time}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">{item.event}</p>
                <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-[1.6rem] border border-slate-800 bg-[linear-gradient(120deg,rgba(16,185,129,0.18),rgba(139,92,246,0.16))] p-8"
        >
          <h3 className="text-3xl font-extrabold text-slate-100 md:text-4xl">Ready to pressure-test your compliance posture?</h3>
          <p className="mt-3 max-w-2xl text-slate-200">
            Analyze contracts, get risk scores, trace every finding to citations, and present board-ready insights in one flow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/upload">
              <Button className="gap-2">
                Analyze a Contract
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="secondary">View Demo Report</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="mt-16">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-800 bg-slate-950/75 p-5 text-slate-100">
            <h3 className="text-xl font-semibold">What ComplyAI Does</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
              <li>Analyzes contracts and policy documents for regulatory alignment.</li>
              <li>Flags risky or missing language with citation-backed evidence.</li>
              <li>Suggests stronger clause text to reduce legal and compliance exposure.</li>
            </ul>
          </Card>
          <Card className="border-slate-800 bg-slate-950/75 p-5 text-slate-100">
            <h3 className="text-xl font-semibold">What ComplyAI Does Not Do</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
              <li>Does not audit infrastructure, source code, or physical systems.</li>
              <li>Does not replace legal counsel for final legal advice.</li>
              <li>Focuses on documented commitments and contract/policy language quality.</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Investor Readiness</p>
          <h2 className="type-h2 mt-2 font-bold text-slate-100">What Matters Before Your Raise</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-800 bg-slate-950/75 p-5 text-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-400">Traction goal</p>
            <p className="mt-2 text-3xl font-bold">5-10 pilots</p>
            <p className="mt-2 text-sm text-slate-300">Founders, legal, or compliance leads actively testing workflows.</p>
          </Card>
          <Card className="border-slate-800 bg-slate-950/75 p-5 text-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-400">Core KPI</p>
            <p className="mt-2 text-3xl font-bold">&lt;30 min</p>
            <p className="mt-2 text-sm text-slate-300">Time to first useful compliance report from upload to export.</p>
          </Card>
          <Card className="border-slate-800 bg-slate-950/75 p-5 text-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-400">Proof point</p>
            <p className="mt-2 text-3xl font-bold">1+ LOI</p>
            <p className="mt-2 text-sm text-slate-300">At least one design partner or pilot letter before fundraising.</p>
          </Card>
        </div>
        <div className="mt-5">
          <Link href="/investor">
            <Button variant="secondary">Open Investor Brief</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
