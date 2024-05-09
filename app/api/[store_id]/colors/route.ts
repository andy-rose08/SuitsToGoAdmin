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
    const { name, value } = body;

    if (!userId) {
      console.log("Unauthorized");
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Missing required color name", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Missing required color value", { status: 400 });
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

    const color = await prismadb.color.create({
      data: {
        name,
        value,
        store_id: params.store_id,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLORS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { store_id: string } }
) {
  //api/[store_id]/billboards
  try {
    if (!params.store_id) {
      return new NextResponse("Missing required Store ID", { status: 400 });
    }

    const colors = await prismadb.color.findMany({
      where: {
        store_id: params.store_id,
      },
    });

    return NextResponse.json(colors);
  } catch (error) {
    console.log("[COLORS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
