"use client";

import { useRouter, useParams } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { ProductColumn, columns } from "./colums";
interface ProductClientProps {
  data: ProductColumn[];
}
export const ProductClient: React.FC<ProductClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Productos (${data.length})`}
          description="Gestiona productos para tu tienda"
        />
        <Button
          className="dark:bg-emerald-500 dark:hover:bg-[#ADD8E6] border-2 dark:border-[#FFFFFF] dark:hover:border-[#FFD700] transition duration-300 ease-in-out dark:hover:text-white
        
        bg-emerald-500 hover:bg-[#ADD8E6] border-[#252440] hover:border-[#FFD700]  hover:text-[#252440]
        "
          onClick={() => router.push(`/${params.store_id}/products/new`)}
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="Llamadas al API de productos" />
      <Separator />
      <ApiList entityName="products" entityIdName="product_id" />
    </>
  );
};
