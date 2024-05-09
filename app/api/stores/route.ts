import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    const body = await req.json();
    const { store_name, province_id, canton_id, district_id, address } = body;

    if (!userId) {
      console.log("Unauthorized");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!store_name) {
      return new NextResponse("Missing required store_name", { status: 400 });
    }

    if (!address) {
      return new NextResponse("Missing required address", { status: 400 });
    }

    if (!province_id) {
      return new NextResponse("Missing required province_id", { status: 400 });
    }
    if (!canton_id) {
      return new NextResponse("Missing required canton_id", { status: 400 });
    }
    if (!district_id) {
      return new NextResponse("Missing required district_id", { status: 400 });
    }

    // Create the store
    const createdStore = await prismadb.store.create({
      data: {
        store_name,
        userId,
      },
    });

    // Create the location associated with the store
    const createdLocation = await prismadb.location.create({
      data: {
        address,
        province_id,
        canton_id,
        district_id,
        stores: {
          connect: {
            store_id: createdStore.store_id,
          },
        },
      },
    });

    return NextResponse.json(createdStore);
  } catch (error) {
    console.log("[STORES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
