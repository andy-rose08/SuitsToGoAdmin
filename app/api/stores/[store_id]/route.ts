import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// PATCH /api/stores/[store_id]
export async function PATCH( //PATCH es para actualizar el store name
  req: Request,
  { params }: { params: { store_id: string } } //params siempre esta presente
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { store_name } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!store_name) {
      return new NextResponse("Missing Store name, is required!", {
        status: 400,
      });
    }

    if (!params.store_id) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prismadb.store.updateMany({
      where: {
        store_id: params.store_id,
        userId,//sea usa Many ya que userId no es unico
      },
      data: {
        store_name,
      },
    });

    return NextResponse.json(store);
  } catch (e) {
    console.log("[STORE_PATCH]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

//DELETE /api/stores/[store_id]
export async function DELETE( //DELETE es para eliminar el store
  req: Request, //dejarlo siempre, ya que params esta solo en el 2do parametro de la funcion
  { params }: { params: { store_id: string } } //params siempre esta presente
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.store_id) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    await prismadb.location.deleteMany({
      where:{
        stores:{
          some:{
            store_id: params.store_id,
            userId
          }
        }
      }
    })
    
    

    const store = await prismadb.store.deleteMany({
      where: {
        store_id: params.store_id,
        userId, //sea usa Many ya que userId no es unico
      },
    });

    return NextResponse.json(store);
  } catch (e) {
    console.log("[STORE_DELETE]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}
