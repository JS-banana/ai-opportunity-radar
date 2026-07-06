import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const TEAL = "#087270";
const PAPER = "#f7f3ea";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PAPER,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="128" height="128" fill="none">
          <circle cx="18" cy="18" r="16" stroke={TEAL} strokeWidth="2" />
          <rect
            x="6"
            y="6"
            width="24"
            height="24"
            stroke={TEAL}
            strokeWidth="1.5"
            transform="rotate(45 18 18)"
          />
          <path stroke={TEAL} strokeWidth="1.5" strokeLinecap="square" d="M4 11.75H32M4 24.25H32" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
