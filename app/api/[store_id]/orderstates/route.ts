import prismadb from "@/lib/prismadb";
//import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request
) {
  //api/[store_id]/orderstates
  try {
    const orderstates = await prismadb.orderState.findMany({
      orderBy: {
        order_state_id: "asc",
      },
    });

    return NextResponse.json(orderstates);
  } catch (error) {
    console.log("[ORDERSTATES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
