"use client";

import { useStoreModal } from "@/hooks/use-store-modal";
import { Modal } from "@/components/ui/modal";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select";

import {
  FieldValues,
  UseFormReturn,
  FieldPath,
  PathValue,
} from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const formSchema = z.object({
  store_name: z.string().nonempty("Store name is required"),
  address: z
    .string()
    .refine((value) => value.trim() !== "", "Address is required!"),
  province_id: z.string().nonempty("Province is required"),
  canton_id: z.string().nonempty("Canton is required"),
  district_id: z.string().nonempty("District is required"),
});

//METODOS PARA EL JSX

export const StoreModal = () => {
  //hooks al inicio, lo demas es para el jsx
  const storeModal = useStoreModal(); //hook para abrir y cerrar el modal

  const [locationData, setLocationData] = useState<{
    provinces: { province_id: string; name: string }[];

    cantons: { canton_id: string; name: string; province_id: string }[];

    districts: { district_id: string; name: string; canton_id: string }[];
  } | null>(null); //hook para manejar la data de la ubicacion

  const [isLoading, setIsLoading] = useState(true); //hook para manejar el estado de carga del fetching de las provincias, cantones y distritos
  const [loading, setLoading] = useState(false); //hook para manejar el estado de carga al darle al boton de submit
  const [height, setHeight] = useState("auto");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provinceRes, cantonRes, districtRes] = await Promise.all([
          axios.get("/api/provinces"),

          axios.get("/api/cantons"),

          axios.get("/api/districts"),
        ]);

        setLocationData({
          provinces: provinceRes.data,

          cantons: cantonRes.data,

          districts: districtRes.data,
        });
      } catch (error) {
        console.error("Error fetching location data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTextAreaChange =
    (field: any) => (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = event.target.value;
      field.onChange(text); // Actualiza el valor del Textarea siempre
      if (text.replace(/\s/g, "") === "") {
        setHeight("auto"); // Establece la altura a 'auto' cuando el Textarea está vacío
      } else {
        setHeight(`${textareaRef.current!.scrollHeight}px`);
      }
    };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      //valores por defecto
      store_name: "",
      address: "",
      province_id: "",
      canton_id: "",
      district_id: "",
    },
  });

  const province = form.watch("province_id"); //obtiene el valor de la provincia
  const canton = form.watch("canton_id"); //obtiene el valor del canton

  const cantons =
    province &&
    locationData &&
    locationData.provinces.find((p) => p.province_id === province)
      ? locationData.cantons.filter(
          (c) =>
            c.province_id ===
            locationData.provinces.find((p) => p.province_id === province)
              ?.province_id
        )
      : [];

  const districts =
    province && canton && locationData
      ? locationData.districts.filter((d) => d.canton_id === canton)
      : [];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    //maneja el submit del formulario
    try {
      setLoading(true);
      const response = await axios.post("/api/stores", values); //envia los valores del formulario al backend

      window.location.assign(`/${response.data.store_id}`); //refresca la pagina
      //100% se carga en la db, mas que nada para una mejor UX
    } catch (error) {
      toast.error("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange =
    <TFieldValues extends FieldValues>(
      form: UseFormReturn<TFieldValues>,
      field: FieldPath<TFieldValues>
    ) =>
    (value: TFieldValues[FieldPath<TFieldValues>]) => {
      const currentCanton = form.getValues("canton" as FieldPath<TFieldValues>);
      const currentDistrict = form.getValues(
        "district" as FieldPath<TFieldValues>
      );

      if (locationData) {
        const selectedProvince = locationData.provinces.find(
          (p) => p.province_id === value
        );

        if (selectedProvince) {
          const cantonOptions = locationData.cantons.filter(
            (c) => c.province_id === selectedProvince.province_id
          );

          form.setValue(
            "canton" as FieldPath<TFieldValues>,
            "" as PathValue<TFieldValues, FieldPath<TFieldValues>> // Fix: Cast the empty string to the appropriate type
          );
          form.setValue(
            "district" as FieldPath<TFieldValues>,
            "" as PathValue<TFieldValues, FieldPath<TFieldValues>> // Fix: Cast the empty string to the appropriate type
          );
        }
      }

      form.setValue(
        "canton" as FieldPath<TFieldValues>,
        "" as PathValue<TFieldValues, FieldPath<TFieldValues>>
      );
      form.setValue(
        "district" as FieldPath<TFieldValues>,
        "" as PathValue<TFieldValues, FieldPath<TFieldValues>>
      );
      form.setValue(field, value);
    };

  const handleCantonChange =
    <TFieldValues extends FieldValues>(
      form: UseFormReturn<TFieldValues>,
      field: FieldPath<TFieldValues>
    ) =>
    (value: TFieldValues[FieldPath<TFieldValues>]) => {
      if (locationData) {
        const selectedCanton = locationData.cantons.find(
          (c) => c.canton_id === value
        );

        if (selectedCanton) {
          const districtOptions = locationData.districts.filter(
            (d) => d.canton_id === selectedCanton.canton_id
          );

          form.setValue(
            "district" as FieldPath<TFieldValues>,
            "" as PathValue<TFieldValues, FieldPath<TFieldValues>>,
            { shouldValidate: true }
          );
          form.setValue(
            "district" as FieldPath<TFieldValues>,
            districtOptions[0]?.district_id as PathValue<
              TFieldValues,
              FieldPath<TFieldValues>
            >,
            { shouldValidate: true }
          );
        }
      }

      form.setValue(
        "district" as FieldPath<TFieldValues>,
        "" as PathValue<TFieldValues, FieldPath<TFieldValues>>
      );
      form.setValue(field, value);
    };

  return (
    <Modal
      title="Add a new Store"
      description="Add a new store for manage products and categories"
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="store_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      {/*manejo de errores */}
                      <Input
                        disabled={loading || isLoading}
                        className="bg-white 
                        dark:bg-[#0D1A26]
                        dark:text-white
                        border-2 text-[#252440] placeholder-gray-500"
                        placeholder="Store Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage /> {/*muestra los errores */}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Address</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={loading || isLoading}
                        ref={textareaRef}
                        value={field.value}
                        onChange={handleTextAreaChange(field)}
                        style={{ height, maxHeight: "200px" }}
                        className="resize-none 
                        dark:bg-[#0D1A26]
                        dark:text-white
                        bg-white border-2 text-[#252440] placeholder-gray-500"
                        placeholder="Store Address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <Select
                      disabled={loading || isLoading}
                      onValueChange={handleProvinceChange(form, field.name)}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="placeholder-gray-500 dark:text-white
                      text-[#252440] border border-[#252440] dark:border-white dark:bg-[#0D1A26]"
                        >
                          <SelectValue placeholder="Select a province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-[#0D1A26] dark:border-white dark:text-white">
                        {locationData?.provinces.map((province) => (
                          <SelectItem
                            className="dark:hover:bg-gray-700
                          dark:hover:text-white
                          dark:focus:bg-gray-700
                          dark:focus:text-white"
                            key={province.province_id}
                            value={province.province_id} // Use province_id as the value
                          >
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {province && (
                <FormField
                  control={form.control}
                  name="canton_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canton</FormLabel>
                      <Select
                        disabled={loading || isLoading}
                        onValueChange={handleCantonChange(form, field.name)}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="placeholder-gray-500 dark:text-white
                      text-[#252440] border border-[#252440] dark:border-white dark:bg-[#0D1A26]"
                          >
                            <SelectValue placeholder="Select a canton" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-[#0D1A26] dark:border-white dark:text-white">
                          {cantons.map((canton) => (
                            <SelectItem
                              className="dark:hover:bg-gray-700
                          dark:hover:text-white
                          dark:focus:bg-gray-700
                          dark:focus:text-white"
                              key={canton.canton_id}
                              value={canton.canton_id}
                            >
                              {canton.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {canton && (
                <FormField
                  control={form.control}
                  name="district_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select
                        disabled={loading || isLoading}
                        onValueChange={(value) =>
                          form.setValue("district_id", value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger
                            className="placeholder-gray-500 dark:text-white
                      text-[#252440] border border-[#252440] dark:border-white dark:bg-[#0D1A26]"
                          >
                            <SelectValue placeholder="Select a district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-[#0D1A26] dark:border-white dark:text-white">
                          {districts.map((district) => (
                            <SelectItem
                              className="dark:hover:bg-gray-700
                          dark:hover:text-white
                          dark:focus:bg-gray-700
                          dark:focus:text-white"
                              key={district.district_id}
                              value={district.district_id}
                            >
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button
                  disabled={loading || isLoading}
                  className="border-2 border-[#252440] text-[#252440] hover:bg-[#252440] hover:text-white"
                  variant="outline"
                  onClick={storeModal.onClose}
                >
                  Cancel
                </Button>
                <Button
                  disabled={loading || isLoading}
                  className="border-2 text-[#252440] bg-[#FFD700] hover:bg-[#ADD8E6] border-[#252440] hover:border-[#FFD700] transition duration-300 ease-in-out hover:text-[#FFFFFF]"
                  type="submit"
                >
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Modal>
  );
};
