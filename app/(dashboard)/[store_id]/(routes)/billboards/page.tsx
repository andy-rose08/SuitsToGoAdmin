import { format } from "date-fns";

import { BillboardClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { BillBoardColumn } from "./components/colums";

const BillboardsPage = async ({ params }: { params: { store_id: string } }) => {
  const billboards = await prismadb.billboard.findMany({
    where: {
      store_id: params.store_id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedBillboards: BillBoardColumn[] = billboards.map(
    (billboard) => ({
      id: billboard.id,
      label: billboard.label,
      createdAt: format(billboard.createdAt, "MMMM do, yyyy"),
    })
  );

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient data={formattedBillboards} />
      </div>
    </div>
  );
};

export default BillboardsPage;
