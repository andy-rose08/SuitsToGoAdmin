"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DataTable } from "@/components/ui/data-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";
import { OrderItemColumn, columns } from "./colums";
import { Order, OrderState } from "@prisma/client";
import { Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

interface OrderFormProps {
  data: Order;
  states: OrderState[];
}

const formSchema = z.object({
  userId: z.string().nonempty("ID del usuario de la orden es requerido"),
  order_state_id: z.string().nonempty("Estado de la orden es requerido"),
  isPaid: z.boolean(),
  phone: z.string().nonempty("Telefono es requerido"),
  address: z.string().nonempty("Direccion es requerido")
});

type OrderFormValues = z.infer<typeof formSchema>;

export const OrderForm: React.FC<OrderFormProps> = ({ data, states }) => {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: data
  });

  const formattedProducts: OrderItemColumn[] = data.orderItems.map((item) => ({
    product: `Nombre: ${item.product.name} Color: ${item.product.color.name} Talla: ${item.product.size.name}`,
    unit_price: item.product.price,
    quantity: item.quantity,
    subtotal: item.quantity * Number(item.product.price)
  }));

  const totalPrice = data.orderItems.reduce((total, item) => {
    return total + (Number(item.product.price) * item.quantity);
  }, 0);

  const onSubmit = async (values: OrderFormValues) => {
    try {
      setLoading(true);
      if (values) {
        router.refresh();
        await axios.patch(
          `/api/${params.store_id}/orders/${params.order_id}`, //api/[store_id]/orders/[order_id]
          values
        );
      }
      router.refresh();
      router.push(`/${params.store_id}/orders`);
      router.refresh();
      toast.success("Pedido actualizado");
    } catch (e) {
      toast.error("Algo salió mal, intente nuevamente!");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.store_id}/orders/${params.order_id}`);
      router.refresh();
      router.push(`/${params.store_id}/orders`);
      router.refresh();
      toast.success("Pedido eliminado");
    } catch (error) {
      toast.error("Algo salió mal");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex flex-col md:flex-row items-center justify-between">
        <Heading title={"Editar pedido"}/>
        {data && (
          <div className="mt-4">
            <Button
              disabled={loading}
              variant="destructive"
              size="icon"
              onClick={() => setOpen(true)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <Separator />
      <div>
        <p>{ "ID pedido: " + data.order_id}</p>
        <p>{ "ID usuario: " + data.userId}</p>
        <p>{ "Total: " +  totalPrice}</p>
      </div>
      <div>
          {data.orderItems.length > 0 && (
            <DataTable columns={columns} data={formattedProducts} />
          )}
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full md:w-1/2 mx-auto"
        >
          <div className="grid grid-cols-1 gap-8">
          <FormField
              control={form.control}
              name="order_state_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#252440] dark:text-white">
                    Estado del Pedido
                  </FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="placeholder-gray-500 dark:text-white
                      text-[#252440] border border-[#252440] dark:border-white dark:bg-[#0D1A26] text-start"
                      >
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Selecciona un estado"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-[#0D1A26] dark:border-white dark:text-white">
                      {states.map((state) => (
                        <SelectItem
                          className="dark:hover:bg-gray-700
                          dark:hover:text-white
                          dark:focus:bg-gray-700
                          dark:focus:text-white"
                          key={state.order_state_id}
                          value={state.order_state_id}
                        >
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#252440] dark:text-white">
                    Telefono
                  </FormLabel>
                  <FormControl>
                    <Input
                        className="dark:bg-[#0D1A26] dark:border-white dark:text-white dark:placeholder-gray-500
                        bg-white border-[#252440] text-[#252440]
                        placeholder-gray-500
                        "
                        disabled={loading}
                        placeholder="Telefono"
                        {...field}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#252440] dark:text-white">
                    Direccion
                  </FormLabel>
                  <FormControl>
                    <Input
                        className="dark:bg-[#0D1A26] dark:border-white dark:text-white dark:placeholder-gray-500
                        bg-white border-[#252440] text-[#252440]
                        placeholder-gray-500
                        "
                        disabled={loading}
                        placeholder="Direccion"
                        {...field}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem
                  className="flex flex-row items-start space-x-3 space-y-0
              rounded-md border p-4
              "
                >
                  <FormControl>
                    <Checkbox
                      className="border dark:border-white border-[#252440]"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-[#252440] dark:text-white">
                      Pagado
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={loading}
            className="ml-auto 
          border-2 bg-[#FFD700] hover:bg-[#ADD8E6] border-[#252440] hover:border-[#FFD700] hover:text-[#252440]

          dark:bg-[#FFD700] dark:hover:bg-[#ADD8E6] dark:border-[#FFFFFF] dark:hover:border-[#FFD700] transition duration-300 ease-in-out dark:hover:text-black"
            type="submit"
          >
            {"Guardar cambios"}
          </Button>
        </form>
      </Form>
    </>
  );
};
