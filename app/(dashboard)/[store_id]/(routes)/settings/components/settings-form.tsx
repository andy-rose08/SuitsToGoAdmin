"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Store } from "@prisma/client";

import { Trash } from "lucide-react";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { AlertModal } from "@/components/modals/alert-modal";
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";

interface SettingsFormProps {
  initialData: Store;
}

const formSchema = z.object({
  store_name: z.string().nonempty("Nombre es requerido"),
  // address: z
  //   .string()
  //   .refine((value) => value.trim() !== "", "Address is required!"),
  // province_id: z.string().nonempty("Province is required"),
  // canton_id: z.string().nonempty("Canton is required"),
  // district_id: z.string().nonempty("District is required"),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.store_id}`, values);
      router.refresh();
      toast.success("Tienda actualizada exitosamente!");
    } catch (e) {
      toast.error("Algo salió mal, intente nuevamente!");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.store_id}`);
      router.refresh();
      router.push("/");
    } catch (error) {
      toast.error(
        "Algo salió mal. ¡Asegúrate de eliminar todos los productos y categorías primero!"
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
      <div className="flex items-center justify-between">
        <Heading title="Ajustes" description="Administrar las preferencias de la tienda" />
        <Button
          disabled={loading}
          variant="destructive"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="store_name"
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
                      placeholder="Nombre de la tienda"
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
            Guardar cambios
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        description={`${useOrigin()}/api/stores/${params.store_id}`}
        variant="public"
      />
    </>
  );
};
