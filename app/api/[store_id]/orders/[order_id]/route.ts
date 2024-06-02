import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  { params }: { params: { store_id: string, order_id: string } }
) {
  //api/[store_id]/orders/[order_id]?userId=<userId>
  try {
    const { searchParams } = new URL(req.url);
    const user_order_id = searchParams.get("userId") || undefined;
    
    if (!params.store_id) {
      return new NextResponse("Missing required Store ID", { status: 400 });
    }
   
    if (!params.order_id) {
      return new NextResponse("Missing required Order ID", { status: 400 });
    }
    if (!user_order_id) {
      return new NextResponse("Missing required User ID", { status: 400 });
    }
    
    const order = await prismadb.order.findFirst ({
      where: {
        store_id: params.store_id,
        order_id: params.order_id,
        userId: user_order_id
      },
      include: {
        orderItems: {
          include: {
            product: {
              include:{
                color: true,
                category: true,
                size: true,
                images: true
              }
            },
          },
        },
        orderState: true
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

//PATCH /api/[store_id]/orders/[order_id]
export async function PATCH(
  req: Request,
  { params }: { params: { store_id: string, order_id: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const {
      order_state_id,
      isPaid,
      phone,
      address,
    } = body;
    const userIdOrder = body.userId // No se puede desestructurar con JS, por mismo nombre en auth

    if (!userId) {
      console.log("Unauthorized");
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.store_id) {
      return new NextResponse("Missing required Store ID", { status: 400 });
    }

    if (!params.order_id) {
      return new NextResponse("Missing required Order ID", { status: 400 });
    }
    
    if (!userIdOrder) {
      return new NextResponse("Missing required User Order ID", { status: 400 });
    }

    if (!order_state_id) {
      return new NextResponse("Missing required order state ID", { status: 400 });
    }

    if (isPaid === undefined) {
      return new NextResponse("Missing required paid value", { status: 400 });
    }
   
    if (!phone) {
      return new NextResponse("Missing required phone", { status: 400 });
    }
   
    if (!address) {
      return new NextResponse("Missing required address", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      //busca la tienda por el id del usuario
      where: {
        store_id: params.store_id,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const order = await prismadb.order.update({
      where:{
        order_id: params.order_id,
        store_id: params.store_id,
        userId: userIdOrder,
      },
      data: {
        order_state_id,
        isPaid,
        phone,
        address,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDERS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

//DELETE /api/[store_id]/orders/[order_id]
export async function DELETE( //DELETE es para eliminar la orden
  req: Request,
  { params }: { params: { store_id: string; order_id: string } }
) {
  try {
    /*
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    */

    if (!params.store_id) {
      return new NextResponse("Store ID is required", { status: 400 });
    }
   
    if (!params.order_id) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    /*const storeByUserId = await prismadb.store.findFirst({
      where: {
        store_id: params.store_id,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }*/

    const order = await prismadb.order.findFirst({
      where: {
        order_id: params.order_id,
        store_id: params.store_id,
      }
    });

    if(!order){
      return new NextResponse("Order Not found", { status: 404 });
    }
    
    // Remove each order item from the order
    await prismadb.orderItem.deleteMany({
      where: {
        order_id: order.order_id
      },
    });
    // Remove order
    const orderRemoved = await prismadb.order.deleteMany({
      where: {
        order_id: order.order_id
      },
    });
    return NextResponse.json({orderRemoved}, {headers: corsHeaders});
  } catch (e) {
    console.log("[ORDER_DELETE]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}
