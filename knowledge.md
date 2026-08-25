# ProjectMatch — Knowledge Base

## Problem Statement
**Title**: ProjectMatch — Team Formation Platform  
**Goal**: Help people form effective project teams based on skills, interests, availability, experience, and project requirements.  
**Context**: People forming teams for hackathons, competitions, research, or startups rely on social connections. This limits discovery of complementary talent.

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + TanStack Start (SSR-capable) |
| Routing | TanStack Router (file-based) |
| Data Fetching | TanStack Query (React Query v5) |
| Styling | Tailwind CSS v4 + shadcn/ui + Radix UI |
| Notifications | Sonner (toast system) |
| Build Tool | Vite 8 + Nitro (Cloudflare-module preset) |
| Backend | **Supabase** (Postgres + Auth + Storage) |
| Deployment Target | Cloudflare Workers (via Nitro) |

---

## Environment Variables Required
Create `.env` at the project root (never commit):
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```
Both are found in Supabase Dashboard → Project Settings → API.

---

## Supabase Database Schema

### `profiles` table
Maps 1:1 with a Supabase auth user.
```sql
id            uuid PRIMARY KEY REFERENCES auth.users(id)
display_name  text NOT NULL
raw_description text
availability  text CHECK (availability IN ('casual','part-time','full-time'))
timezone      text
wants_to_learn text[]          -- array of strings
created_at    timestamptz DEFAULT now()
updated_at    timestamptz DEFAULT now()
```

### `skills` table
Skills belonging to a profile (1-to-many).
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
name       text NOT NULL
level      text CHECK (level IN ('beginner','intermediate','advanced'))
inferred   boolean DEFAULT false
```

### `projects` table
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
owner_id         uuid NOT NULL REFERENCES profiles(id)
title            text NOT NULL
description      text
needed_roles     text[]
team_size_target integer DEFAULT 4
created_at       timestamptz DEFAULT now()
```

### `team_members` table
Tracks who is on which team.
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE
candidate_id uuid NOT NULL REFERENCES profiles(id)
status       text CHECK (status IN ('on-team','invited')) DEFAULT 'on-team'
added_at     timestamptz DEFAULT now()
UNIQUE(project_id, candidate_id)
```

---

## Frontend Data Flow (how UI calls backend)

All UI components call through `src/services/project-match-service.ts` only.  
**Nothing in `src/components` or `src/routes` talks to Supabase directly.**

| Service | Method | Current Mock | Supabase Replacement |
|---|---|---|---|
| `profileService` | `get()` | Returns `mockProfile` | `supabase.from('profiles').select('*, skills(*)')` for current user |
| `profileService` | `update(patch)` | Mutates in-memory profile | `supabase.from('profiles').update(...)` + upsert skills |
| `projectService` | `list()` | Returns `mockProjects[]` | `supabase.from('projects').select('*').eq('owner_id', user.id)` |
| `projectService` | `get(id)` | Finds in array | `supabase.from('projects').select('*').eq('id', id).single()` |
| `projectService` | `create(input)` | Pushes to array | `supabase.from('projects').insert(...)` |
| `projectService` | `remove(id)` | Filters from array | `supabase.from('projects').delete().eq('id', id)` |
| `matchService` | `listCandidates(projectId)` | Scores `mockCandidates[]` | Query all profiles NOT on team, compute match score |
| `matchService` | `magicAssemble(projectId)` | Picks top-3 | Pick top-3 scored profiles and insert into `team_members` |
| `teamService` | `list(projectId)` | Reads `team` Map | `supabase.from('team_members').select('*, profiles(*,skills(*)')` |
| `teamService` | `add(projectId, candidateId)` | Pushes to Map | `supabase.from('team_members').insert(...)` |
| `teamService` | `remove(projectId, candidateId)` | Filters from Map | `supabase.from('team_members').delete().match({project_id,candidate_id})` |

---

## Match Score Algorithm
The match score (0-100) per candidate is computed from:
1. **Role gap fill** (+40): Does the candidate fill a `needed_role` not yet covered by the team?
2. **Skill overlap penalty** (-15): High overlap (>50%) reduces score.
3. **Wants-to-learn bonus** (+20): Candidate wants to learn something the project owner knows.
4. **Complementary** (+20): Candidate has skills the existing team lacks.
5. **Same level** (+5): Candidate availability matches project pace.

This algorithm can start as a TypeScript function in `src/lib/match-score.ts` and later be promoted to a Supabase Edge Function for server-side computation.

---

## Key TypeScript Types (Frontend → Backend mapping)

```typescript
// src/types/project-match.ts already defines these cleanly:
UserProfile   → profiles + skills tables
Project       → projects table
Candidate     → profiles + skills + computed matchScore
TeamMember    → team_members table
AssembleResult → { members: TeamMember[], summary: string }
```

---

## Auth Strategy
- Use **Supabase Auth** (email/password or magic link).
- The logged-in user's `auth.users.id` = `profiles.id`.
- Row Level Security (RLS) on all tables so users can only read/write their own data.
- On first login, auto-create a profile row via a Supabase `auth.users` trigger.

---

## RLS Policies Required
```sql
-- profiles: owner only
CREATE POLICY "owner" ON profiles USING (auth.uid() = id);

-- skills: owner only (via profile)
CREATE POLICY "owner" ON skills USING (
  profile_id = auth.uid()
);

-- projects: owner can CRUD, others can SELECT (for discovery)
CREATE POLICY "owner_write" ON projects FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "public_read" ON projects FOR SELECT USING (true);

-- team_members: project owner or candidate themselves
CREATE POLICY "team_access" ON team_members USING (
  project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  OR candidate_id = auth.uid()
);

-- profiles (discovery): allow all authenticated users to read profiles
CREATE POLICY "authenticated_read" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
```

---

## Implementation Steps (ordered)
1. Install `@supabase/supabase-js` 
2. Create `.env` with project keys
3. Create `src/lib/supabase.ts` — initialize client
4. Run SQL migrations in Supabase to create all tables + RLS
5. Create `src/lib/match-score.ts` — pure scoring function
6. Replace `project-match-service.ts` mock bodies with real Supabase calls
7. Add auth flow (login/signup) — gating the `/workspace` route
8. Wire profile auto-creation on first auth

---

## Files That MUST NOT Change (per project rules)
- `src/components/**` — all UI components are final
- `src/styles.css` — design system is locked

---

## Dev Server
Running at: **http://localhost:8080/**  
Start: `npm run dev`  
Build check: `npm run build`
