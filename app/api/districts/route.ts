import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

interface DistrictsResponse {
  districts: {
    district_id: string;
    name: string;
  }[];
}
export async function GET(req: Request) {
  const url = new URL(req.url || "", `http://${req.headers.get("host")}`);
  const canton_id = url.searchParams.get("canton_id");
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    let districts: DistrictsResponse["districts"];

    if (canton_id) {
      // Fetch the cantons based on the districtId

      const canton = await prismadb.canton.findUnique({
        where: {
          canton_id,
        },

        include: {
          districts: {
            select: {
              district_id: true,

              name: true,
            },
          },
        },
      });

      if (canton) {
        districts = canton.districts;
      } else {
        throw new Error("Cantons not found for the specified province");
      }
    } else {
      // If no districtId is provided, return all the cantons

      districts = await prismadb.district.findMany();
    }

    return new NextResponse(JSON.stringify(districts), {
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
