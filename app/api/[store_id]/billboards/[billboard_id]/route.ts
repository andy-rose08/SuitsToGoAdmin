import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";




export async function GET( 
  req: Request, 
  { params }: { params: { billboard_id: string } } 
) {//GET es para obtener el billboard por su id
  try {
    


    if (!params.billboard_id) {
      return new NextResponse("Billboard ID is required", { status: 400 });
    }


    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: params.billboard_id,
      },
    });

    return NextResponse.json(billboard);
  } catch (e) {
    console.log("[BILLBOARD_GET]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH /api/stores/[store_id]
export async function PATCH( //PATCH es para actualizar el billboard
req: Request,
{ params }: { params: { store_id: string; billboard_id: string } } //params siempre esta presente
) {
  //api/[store_id]/billboards/[billboard_id]
  try {
    const { userId } = auth();
    const body = await req.json();

    const { label, imageUrl } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!label) {
      return new NextResponse("Missing Billboard label, is required!", {
        status: 400,
      });
    }

    if (!imageUrl) {
      return new NextResponse("Missing Billboard image URL, is required!", {
        status: 400,
      });
    }

    if (!params.billboard_id) {
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

    const billboard = await prismadb.billboard.updateMany({
      where: {
        id: params.billboard_id,
      },
      data: {
        label,
        imageUrl,
      },
    });

    return NextResponse.json(billboard);
  } catch (e) {
    console.log("[BILLBOARD_PATCH]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

//DELETE /api/stores/[store_id]
export async function DELETE( //DELETE es para eliminar el billboard
  req: Request, //dejarlo siempre, ya que params esta solo en el 2do parametro de la funcion
  { params }: { params: { store_id: string; billboard_id: string } } //params siempre esta presente
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.billboard_id) {
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

    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: params.billboard_id,
      },
    });

    return NextResponse.json(billboard);
  } catch (e) {
    console.log("[BILLBOARD_DELETE]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}
