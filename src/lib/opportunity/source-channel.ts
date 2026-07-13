/** Public-facing channel names. Internal scan-run labels must never reach the snapshot or UI. */
const PUBLIC_SOURCE_CHANNELS = new Map(
  [
    "官网",
    "AgentDeadlines",
    "Devpost",
    "lablab.ai",
    "DoraHacks",
    "HuggingFace",
    "V2EX",
    "天池",
    "CompeteHub",
    "aihot.today",
    "Kaggle",
    "MLH",
    "HackerNoon",
    "ETHGlobal",
    "Twitter",
    "Reddit",
    "Hacker News",
    "活动行",
    "SegmentFault",
    "WayToAGI",
    "GitHub",
    "dev.events",
    "Luma",
    "Cerebral Valley",
    "Devfolio",
    "Unstop",
    "AIcrowd",
    "DataFountain",
    "魔搭",
  ].map((name) => [name.toLowerCase(), name] as const),
);

const SOURCE_CHANNEL_ALIASES: Record<string, string> = {
  tianchi: "天池",
};

/** Whitelisted display name, or null when internal/unknown. */
export function normalizePublicSourceChannel(value: string | null | undefined): string | null {
  const channel = value?.trim();
  if (!channel) return null;
  const lower = channel.toLowerCase();
  return SOURCE_CHANNEL_ALIASES[lower] ?? PUBLIC_SOURCE_CHANNELS.get(lower) ?? null;
}
