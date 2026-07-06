import { describe, expect, it } from "vitest";
import { registrationUrlFor } from "@/lib/opportunity/outbound";
import { seedSnapshot } from "@/lib/snapshot/seed";

describe("registrationUrlFor", () => {
  it("resolves URLs only by record id", () => {
    expect(registrationUrlFor(seedSnapshot, "rec_seed_google_genai")).toBe("https://example.com/google-genai-hackathon");
    expect(registrationUrlFor(seedSnapshot, "https://evil.example")).toBeNull();
    expect(registrationUrlFor(seedSnapshot, "missing")).toBeNull();
  });
});
