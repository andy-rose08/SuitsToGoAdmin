import { format } from "date-fns";

import { SizesClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { SizeColumn } from "./components/colums";

const SizesPage = async ({ params }: { params: { store_id: string } }) => {
  const sizes = await prismadb.size.findMany({
    where: {
      store_id: params.store_id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedSizes: SizeColumn[] = sizes.map((size) => ({
    size_id: size.size_id,
    name: size.name,
    value: size.value,
    createdAt: format(size.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizesClient data={formattedSizes} />
      </div>
    </div>
  );
};

export default SizesPage;
