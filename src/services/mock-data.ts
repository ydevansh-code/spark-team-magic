import type { Candidate, Project, UserProfile } from "@/types/project-match";

export const mockProfile: UserProfile = {
  id: "me",
  displayName: "Your Profile",
  rawDescription:
    "I build product UIs in React and I'm decent at Node APIs. I want to get better at machine learning and data pipelines.",
  skills: [
    { id: "s1", name: "Node.js", level: "advanced" },
    { id: "s2", name: "Backend", level: "advanced" },
    { id: "s3", name: "React", level: "intermediate", inferred: true },
    { id: "s4", name: "SQL", level: "intermediate", inferred: true },
  ],
  wantsToLearn: ["Machine Learning", "Data Engineering"],
  availability: "part-time",
  timezone: "Asia/Kolkata",
};

export const mockProjects: Project[] = [
  {
    id: "p1",
    title: "Your Project Title",
    description: "A hackathon project matching tool for complementary teams.",
    neededRoles: ["Frontend", "UI/UX Design", "Machine Learning", "Data Engineering", "Backend"],
    teamSizeTarget: 4,
    createdAt: "2026-08-01T09:00:00.000Z",
    memberIds: ["c1", "c4"],
  },
  {
    id: "p2",
    title: "UI/UX Design Sprint",
    description: "Redesign the onboarding flow for a fintech app.",
    neededRoles: ["UI/UX Design", "Frontend"],
    teamSizeTarget: 3,
    createdAt: "2026-07-22T09:00:00.000Z",
    memberIds: ["c2"],
  },
  {
    id: "p3",
    title: "Magic Assemble",
    description: "Agent that assembles balanced teams in one click.",
    neededRoles: ["Machine Learning", "Backend"],
    teamSizeTarget: 4,
    createdAt: "2026-07-10T09:00:00.000Z",
    memberIds: ["c3", "c5"],
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: "c1",
    initials: "DI",
    displayName: "Diya Iyer",
    headline: "Design engineer, motion & systems",
    skills: [
      { id: "c1s1", name: "UI/UX Design", level: "advanced" },
      { id: "c1s2", name: "Frontend", level: "intermediate" },
    ],
    matchScore: 91,
    reasons: ["Complementary", "Mutual Interest"],
    explanation: "Covers design end-to-end while you own the backend.",
    gapFilled: "UI/UX Design",
    overlap: 15,
  },
  {
    id: "c2",
    initials: "UI",
    displayName: "Umang Iqbal",
    headline: "Product designer turning research into flows",
    skills: [
      { id: "c2s1", name: "UI/UX Design", level: "advanced" },
      { id: "c2s2", name: "Research", level: "intermediate" },
    ],
    matchScore: 74,
    reasons: ["Mutual Interest", "Complementary", "Same Level"],
    explanation: "Shares your interest in product design, low skill overlap.",
    overlap: 26,
  },
  {
    id: "c3",
    initials: "SS",
    displayName: "Sana Shah",
    headline: "ML engineer, recommender systems",
    skills: [
      { id: "c3s1", name: "Machine Learning", level: "advanced" },
      { id: "c3s2", name: "Python", level: "advanced" },
    ],
    matchScore: 74,
    reasons: ["Mutual Interest", "Complementary"],
    explanation: "Fills your Machine Learning gap — interested in product design.",
    gapFilled: "Machine Learning",
    overlap: 60,
  },
  {
    id: "c4",
    initials: "SG",
    displayName: "Sahil Gupta",
    headline: "Data engineer, streaming pipelines",
    skills: [
      { id: "c4s1", name: "Data Engineering", level: "advanced" },
      { id: "c4s2", name: "SQL", level: "advanced" },
    ],
    matchScore: 91,
    reasons: ["Complementary", "Adds to Team"],
    explanation: "Owns the data layer nobody on the team covers yet.",
    gapFilled: "Data Engineering",
    overlap: 28,
  },
  {
    id: "c5",
    initials: "SK",
    displayName: "Sara Khan",
    headline: "Full-stack generalist, hackathon veteran",
    skills: [
      { id: "c5s1", name: "Frontend", level: "intermediate" },
      { id: "c5s2", name: "Machine Learning", level: "beginner" },
    ],
    matchScore: 55,
    reasons: ["Mutual Interest", "Same Level"],
    explanation: "Fills your Machine Learning gap — interested in product design.",
    overlap: 56,
  },
  {
    id: "c6",
    initials: "AR",
    displayName: "Arjun Rao",
    headline: "Frontend engineer, design systems",
    skills: [
      { id: "c6s1", name: "Frontend", level: "advanced" },
      { id: "c6s2", name: "TypeScript", level: "advanced" },
    ],
    matchScore: 83,
    reasons: ["Complementary", "Adds to Team"],
    explanation: "Ships the interface fast so you stay on services.",
    gapFilled: "Frontend",
    overlap: 34,
  },
];
