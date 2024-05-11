"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Billboard } from "@prisma/client";

import { Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";

import ImageUpload from "@/components/ui/image-upload";

interface BillboardFormProps {
  initialData: Billboard | null;
}

const formSchema = z.object({
  label: z.string().nonempty("Nombre es requerido"),
  imageUrl: z.string().nonempty("Imagen es requerida"),
});

type BillboardFormValues = z.infer<typeof formSchema>;

export const BillboardForm: React.FC<BillboardFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const title = initialData ? "Editar Cartelera" : "Agregar Cartelera";
  const description = initialData
    ? "Editar Cartelera"
    : "Agregar una nueva Cartelera";
  const toastMessage = initialData
    ? "Cartelera actualizada"
    : "Cartelera creada";
  const action = initialData ? "Guardar Cambios" : "Agregar";

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (values: BillboardFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        router.refresh();

        await axios.patch(
          `/api/${params.store_id}/billboards/${params.billboard_id}`, //api/[store_id]/billboards/[billboard_id]
          values
        );
      } else {
        router.refresh();
        await axios.post(`/api/${params.store_id}/billboards`, values);
      }
      router.refresh();
      router.push(`/${params.store_id}/billboards`);
      toast.success(toastMessage);
    } catch (e) {
      toast.error("Algo salió mal, intente nuevamente!");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.store_id}/billboards/${params.billboard_id}`
      );
      router.refresh();
      router.push(`/${params.store_id}/billboards`);
      router.refresh();
      toast.success("Cartelera eliminada");
    } catch (error) {
      toast.error(
        "Algo salió mal. Asegúrate de eliminar primero todas las categorías que utilizan esta cartelera!"
      );
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
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-grow mb-4 md:mb-0 md:mr-auto md:ml-0">
          {" "}
          {/* Cambio en las clases */}
          <Heading title={title} description={description} />
        </div>
        {initialData && (
          <div className="md:ml-4">
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

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full md:w-1/2 mx-auto"
        >
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#252440] dark:text-white">
                  Imagen de fondo
                </FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={loading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#252440] dark:text-white">
                    Nombre
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="dark:bg-[#0D1A26] dark:border-white dark:text-white dark:placeholder-gray-500
                      bg-white border-[#252440] text-[#252440]
                      placeholder-gray-500
                      "
                      disabled={loading}
                      placeholder="Nombre de la cartelera"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
