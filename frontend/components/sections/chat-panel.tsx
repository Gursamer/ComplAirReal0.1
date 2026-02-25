"use client";

import { useMemo, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { demoChatResponder } from "@/lib/demo-chat";
import { askReportQuestion } from "@/lib/api";
import { cn } from "@/lib/utils";
import { type NormalizedReport } from "@/lib/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  bullets?: string[];
  citations?: string[];
}

const PROMPTS = [
  "What are the top 3 risks?",
  "Rewrite clause 5 in stronger terms",
  "Which GDPR articles are most relevant?",
];

export function ChatPanel({ report }: { report: NormalizedReport }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Compliance copilot is ready. Ask about risks, rewrites, score drivers, or citations.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

  const disableSend = thinking || !draft.trim();

  const onSend = async (prefill?: string) => {
    const question = (prefill ?? draft).trim();
    if (!question || thinking) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: question,
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setThinking(true);

    await new Promise((resolve) => setTimeout(resolve, 900));
    let assistantMessage: ChatMessage;
    try {
      const remote = await askReportQuestion(report.id, question);
      assistantMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: remote.answer,
        citations: remote.citations,
      };
    } catch {
      const reply = demoChatResponder(report, question);
      assistantMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: reply.text,
        bullets: reply.bullets,
        citations: reply.citations,
      };
    }
    setMessages((prev) => [...prev, assistantMessage]);
    setThinking(false);
  };

  const chips = useMemo(() => PROMPTS, []);

  return (
    <Card className="h-full min-h-[680px] border-slate-200 bg-white p-0">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-slate-700" />
          <p className="text-sm font-semibold text-slate-900">AI Copilot</p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">
          Prototype (offline)
        </span>
      </div>

      <div className="space-y-2 border-b border-slate-200 px-3 py-3">
        <p className="px-1 text-[11px] uppercase tracking-[0.1em] text-slate-500">Suggested prompts</p>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onSend(chip)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[420px] space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[92%] rounded-2xl px-3 py-2",
                msg.role === "user"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-800",
              )}
            >
              <p className="text-sm">{msg.text}</p>
              {msg.bullets?.length ? (
                <ul className="mt-2 space-y-1">
                  {msg.bullets.map((item, idx) => (
                    <li key={`${msg.id}-${idx}`} className="text-xs leading-relaxed">
                      - {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {msg.citations?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.citations.slice(0, 4).map((citation) => (
                    <span
                      key={`${msg.id}-${citation}`}
                      className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700"
                    >
                      {citation}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {thinking ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <Loader2 size={12} className="animate-spin" />
              Thinking...
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask a question..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <Button onClick={() => onSend()} disabled={disableSend} className="h-10 w-10 p-0">
            <Send size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
