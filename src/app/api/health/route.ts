import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "NovaCraft AI Studio & Telegram Bot",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
