import { getUtmifyConnection } from "@/lib/utmify";
import { NextResponse } from "next/server";

export async function GET() {
  const connection = await getUtmifyConnection();
  return NextResponse.json({ provider: "utmify", ...connection });
}
