import { format } from "date-fns";

import { ColorsClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { ColorColumn } from "./components/colums";

const ColorsPage = async ({ params }: { params: { store_id: string } }) => {
  const colors = await prismadb.color.findMany({
    where: {
      store_id: params.store_id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedColors: ColorColumn[] = colors.map((color) => ({
    color_id: color.color_id,
    name: color.name,
    value: color.value,
    createdAt: format(color.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorsClient data={formattedColors} />
      </div>
    </div>
  );
};

export default ColorsPage;
