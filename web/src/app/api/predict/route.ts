import { NextRequest, NextResponse } from "next/server";
import { predict } from "@/lib/predict";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const country = String(body.country ?? "").trim();
    const city = String(body.city ?? "").trim();
    const year = parseInt(String(body.year), 10);

    if (!country || !city || Number.isNaN(year)) {
      return NextResponse.json(
        { success: false, error: "Negara, kota, dan tahun wajib diisi" },
        { status: 400 },
      );
    }

    const data = predict(country, city, year);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Prediksi gagal" },
      { status: 500 },
    );
  }
}
