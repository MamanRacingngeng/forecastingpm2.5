import { NextResponse } from "next/server";
import { getOverview } from "@/lib/airQuality";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: { overview: getOverview() } });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Gagal memuat overview" },
      { status: 500 },
    );
  }
}
