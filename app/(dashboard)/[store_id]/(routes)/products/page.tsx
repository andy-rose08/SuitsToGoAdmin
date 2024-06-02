import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";

import { ProductClient } from "./components/client";
import { ProductColumn } from "./components/colums";

const ProductsPage = async ({ params }: { params: { store_id: string } }) => {

  const products = await prismadb.product.findMany({
    where: {
      store_id: params.store_id,
    },
    include: {
      //las relaciones de los modelos, en forma de un objeto
      category: true,
      size: true,
      color: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts: ProductColumn[] = products.map((product) => ({
    product_id: product.product_id,
    name: product.name,
    isFeatured: product.isFeatured ? "Si": "No",
    isArchived: product.isArchived ? "Si": "No",
    price: formatter.format(product.price),
    category: product.category.name,
    quantity: product.quantity,
    size: product.size.name,
    color: product.color.value,
    createdAt: format(product.createdAt, "MMMM dd, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;
