import type { Snapshot } from "./model";

export function registrationUrlFor(snapshot: Snapshot, recordId: string) {
  return snapshot.opportunities.find((item) => item.id === recordId)?.registrationUrl ?? null;
}
