"use client";

export type IconName =
  | "arrow"
  | "bookmark"
  | "calendar"
  | "chevron"
  | "clock"
  | "gift"
  | "github"
  | "globe"
  | "grid"
  | "search"
  | "sliders"
  | "spark"
  | "trophy"
  | "users"
  | "verified";

export function Icon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true };
  const stroke = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "arrow") return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" {...stroke} /></svg>;
  if (name === "bookmark") return <svg {...common}><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.3L6 20V5a1 1 0 0 1 1-1Z" {...stroke} /></svg>;
  if (name === "calendar") return <svg {...common}><path d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" {...stroke} /></svg>;
  if (name === "chevron") return <svg {...common}><path d="m8 10 4 4 4-4" {...stroke} /></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="9" {...stroke} /><path d="M12 7v5l3 2" {...stroke} /></svg>;
  if (name === "gift") return <svg {...common}><path d="M20 12v8H4v-8M3 8h18v4H3zM12 8v12M12 8H8.5A2.5 2.5 0 1 1 11 5.5L12 8Zm0 0h3.5A2.5 2.5 0 1 0 13 5.5L12 8Z" {...stroke} /></svg>;
  if (name === "github") return <svg {...common}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" {...stroke} /></svg>;
  if (name === "globe") return <svg {...common}><circle cx="12" cy="12" r="9" {...stroke} /><path d="M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9S14.4 18.4 12 21M12 3C9.6 5.6 8.4 8.6 8.4 12S9.6 18.4 12 21" {...stroke} /></svg>;
  if (name === "grid") return <svg {...common}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" {...stroke} /></svg>;
  if (name === "search") return <svg {...common}><circle cx="10.5" cy="10.5" r="6.5" {...stroke} /><path d="m16 16 5 5" {...stroke} /></svg>;
  if (name === "sliders") return <svg {...common}><path d="M4 7h7M15 7h5M13 5v4M4 17h5M13 17h7M11 15v4" {...stroke} /></svg>;
  if (name === "spark") return <svg {...common}><path d="m12 3 1.8 5 5.2 1.9-5.2 1.9L12 17l-1.8-5.2L5 9.9 10.2 8 12 3ZM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16Z" {...stroke} /></svg>;
  if (name === "trophy") return <svg {...common}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM5 6H3v2a4 4 0 0 0 4 4M19 6h2v2a4 4 0 0 1-4 4" {...stroke} /></svg>;
  if (name === "users") return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM21 21v-2a3.5 3.5 0 0 0-3-3.5M18 4.2a3.5 3.5 0 0 1 0 6.6" {...stroke} /></svg>;
  return <svg {...common}><path d="m12 2 2.1 2.5 3.2-.2.8 3.1 2.7 1.7-1.3 2.9 1.3 2.9-2.7 1.7-.8 3.1-3.2-.2L12 22l-2.1-2.5-3.2.2-.8-3.1-2.7-1.7L4.5 12 3.2 9.1l2.7-1.7.8-3.1 3.2.2L12 2Z" {...stroke} /><path d="m8.7 12 2.1 2.1 4.5-4.8" {...stroke} /></svg>;
}
