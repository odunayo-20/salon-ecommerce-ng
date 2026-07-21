import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // TODO: Save to database when ready
    return NextResponse.json({ success: true, message: "Hair profile saved successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to save hair profile" }, { status: 500 });
  }
}

export async function GET() {
  // TODO: Fetch from database when ready
  return NextResponse.json({ profile: null });
}
