# 🚀 ProjectMatch — AI Team Formation Platform

ProjectMatch is an intelligent team-formation platform that calculates complementary skill scores and auto-assembles balanced project teams using Generative AI. 

Built during the **4.5-hour Prompt Wars Hackathon** (organized by FAST SRM, NVIDIA, and Hack2Skill), this MVP solves the problem of inefficient team building by matching users based on skill gaps, needed roles, and learning interests rather than just immediate social circles.

---

## ✨ Key Features

* **🤖 Magic Assemble (AI Matching):** Uses a server-side Gemini 2.5 Flash model to evaluate candidates and project requirements, outputting a 0-100 compatibility score with reasoned insights.
* **🔒 Secure Edge Architecture:** AI scoring logic and API keys are completely protected within a Supabase Edge Function, ensuring zero client-side vulnerability.
* **🔐 Multi-Provider Authentication:** Secure login via Email/Password and Google OAuth, backed by a custom `user_login_logs` audit table for session tracking.
* **👨‍💻 Dynamic Profiles:** User cards feature interactive skill tags, availability statuses, and direct external routing to GitHub and LinkedIn profiles.
* **🎨 Glassmorphism UI:** A highly polished, responsive dark-mode interface built with Tailwind CSS, Shadcn UI, and Framer Motion.

---

## 🛠️ Tech Stack

**Frontend (Client)**
* React.js + Vite
* Tailwind CSS
* Shadcn UI (Component Primitives)
* Framer Motion (Micro-interactions)

**Backend (BaaS)**
* Supabase (PostgreSQL Database & Auth)
* Row Level Security (RLS) for data privacy

**AI & Edge Compute**
* Supabase Edge Functions (Deno / TypeScript)
* Google Gemini API (`gemini-2.5-flash`)

---

## 🏗️ System Architecture

1. **Client Layer:** User requests an AI match via the frontend dashboard.
2. **Auth Layer:** Supabase verifies the active session and logs the user agent/IP.
3. **Edge Layer:** The client securely invokes the `match-score` Supabase Edge Function.
4. **AI Layer:** The Edge Function constructs a specialized prompt using the project needs and candidate profile, queries the Gemini API, and returns a verified JSON payload.
5. **Database Layer:** Approved matches are persisted in the `team_members` relational table.

---

## 🏁 Local Setup & Installation

**1. Clone the repository:**
```bash
git clone [https://github.com/ydevansh-code/spark-team-magic.git](https://github.com/ydevansh-code/spark-team-magic.git)
cd spark-team-magic
