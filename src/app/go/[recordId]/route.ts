import { NextResponse } from "next/server";
import { registrationUrlFor } from "@/lib/opportunity/outbound";
import { getSnapshot } from "@/lib/snapshot/get";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ recordId: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { recordId } = await params;
  const { snapshot } = await getSnapshot();
  const url = registrationUrlFor(snapshot, recordId);
  if (!url) return new Response("Not found", { status: 404 });

  console.info("outbound_click", { recordId, url });
  return NextResponse.redirect(url, 302);
}
