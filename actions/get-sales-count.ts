import prismadb from "@/lib/prismadb";

export const getSalesCount = async (store_id: string) => {
  const salesCount = await prismadb.order.count({
    where: {
      store_id,
      isPaid: true,
    },
  });

  return salesCount;
};
