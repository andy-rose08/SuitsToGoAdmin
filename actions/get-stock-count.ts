import prismadb from "@/lib/prismadb";

export const getStockCount = async (store_id: string) => {
  const stockCount = await prismadb.product.count({
    where: {
      store_id,
      isArchived: false,
    },
  });

  return stockCount;
};
