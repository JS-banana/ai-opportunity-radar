import type { ActivityOpportunity } from "@/lib/opportunity/model";

export const categoryDefinitions = [
  {
    title: { en: "Hackathons & build sprints", zh: "黑客松与构建冲刺" },
    description: { en: "Short, high-energy events to build, ship, and win.", zh: "短周期、高强度，适合组队构建和提交作品。" },
    chips: ["Build", "Team", "Prototype", "Pitch"],
    match: (item: ActivityOpportunity) => item.type === "hackathon" || item.type === "dev-challenge",
  },
  {
    title: { en: "API credits & cloud perks", zh: "API 积分与云资源" },
    description: { en: "Free API access, cloud credits, and developer tools.", zh: "API 调用、云资源和开发者权益。" },
    chips: ["API", "Cloud", "Credits", "Dev Tools"],
    match: (item: ActivityOpportunity) => item.rewardTypes.includes("api-credits"),
  },
  {
    title: { en: "Grants & research funding", zh: "资助与研究资金" },
    description: { en: "Funding for research, open science, and academic projects.", zh: "适合研究、开源、学术项目的资金支持。" },
    chips: ["Research", "Academic", "Funding", "Open Science"],
    match: (item: ActivityOpportunity) => item.type === "benefit" || /grant|research|fund/i.test(`${item.title} ${item.rewardSummary ?? ""}`),
  },
  {
    title: { en: "Prize challenges", zh: "奖金挑战" },
    description: { en: "Compete for cash prizes and public recognition.", zh: "面向奖金、排名和公开认可的挑战赛。" },
    chips: ["Prize", "Competition", "Leaderboard", "Cash"],
    match: (item: ActivityOpportunity) => item.rewardTypes.includes("cash") || item.type === "ai-competition",
  },
  {
    title: { en: "Startup programs", zh: "创业支持计划" },
    description: { en: "Incubators, accelerators, and founder support.", zh: "孵化器、加速器和创业者支持。" },
    chips: ["Startup", "Accelerator", "Mentorship", "Equity"],
    match: (item: ActivityOpportunity) => /startup|accelerator|loft|founder/i.test(`${item.title} ${item.rewardDetail ?? ""}`),
  },
  {
    title: { en: "Community events", zh: "社区活动" },
    description: { en: "Conferences, meetups, and AMAs to learn and connect.", zh: "会议、Meetup 和社区交流机会。" },
    chips: ["Meetup", "Conference", "AMA", "Networking"],
    match: (item: ActivityOpportunity) => /conference|meetup|summit|event/i.test(`${item.title} ${item.format ?? ""}`),
  },
  {
    title: { en: "Student opportunities", zh: "学生机会" },
    description: { en: "Scholarships, fellowships, and programs for students.", zh: "奖学金、研究项目和学生专项机会。" },
    chips: ["Student", "Fellowship", "Scholarship", "Learning"],
    match: (item: ActivityOpportunity) => /student|residency|fellowship|scholarship/i.test(`${item.title} ${item.rewardDetail ?? ""}`),
  },
] as const;

export type CategoryDefinition = (typeof categoryDefinitions)[number];

export const categoryImagePool = [
  "/assets/hero-hackathon-overhead.png",
  "/assets/path-api-credits-card.png",
  "/assets/source-dossier-desk.png",
  "/assets/path-prize-envelope.png",
  "/assets/coding-workshop-duotone.png",
  "/assets/path-submission-stage.png",
  "/assets/event-pass-macro.png",
];
