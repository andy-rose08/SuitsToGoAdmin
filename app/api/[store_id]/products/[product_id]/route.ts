import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { product_id: string } }
) {
  //GET es para obtener el product por su id
  try {
    if (!params.product_id) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        product_id: params.product_id,
      },
      include: {
        images: true,
        category: true,
        size: true,
        color: true,
      },
    });

    return NextResponse.json(product);
  } catch (e) {
    console.log("[PRODUCT_GET]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH /api/stores/[store_id]
export async function PATCH( //PATCH es para actualizar el product
  req: Request,
  { params }: { params: { store_id: string; product_id: string } } //params siempre esta presente
) {
  //api/[store_id]/products/[product_id]
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      price,
      category_id,
      color_id,
      size_id,
      images,
      isFeatured,
      isArchived,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Missing required name", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Missing required price", { status: 400 });
    }

    if (!category_id) {
      return new NextResponse("Missing required category id", { status: 400 });
    }

    if (!size_id) {
      return new NextResponse("Missing required size id", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Missing required images", { status: 400 });
    }

    if (!color_id) {
      return new NextResponse("Missing required color id", { status: 400 });
    }

    if (!params.product_id) {
      return new NextResponse("Product ID is required", { status: 400 });
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

    await prismadb.product.update({
      where: {
        product_id: params.product_id,
      },
      data: {
        name,
        price,
        category_id,
        color_id,
        size_id,
        images: {
          deleteMany: {},
        },
        isFeatured,
        isArchived,
      },
    });

    const product = await prismadb.product.update({
      where: {
        product_id: params.product_id,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (e) {
    console.log("[PRODUCT_PATCH]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

//DELETE /api/stores/[store_id]
export async function DELETE( //DELETE es para eliminar el product
  req: Request, //dejarlo siempre, ya que params esta solo en el 2do parametro de la funcion
  { params }: { params: { store_id: string; product_id: string } } //params siempre esta presente
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.product_id) {
      return new NextResponse("Product ID is required", { status: 400 });
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

    const product = await prismadb.product.deleteMany({
      where: {
        product_id: params.product_id,
      },
    });

    return NextResponse.json(product);
  } catch (e) {
    console.log("[PRODUCT_DELETE]", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}
