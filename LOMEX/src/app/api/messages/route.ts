import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Chat disabled" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Chat disabled" }, { status: 403 });
}
