import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const weightsPath = path.join(process.cwd(), "trained_ai_weights.json");
    if (!fs.existsSync(weightsPath)) {
      return NextResponse.json({ error: "Weights file not found", totalAnalyzed: 0 });
    }
    const data = JSON.parse(fs.readFileSync(weightsPath, "utf-8"));
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
