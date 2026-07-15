import { NextRequest, NextResponse } from "next/server";
import { getYears } from "@/lib/airQuality";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country");
  const city = request.nextUrl.searchParams.get("city");
  if (!country || !city) {
    return NextResponse.json(
      { success: false, error: "Parameter country dan city wajib" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json({ success: true, data: { years: getYears(country, city) } });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Gagal memuat tahun" },
      { status: 500 },
    );
  }
}
