import { NextRequest, NextResponse } from "next/server";
import { getCities } from "@/lib/airQuality";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country");
  if (!country) {
    return NextResponse.json({ success: false, error: "Parameter country wajib" }, { status: 400 });
  }

  try {
    return NextResponse.json({ success: true, data: { cities: getCities(country) } });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Gagal memuat kota" },
      { status: 500 },
    );
  }
}
