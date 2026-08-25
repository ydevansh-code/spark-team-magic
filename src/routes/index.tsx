import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquare, Puzzle, Sparkles, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProjectMatch — Find teammates who complete you" },
      {
        name: "description",
        content:
          "AI-powered teammate matching for hackathons, competitions, and startups. Describe yourself and get a balanced 3-4 person team in one click.",
      },
      { property: "og:title", content: "ProjectMatch — Find teammates who complete you" },
      {
        property: "og:description",
        content:
          "AI-powered teammate matching for hackathons, competitions, and startups. Complementary skills, not similar ones.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Describe Yourself, Not a Form",
    body: "Just tell us what you can do and what you want to learn. No dropdowns.",
  },
  {
    icon: Puzzle,
    title: "We Find Your Gap, Not Your Twin",
    body: "AI analyzes what your project needs and matches complementary people.",
    featured: true,
  },
  {
    icon: Wand2,
    title: "Magic Assemble: One Click",
    body: "Click once and get a balanced, ready-to-work 3-4 person team instantly.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function Landing() {
  return (
    <div className="min-h-dvh bg-background p-3 sm:p-6 relative overflow-hidden">
      {/* Ambient background mesh gradient simulation */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-mint/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <motion.main 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="frame-mint mx-auto max-w-5xl px-6 py-14 sm:px-10 sm:py-20 relative z-10 bg-background/40 backdrop-blur-3xl"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="inline-block"
          >
            <Sparkles className="mx-auto size-5 text-mint" aria-hidden="true" />
          </motion.div>
          <motion.p variants={itemVariants} className="mt-3 text-lg font-bold tracking-tight">ProjectMatch</motion.p>

          <motion.h1 variants={itemVariants} className="mx-auto mt-6 max-w-3xl text-3xl leading-tight font-extrabold sm:text-[2.6rem] bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Teams Don't Need More People Who Look Like You.
            <br className="hidden sm:block" /> They Need People Who Complete You.
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-5 text-base font-semibold text-mint sm:text-lg">
            AI-powered matching for hackathons, competitions, and startups.
          </motion.p>
          <motion.p variants={itemVariants} className="mt-2 text-xs text-muted-foreground">
            Find teammates with complementary skills, not similar ones.
          </motion.p>
        </div>

        <motion.ul variants={containerVariants} className="mt-12 grid gap-4 sm:grid-cols-3 sm:items-center">
          {FEATURES.map(({ icon: Icon, title, body, featured }) => (
            <motion.li
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              key={title}
              className={
                featured
                  ? "ring-mint rounded-xl bg-surface-2 p-5 sm:-my-4 sm:py-8 shadow-xl shadow-mint/5"
                  : "rounded-xl border border-border bg-surface/40 p-5 hover:bg-surface/60 transition-colors"
              }
            >
              <span className="grid size-9 place-items-center rounded-lg bg-primary/15">
                <Icon className="size-4 text-mint" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-sm font-bold">{title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div variants={itemVariants} className="mt-12 text-center">
          <Link
            to="/workspace"
            className="glow-mint inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]"
          >
            Find Your Team
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-[11px] text-muted-foreground">
            No signup required — Try now
          </p>
        </motion.div>
      </motion.main>
    </div>
  );
}
