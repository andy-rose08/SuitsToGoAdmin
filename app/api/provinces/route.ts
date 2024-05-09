import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const provinces = await prismadb.province.findMany();
    return NextResponse.json(provinces);
  } catch (error) {
    console.error("[PROVINCES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


