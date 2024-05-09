import prismadb from "@/lib/prismadb";
import { CategoryForm } from "./components/category-form";

const CategoryPage = async ({
  params,
}: {
  params: { category_id: string; store_id: string };
}) => {
  const category = await prismadb.category.findUnique({
    where: {
      category_id: params.category_id,
    },
  });

  const billboards = await prismadb.billboard.findMany({
    where: {
      store_id: params.store_id,
    },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm billboards={billboards} initialData={category} />
      </div>
    </div>
  );
};

export default CategoryPage;
