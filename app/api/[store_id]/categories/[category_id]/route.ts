import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { category_id: string } }
) {
  //GET es para obtener la category por su id
  try {
    if (!params.category_id) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    const category = await prismadb.category.findUnique({
      where: {
        category_id: params.category_id,
      },
      include: {
        billboard: true,
      },
    });

    return NextResponse.json(category);
  } catch (e) {
    console.log("[CATEGORY_GET]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH /api/stores/[store_id]
export async function PATCH( //PATCH es para actualizar el category
  req: Request,
  { params }: { params: { store_id: string; category_id: string } } //params siempre esta presente
) {
  //api/[store_id]/categories/[category_id]
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, billboard_id } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Missing Category name, is required!", {
        status: 400,
      });
    }

    if (!billboard_id) {
      return new NextResponse("Missing Billboard ID, is required!", {
        status: 400,
      });
    }

    if (!params.category_id) {
      return new NextResponse("Category ID is required", { status: 400 });
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

    const category = await prismadb.category.updateMany({
      where: {
        category_id: params.category_id,
      },
      data: {
        name,
        billboard_id,
      },
    });

    return NextResponse.json(category);
  } catch (e) {
    console.log("[CATEGORY_PATCH]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

//DELETE /api/stores/[store_id]
export async function DELETE( //DELETE es para eliminar el category
  req: Request, //dejarlo siempre, ya que params esta solo en el 2do parametro de la funcion
  { params }: { params: { store_id: string; category_id: string } } //params siempre esta presente
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.category_id) {
      return new NextResponse("Billboard ID is required", { status: 400 });
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

    const category = await prismadb.category.deleteMany({
      where: {
        category_id: params.category_id,
      },
    });

    return NextResponse.json(category);
  } catch (e) {
    console.log("[CATEGORY_DELETE]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}
