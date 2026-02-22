"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

import { severityFromScore } from "@/lib/utils";

const colorBySeverity = {
  low: "#15803d",
  medium: "#b45309",
  high: "#be123c",
};

export function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 54;
  const progress = useMotionValue(0);
  const progressText = useTransform(progress, (latest) => Math.round(latest));
  const strokeDashoffset = useTransform(progress, (v) => circumference - (v / 100) * circumference);

  useEffect(() => {
    const controls = animate(progress, clamped, { duration: 1.1, ease: "easeOut" });
    return () => controls.stop();
  }, [clamped, progress]);

  const severity = severityFromScore(clamped);
  const stroke = colorBySeverity[severity];

  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="transparent" stroke="#e2e8f0" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="transparent"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <motion.span className="text-3xl font-bold text-text">{progressText}</motion.span>
      </div>
    </div>
  );
}
