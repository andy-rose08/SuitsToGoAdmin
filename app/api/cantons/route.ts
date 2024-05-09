import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

interface CantonsResponse {
  cantons: {
    canton_id: string;
    name: string;
  }[];
}
export async function GET(req: Request) {
  const url = new URL(req.url || "", `http://${req.headers.get("host")}`);
  const province_id = url.searchParams.get("province_id");
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    let cantons: CantonsResponse["cantons"];

    if (province_id) {
      // Fetch the cantons based on the districtId

      const province = await prismadb.province.findUnique({
        where: {
          province_id,
        },

        include: {
          cantons: {
            select: {
              canton_id: true,

              name: true,
            },
          },
        },
      });

      if (province) {
        cantons = province.cantons;
      } else {
        throw new Error("Cantons not found for the specified province");
      }
    } else {
      // If no districtId is provided, return all the cantons

      cantons = await prismadb.canton.findMany();
    }

    return new NextResponse(JSON.stringify(cantons), {
      status: 200,

      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[CANTONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
