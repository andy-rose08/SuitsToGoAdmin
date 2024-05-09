"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Size } from "@prisma/client";

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



interface SizeFormProps {
  initialData: Size | null;
}

const formSchema = z.object({
  name: z.string().nonempty("Name is required"),
  value: z.string().nonempty("Value is required"),
});

type SizeFormValues = z.infer<typeof formSchema>;

export const SizeForm: React.FC<SizeFormProps> = ({ initialData }) => {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const title = initialData ? "Edit Size" : "Create Size";
  const description = initialData ? "Edit Size" : "Add a new Size";
  const toastMessage = initialData ? "Size updated" : "Size created";
  const action = initialData ? "Save Changes" : "Create";

  const form = useForm<SizeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      value: "",
    },
  });

  const onSubmit = async (values: SizeFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        router.refresh();

        await axios.patch(
          `/api/${params.store_id}/sizes/${params.size_id}`, //api/[store_id]/sizes/[size_id]
          values
        );
      } else {
        router.refresh();
        await axios.post(`/api/${params.store_id}/sizes`, values);
      }
      router.refresh();
      router.push(`/${params.store_id}/sizes`);
      toast.success(toastMessage);
    } catch (e) {
      toast.error("Something went wrong, try again!");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.store_id}/sizes/${params.size_id}`);
      router.refresh();
      router.push(`/${params.store_id}/sizes`);
      router.refresh();
      toast.success("Size deleted");
    } catch (error) {
      toast.error(
        "Something went wrong, make sure you removed all products using this size first!"
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
      <div className="flex flex-col md:flex-row items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full md:w-1/2 mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#252440] dark:text-white">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="dark:bg-[#0D1A26] dark:border-white dark:text-white dark:placeholder-gray-500
                      bg-white border-[#252440] text-[#252440]
                      placeholder-gray-500
                      "
                      disabled={loading}
                      placeholder="Size Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#252440] dark:text-white">
                    Value
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="dark:bg-[#0D1A26] dark:border-white dark:text-white dark:placeholder-gray-500
                      bg-white border-[#252440] text-[#252440]
                      placeholder-gray-500
                      "
                      disabled={loading}
                      placeholder="Value"
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
