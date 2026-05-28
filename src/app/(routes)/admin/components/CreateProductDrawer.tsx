"use client";

import { useProductQuery } from "@/app/querys/useProduct.query";
import { usePortfolioQuery } from "@/app/querys/usePortfolio.query";
import { ProductProps } from "@/app/types/types";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DrawerCreate } from "./createDrawer";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateProductDrawer() {
  const { createProductMutation } = useProductQuery();
  const { query: { data: portfolios, isLoading: portfoliosLoading } } = usePortfolioQuery();

  const { register, handleSubmit, control, reset } = useForm<Omit<ProductProps, "id">>({
    defaultValues: {
      name: "",
      gr: 0,
      price: 0,
      portafolioId: 0,
    },
  });

  const onSubmit = (data: Omit<ProductProps, "id">) => {
    // Coerce values to numbers
    const payload = {
      ...data,
      gr: Number(data.gr),
      price: Number(data.price),
      portafolioId: Number(data.portafolioId),
    };

    if (!payload.portafolioId) {
      toast.error("Debes seleccionar un portafolio");
      return;
    }

    createProductMutation.mutateAsync(payload, {
      onSuccess: () => {
        toast.success("Producto creado exitosamente", {
          description: new Date().toLocaleString(),
        });
        reset();
      },
      onError: (error) => {
        toast.error("Error al crear el producto", {
          description: error.message,
        });
      },
    });
  };

  return (
    <DrawerCreate trigger="Crear Producto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
        {/* Name Field */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-sm font-semibold text-neutral-700">
            Nombre del Producto
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Ej. Harina Pan 1kg"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
            {...register("name", { required: "El nombre es obligatorio" })}
          />
        </div>

        {/* Weight Field */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="gr" className="text-sm font-semibold text-neutral-700">
            Peso (Gramos)
          </Label>
          <Input
            id="gr"
            type="number"
            placeholder="Ej. 1000"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
            {...register("gr", { required: "El peso es obligatorio", min: 0 })}
          />
        </div>

        {/* Price Field */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price" className="text-sm font-semibold text-neutral-700">
            Precio ($)
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="Ej. 1.25"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
            {...register("price", { required: "El precio es obligatorio", min: 0 })}
          />
        </div>

        {/* Portfolio Selection Dropdown */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-semibold text-neutral-700">Portafolio</Label>
          <Controller
            name="portafolioId"
            control={control}
            rules={{ required: "Debes seleccionar un portafolio" }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value ? field.value.toString() : ""}
              >
                <SelectTrigger className="w-full border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm">
                  <SelectValue placeholder={portfoliosLoading ? "Cargando portafolios..." : "Selecciona un portafolio"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Portafolios Disponibles</SelectLabel>
                    {portfolios &&
                      portfolios.map((portfolio) => (
                        <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                          {portfolio.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <DrawerFooter className="px-0 pt-4">
          <DrawerClose asChild>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md transition-all duration-200"
              type="submit"
            >
              Guardar Producto
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </form>
    </DrawerCreate>
  );
}
