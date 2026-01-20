import { NextResponse } from "next/server";
import { isInstalled } from "@/lib/data/site-settings";

export async function GET() {
  try {
    const installed = await isInstalled();
    return NextResponse.json({ installed });
  } catch (error) {
    console.error("Failed to check installation status:", error);
    return NextResponse.json({ installed: false }, { status: 500 });
  }
}
