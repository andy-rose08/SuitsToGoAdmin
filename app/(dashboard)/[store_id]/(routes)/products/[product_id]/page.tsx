import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params,
}: {
  params: { product_id: string; store_id: string };
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      product_id: params.product_id,
    },
    include: {
      images: true, //el objeto de images
    },
  });

  const categories = await prismadb.category.findMany({
    where: {
      store_id: params.store_id,
    },
  });
  const sizes = await prismadb.size.findMany({
    where: {
      store_id: params.store_id,
    },
  });

  const colors = await prismadb.color.findMany({
    where: {
      store_id: params.store_id,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          categories={categories}
          colors={colors}
          sizes={sizes}
          initialData={product}
        />
      </div>
    </div>
  );
};

export default ProductPage;
