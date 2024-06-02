import Stripe from "stripe";

import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { store_id: string } }
) {
  const { items, userId } = await req.json();

  if (!items || items.length === 0) {
    return new NextResponse("Missing product_ids", { status: 400 });
  }

  const products = await prismadb.product.findMany({
    where: {
      product_id: {
        in: items.map((item: any) => item.product_id),
      },
    },
  });

  const initialState = await prismadb.orderState.findFirst({
    where: {
      order_state_id: "1"
    },
  });
  if (!initialState) {
    return new NextResponse("Error interno, no existe el estado inicial para la orden", { headers: corsHeaders, status: 404 });
    
  }
  
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const non_stock_items: Array<any> = [];

  for(let product of products) {
    let item = items.find((item: any) => item.product_id === product.product_id)
    if (!item){
      return new NextResponse("Error interno, no existe un producto de la orden", { headers: corsHeaders, status: 404 });
    }
    if(item.quantity > product.quantity){
      non_stock_items.push({quantity: item.quantity, product: product});
    }
    line_items.push({
      quantity: item.quantity,
      price_data: {
        currency: "USD",
        product_data: {
          name: product.name,
        },
        unit_amount: product.price * 100,
      },
    });
  };

  if(non_stock_items.length > 0) {
    return NextResponse.json(
      { non_stock_items },
      {
        status: 404,
        headers: corsHeaders,
      }
    );
  }

  if(line_items.length === 0){
    return new NextResponse("Error interno, no se pudo procesar la orden", { headers: corsHeaders, status: 500 });
  }
 
  const order = await prismadb.order.create({
    data: {
      store_id: params.store_id,
      isPaid: false,
      userId: userId,
      order_state_id: initialState?.order_state_id,
      orderItems: {
        create: items.map((item: any) => ({
          product: {
            connect: {
              product_id: item.product_id,
            },
          },
          quantity: item.quantity
        })),
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1&orderId=${order.order_id}`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1&orderId=${order.order_id}`,
    metadata: {
      order_id: order.order_id,
    },
  });
  
  console.log("ORDER CREATED ", order.order_id)
  return NextResponse.json(
    { url: session.url },
    {
      headers: corsHeaders,
    }
  );
}
