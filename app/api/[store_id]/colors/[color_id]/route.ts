import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { color_id: string } }
) {
  //GET es para obtener el color por su id
  try {
    if (!params.color_id) {
      return new NextResponse("Color ID is required", { status: 400 });
    }

    const color = await prismadb.color.findUnique({
      where: {
        color_id: params.color_id,
      },
    });

    return NextResponse.json(color);
  } catch (e) {
    console.log("[SIZE_GET]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH /api/stores/[store_id]
export async function PATCH( //PATCH es para actualizar el color
  req: Request,
  { params }: { params: { store_id: string; color_id: string } } //params siempre esta presente
) {
  //api/[store_id]/sizes/[size_id]
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Missing Color name, is required!", {
        status: 400,
      });
    }

    if (!value) {
      return new NextResponse("Missing Color value,  is required!", {
        status: 400,
      });
    }

    if (!params.color_id) {
      return new NextResponse("Color ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        store_id: params.store_id,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const color = await prismadb.color.updateMany({
      where: {
        color_id: params.color_id,
      },
      data: {
        name,
        value,
      },
    });

    return NextResponse.json(color);
  } catch (e) {
    console.log("[COLOR_PATCH]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

//DELETE /api/stores/[store_id]
export async function DELETE( //DELETE es para eliminar el color
  req: Request, //dejarlo siempre, ya que params esta solo en el 2do parametro de la funcion
  { params }: { params: { store_id: string; color_id: string } } //params siempre esta presente
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.color_id) {
      return new NextResponse("Size ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        store_id: params.store_id,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const color = await prismadb.color.deleteMany({
      where: {
        color_id: params.color_id,
      },
    });

    return NextResponse.json(color);
  } catch (e) {
    console.log("[COLOR_DELETE]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}
