import prismadb from "@/lib/prismadb";
//import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { store_id: string } }
) {
  //api/[store_id]/orders?userId=<userId>
  try {
    const { searchParams } = new URL(req.url);
    const user_order_id = searchParams.get("userId") || undefined;
    
    if (!params.store_id) {
      return new NextResponse("Missing required Store ID", { status: 400 });
    }
    if (!user_order_id) {
      return new NextResponse("Missing required User ID", { status: 400 });
    }
    
    const orders = await prismadb.order.findMany({
      where: {
        store_id: params.store_id,
        userId: user_order_id
      },
      include: {
        orderItems: {
          include: {
            product: true
          },
        },
        orderState: true
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.log("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
