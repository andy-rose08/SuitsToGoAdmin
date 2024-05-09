import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { size_id: string } }
) {
  //GET es para obtener el size por su id
  try {
    if (!params.size_id) {
      return new NextResponse("Size ID is required", { status: 400 });
    }

    const size = await prismadb.size.findUnique({
      where: {
        size_id: params.size_id,
      },
    });

    return NextResponse.json(size);
  } catch (e) {
    console.log("[SIZE_GET]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH /api/stores/[store_id]
export async function PATCH( //PATCH es para actualizar el size
  req: Request,
  { params }: { params: { store_id: string; size_id: string } } //params siempre esta presente
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
      return new NextResponse("Missing Size name, is required!", {
        status: 400,
      });
    }

    if (!value) {
      return new NextResponse("Missing Size value,  is required!", {
        status: 400,
      });
    }

    if (!params.size_id) {
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

    const size = await prismadb.size.updateMany({
      where: {
        size_id: params.size_id,
      },
      data: {
        name,
        value,
      },
    });

    return NextResponse.json(size);
  } catch (e) {
    console.log("[SIZE_PATCH]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

//DELETE /api/stores/[store_id]
export async function DELETE( //DELETE es para eliminar el size
  req: Request, //dejarlo siempre, ya que params esta solo en el 2do parametro de la funcion
  { params }: { params: { store_id: string; size_id: string } } //params siempre esta presente
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.size_id) {
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

    const size = await prismadb.size.deleteMany({
      where: {
        size_id: params.size_id,
      },
    });

    return NextResponse.json(size);
  } catch (e) {
    console.log("[SIZE_DELETE]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}
