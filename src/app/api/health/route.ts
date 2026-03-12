import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, source: "app-router" });
}

export async function POST() {
  return NextResponse.json({ ok: true, source: "app-router" });
}