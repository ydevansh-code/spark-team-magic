import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/project-match";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

interface TeamAdvisorChatProps {
  project: Project | undefined;
  currentTeamSkills: string[][];
}

const STARTER_PROMPTS = [
  "What roles should I prioritize?",
  "Is my current team balanced?",
  "What skills complement mine?",
  "Suggest 3 must-have teammates",
];

export function TeamAdvisorChat({ project, currentTeamSkills }: TeamAdvisorChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!open && messages.at(-1)?.role === "model") setUnread((n) => n + 1);
  }, [messages, open]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyForApi = messages.map((m) => ({ role: m.role, text: m.text }));
      const { data, error } = await supabase.functions.invoke("team-advisor", {
        body: {
          project,
          currentTeam: currentTeamSkills.map((skills) => ({ skills: skills.map((name) => ({ name })) })),
          message: text,
          history: historyForApi,
        },
      });

      if (error) throw error;

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "model",
        text: data?.text ?? "Something went wrong. Try again.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Advisor chat error:", err);
      const errMsg = err?.message || err?.toString() || "Unknown error";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "model", text: `⚠️ Error: ${errMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="w-[340px] sm:w-[380px] rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
            style={{ maxHeight: "min(520px, calc(100dvh - 100px))" }}
          >
            <header className="flex items-center gap-2 bg-gradient-to-r from-mint/15 to-primary/5 px-4 py-3 border-b border-border">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/20">
                <Sparkles className="size-3.5 text-mint" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight">Team Advisor</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {project ? `Advising: ${project.title}` : "Select a project to get started"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 min-h-0"
                aria-label="Close advisor"
                onClick={() => setOpen(false)}
              >
                <ChevronDown className="size-4" />
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 mt-0.5">
                      <Bot className="size-3 text-mint" />
                    </span>
                    <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-3 py-2 text-xs leading-relaxed">
                      Hi! I&apos;m your AI team advisor. Ask me anything about what kind of teammates you should target for{" "}
                      <strong>{project?.title ?? "your project"}</strong>.
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">Try one of these:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STARTER_PROMPTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => send(p)}
                        className="rounded-lg border border-border/60 bg-surface/50 px-2 py-2 text-[10px] text-left font-medium text-muted-foreground hover:bg-surface hover:text-foreground hover:border-mint/30 transition-all leading-snug"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-2", msg.role === "user" && "flex-row-reverse")}
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full mt-0.5",
                        msg.role === "model" ? "bg-primary/15" : "bg-muted"
                      )}
                    >
                      {msg.role === "model" ? (
                        <Bot className="size-3 text-mint" />
                      ) : (
                        <span className="text-[8px] font-bold text-muted-foreground">YOU</span>
                      )}
                    </span>
                    <div
                      className={cn(
                        "max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                        msg.role === "model"
                          ? "bg-muted/60 rounded-tl-sm"
                          : "bg-primary text-primary-foreground rounded-tr-sm"
                      )}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))
              )}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 mt-0.5">
                    <Bot className="size-3 text-mint" />
                  </span>
                  <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3 flex items-center gap-1.5">
                    {[0, 0.15, 0.3].map((delay) => (
                      <motion.span
                        key={delay}
                        className="size-1.5 rounded-full bg-muted-foreground"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={endRef} />
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex gap-2 border-t border-border p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your team…"
                aria-label="Message to team advisor"
                className="flex-1 min-w-0 rounded-full bg-input/60 px-3 py-2 text-xs outline-none border border-border/60 focus:border-mint/50 focus:ring-1 focus:ring-mint/30 transition-all placeholder:text-muted-foreground/60"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="size-8 min-h-0 shrink-0 rounded-full"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close team advisor" : "Open team advisor"}
        aria-expanded={open}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex items-center justify-center size-14 rounded-full shadow-lg shadow-black/30 transition-colors",
          open
            ? "bg-muted border border-border text-foreground"
            : "bg-gradient-to-br from-mint to-primary text-primary-foreground glow-mint"
        )}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="size-5" />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles className="size-5" />
            </motion.span>
          )}
        </AnimatePresence>

        {!open && unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
