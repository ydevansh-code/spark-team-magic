/**
 * Shared domain types for ProjectMatch.
 * The mock service layer in src/services/* implements exactly these shapes,
 * so a real backend can drop in behind the same interfaces.
 */

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  /** true when extracted by AI from free text and not yet confirmed by the user */
  inferred?: boolean;
}

export interface UserProfile {
  id: string;
  displayName: string;
  /** the free-text "describe yourself" answer the AI parses */
  rawDescription: string;
  skills: Skill[];
  wantsToLearn: string[];
  availability: "casual" | "part-time" | "full-time";
  timezone: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export type ProjectRole = string;

export interface Project {
  id: string;
  title: string;
  description: string;
  neededRoles: ProjectRole[];
  teamSizeTarget: number;
  createdAt: string;
  memberIds: string[];
}

export type MatchReason =
  | "Complementary"
  | "Mutual Interest"
  | "Same Level"
  | "Adds to Team"
  | "Dark Or Dritm"
  | "Not Team Interest";

export interface Candidate {
  id: string;
  initials: string;
  displayName: string;
  headline: string;
  skills: Skill[];
  /** 0-100 */
  matchScore: number;
  reasons: MatchReason[];
  /** human readable "why this match" line */
  explanation: string;
  gapFilled?: string;
  /** 0-100 overlap with the current team */
  overlap: number;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface TeamMember {
  candidateId: string;
  addedAt: string;
  status: "on-team" | "invited";
}

export interface AssembleResult {
  members: TeamMember[];
  summary: string;
}

/** Every service call resolves to this envelope so UI error states are uniform. */
export interface ServiceError {
  code: "network" | "server" | "validation" | "not_found" | "rate_limited";
  message: string;
  retryable: boolean;
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: ServiceError }
  | { status: "success"; data: T };
