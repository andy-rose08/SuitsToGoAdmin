"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Product, Image, Category, Size, Color } from "@prisma/client";

import { Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";

import ImageUpload from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductFormProps {
  initialData:
    | (Product & {
        images: Image[];
      })
    | null;
  categories: Category[];
  colors: Color[];
  sizes: Size[];
}

const formSchema = z.object({
  name: z.string().nonempty("Name is required"),
  images: z
    .object({
      url: z.string(),
    })
    .array(),
  price: z.coerce.number().min(1),
  category_id: z.string().nonempty("Category is required"),
  color_id: z.string().nonempty("Color is required"),
  size_id: z.string().nonempty("Size is required"),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  colors,
  sizes,
}) => {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const title = initialData ? "Edit Product" : "Create Product";
  const description = initialData ? "Edit Product" : "Add a new Product";
  const toastMessage = initialData ? "Product updated" : "Product created";
  const action = initialData ? "Save Changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          price: initialData?.price,
        }
      : {
          name: "",
          images: [],
          price: 0,
          category_id: "",
          color_id: "",
          size_id: "",
          isFeatured: false,
          isArchived: false,
        },
  });

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        router.refresh();

        await axios.patch(
          `/api/${params.store_id}/products/${params.product_id}`, //api/[store_id]/products/[product_id]
          values
        );
      } else {
        router.refresh();
        await axios.post(`/api/${params.store_id}/products`, values);
      }
      router.refresh();
      router.push(`/${params.store_id}/products`);
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
      await axios.delete(
        `/api/${params.store_id}/products/${params.product_id}`
      );
      router.refresh();
      router.push(`/${params.store_id}/products`);
      router.refresh();
      toast.success("Product deleted");
    } catch (error) {
      toast.error(
        "Something went wrong, try again! If the problem persists, contact support."
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
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#252440] dark:text-white">
                  Images
                </FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value.map((image) => image.url)}
                    disabled={loading}
                    onChange={(url) =>
                      field.onChange([...field.value, { url }])
                    }
                    onRemove={(url) =>
                      field.onChange([
                        ...field.value.filter((current) => current.url !== url),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                      placeholder="Product Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#252440] dark:text-white">
                    Price
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="[appearance:textfield] dark:bg-[#0D1A26] dark:border-white dark:text-white dark:placeholder-gray-500
                      bg-white border-[#252440] text-[#252440]
                      placeholder-gray-500
                      "
                      disabled={loading}
                      placeholder="$9.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#252440] dark:text-white">
                    Category
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
                          placeholder="Select a Category"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-[#0D1A26] dark:border-white dark:text-white">
                      {categories.map((category) => (
                        <SelectItem
                          className="dark:hover:bg-gray-700
                          dark:hover:text-white
                          dark:focus:bg-gray-700
                          dark:focus:text-white"
                          key={category.category_id}
                          value={category.category_id}
                        >
                          {category.name}
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
              name="size_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#252440] dark:text-white">
                    Size
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
                          placeholder="Select a Size"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-[#0D1A26] dark:border-white dark:text-white">
                      {sizes.map((size) => (
                        <SelectItem
                          className="dark:hover:bg-gray-700
                          dark:hover:text-white
                          dark:focus:bg-gray-700
                          dark:focus:text-white"
                          key={size.size_id}
                          value={size.size_id}
                        >
                          {size.name}
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
              name="color_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#252440] dark:text-white">
                    Color
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
                          placeholder="Select a Color"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-[#0D1A26] dark:border-white dark:text-white">
                      {colors.map((color) => (
                        <SelectItem
                          className="dark:hover:bg-gray-700
                          dark:hover:text-white
                          dark:focus:bg-gray-700
                          dark:focus:text-white"
                          key={color.color_id}
                          value={color.color_id}
                        >
                          {color.name}
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
              name="isFeatured"
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
                      Featured
                    </FormLabel>
                    <FormDescription>
                      This product will appear on the home page
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isArchived"
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
                      Archived
                    </FormLabel>
                    <FormDescription>
                      This product will not appear anywhere in the store
                    </FormDescription>
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
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
