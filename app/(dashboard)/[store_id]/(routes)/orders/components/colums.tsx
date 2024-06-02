"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type OrderColumn = {
  order_id: string;
  phone: string;
  order_state_id: string;
  address: string;
  isPaid: string;
  totalPrice: string;
  products: string;
  createdAt: string;
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "order_id",
    header: "ID",
  },
  {
    accessorKey: "products",
    header: "Productos",
  },
  {
    accessorKey: "order_state_id",
    header: "Estado",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
  {
    accessorKey: "address",
    header: "Dirección",
  },
  {
    accessorKey: "totalPrice",
    header: "Precio Total",
  },
  {
    accessorKey: "isPaid",
    header: "Pagado",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />, //tansack react table to access the original object on the table
  },
];
