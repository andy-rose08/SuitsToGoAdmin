import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { store_id: string } }
) {
  //api/[store_id]/billboards
  try {
    const { userId } = auth();

    const body = await req.json();
    const { label, imageUrl } = body;

    if (!userId) {
      console.log("Unauthorized");
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!label) {
      return new NextResponse("Missing required label", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("Missing required image URL", { status: 400 });
    }

    if (!params.store_id) {
      return new NextResponse("Missing required Store ID", { status: 400 });
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

    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        store_id: params.store_id,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARDS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { store_id: string } }
) {//api/[store_id]/billboards
  try {
    if (!params.store_id) {
      return new NextResponse("Missing required Store ID", { status: 400 });
    }

    const billboards = await prismadb.billboard.findMany({
      where: {
        store_id: params.store_id,
      },
    });

    return NextResponse.json(billboards);
  } catch (error) {
    console.log("[BILLBOARDS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
