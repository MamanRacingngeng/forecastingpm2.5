import { NextResponse } from "next/server";
import { getCountries } from "@/lib/airQuality";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: { countries: getCountries() } });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Gagal memuat negara" },
      { status: 500 },
    );
  }
}
