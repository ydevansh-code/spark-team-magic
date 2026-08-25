import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquare, Puzzle, Sparkles, Wand2 } from "lucide-react";

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

function Landing() {
  return (
    <div className="min-h-dvh bg-background p-3 sm:p-6">
      <main className="frame-mint mx-auto max-w-5xl px-6 py-14 sm:px-10 sm:py-20">
        <div className="text-center">
          <Sparkles className="mx-auto size-5 text-mint" aria-hidden="true" />
          <p className="mt-3 text-lg font-bold tracking-tight">ProjectMatch</p>

          <h1 className="mx-auto mt-6 max-w-3xl text-3xl leading-tight font-extrabold sm:text-[2.6rem]">
            Teams Don't Need More People Who Look Like You.
            <br className="hidden sm:block" /> They Need People Who Complete You.
          </h1>

          <p className="mt-5 text-base font-semibold text-mint sm:text-lg">
            AI-powered matching for hackathons, competitions, and startups.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Find teammates with complementary skills, not similar ones.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-3 sm:items-center">
          {FEATURES.map(({ icon: Icon, title, body, featured }) => (
            <li
              key={title}
              className={
                featured
                  ? "ring-mint rounded-xl bg-surface-2 p-5 sm:-my-4 sm:py-8"
                  : "rounded-xl border border-border bg-surface/40 p-5"
              }
            >
              <span className="grid size-9 place-items-center rounded-lg bg-primary/15">
                <Icon className="size-4 text-mint" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-sm font-bold">{title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <Link
            to="/workspace"
            className="glow-mint inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Find Your Team
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-[11px] text-muted-foreground">
            No signup required — Try now
          </p>
        </div>
      </main>
    </div>
  );
}
