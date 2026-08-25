# 🚀 ProjectMatch — AI Team Formation Platform

> **Hackathon submission for PromptWars × Fastathon** (organized by FAST SRM, NVIDIA, and Hack2Skill)
> Live Deployment: [https://teamfindr.vercel.app](https://teamfindr.vercel.app)

---

## 🎯 Problem Statement

Teams built on social connections miss the best collaborators. Random grouping ignores skill gaps.
**ProjectMatch** solves this by using Generative AI to match people to projects based on **complementary skills, availability, and learning goals** — not just immediate social circles.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🤖 **Magic Assemble (AI Matching)** | One-click AI team builder: calls a server-side Supabase Edge Function (`match-score`) using Gemini 2.5 Flash to evaluate candidate complementarity and automatically assemble balanced 3-4 person teams |
| 🎯 **Match Explanations** | Every match card shows *why* someone is recommended (e.g., "Fills your Backend gap") with a 0-100 compatibility score |
| 👤 **Dynamic Skill Profiles** | Users declare known skills + what they want to learn with verified badges and GitHub / LinkedIn links |
| 📁 **Multi-Project Management** | Create and switch between multiple projects, each with custom needed roles and team size targets |
| 🔐 **Multi-Provider Auth & Audit** | Email/Password, Google, and GitHub OAuth with session audit logging in `user_login_logs` |
| 🎨 **Glassmorphism UI** | Responsive dark-mode interface with Tailwind CSS v4, shadcn/ui primitives, and fluid Framer Motion micro-interactions |

---

## 🧠 Match Score Algorithm & AI Integration

The matching logic combines algorithmic scoring with Gemini AI evaluation:

```
score = (roles_filled × 40) + (wants_to_learn_bonus × 20)   [capped at 100]
```

1. **Role gap fill** (+40): Does the candidate fill an unassigned `needed_role`?
2. **Cross-pollination bonus** (+20): Does the candidate want to learn a skill another team member knows?
3. **Edge compute & zero secret leakage**: The client securely invokes the Supabase Edge Function which queries Google Gemini API (`gemini-2.5-flash`) with structured prompts.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| Frontend | React 19 + TanStack Start + TanStack Router + Vite 8 |
| State Management | TanStack Query (React Query v5) + Custom Hooks (`useAuth`) |
| Styling & Motion | Tailwind CSS v4 + shadcn/ui + Radix UI + Framer Motion |
| Backend & BaaS | Supabase (PostgreSQL + Auth + Storage) |
| Serverless / AI | Supabase Edge Functions (Deno / TypeScript) + Google Gemini API |
| Deployment | Vercel |

```
src/
├── hooks/            # Custom hooks (useAuth for session sync)
├── lib/
│   └── supabase.ts   # Typed Supabase client (Database schema types)
├── routes/           # TanStack file-based routing
│   ├── index.tsx     # Animated landing page
│   ├── login.tsx     # OAuth & Email Auth
│   └── workspace.tsx # Dashboard, Magic Assemble, Team view
├── services/
│   └── project-match-service.ts  # Typed API abstraction layer
├── components/pm/    # Domain UI (MatchCard, CurrentTeam, States)
└── types/
    └── project-match.ts          # Domain TypeScript interfaces
```

---

## 🔒 Security & Code Quality

- **Row Level Security (RLS)**: Enforced across `profiles`, `skills`, `projects`, and `team_members`.
- **Strict TypeScript**: Full `Database` schema generic typing with 0 `any` casts in the service layer.
- **Protected Secrets**: Gemini API keys stay exclusively inside Supabase Edge secrets.
- **Accessibility (a11y)**: ARIA labels, `role="alert"`, `aria-busy`, `aria-live`, and `aria-expanded` attributes on all dynamic components.

---

## 🏁 Local Setup

```bash
# 1. Clone repo
git clone https://github.com/ydevansh-code/spark-team-magic.git
cd spark-team-magic

# 2. Install dependencies
npm install

# 3. Add Supabase keys to .env
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 4. Run local dev
npm run dev
```

