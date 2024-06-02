"use client";

import { ColumnDef } from "@tanstack/react-table";;

export type OrderItemColumn = {
  product: string;
  unit_price: string;
  quantity: number;
  subtotal: number;
};

export const columns: ColumnDef<OrderItemColumn>[] = [
  {
    accessorKey: "product",
    header: "Producto",
  },
  {
    accessorKey: "unit_price",
    header: "Precio",
  },
  {
    accessorKey: "quantity",
    header: "Cantidad",
  },
  {
    accessorKey: "subtotal",
    header: "Subtotal",
  },
];
