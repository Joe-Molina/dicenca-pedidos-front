"use client";

import React, { useState } from "react";
import { useProductQuery } from "@/app/querys/useProduct.query";
import { usePortfolioQuery } from "@/app/querys/usePortfolio.query";
import { ProductProps } from "@/app/types/types";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DrawerCreate } from "./createDrawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
  const {
    query: { data: portfolios, isLoading: portfoliosLoading },
  } = usePortfolioQuery();

  // Controlamos la apertura del cajón
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Omit<ProductProps, "id">>({
    defaultValues: {
      name: "",
      gr: 0,
      price: 0,
      stock: 0,
      portafolioId: 0,
    },
  });

  const onSubmit = async (data: Omit<ProductProps, "id">) => {
    // Coerce values to numbers
    const payload = {
      ...data,
      gr: Number(data.gr),
      price: Number(data.price),
      stock: Number(data.stock) >= 0 ? Number(data.stock) : 0,
      portafolioId: Number(data.portafolioId),
    };

    if (!payload.portafolioId) {
      toast.error("Debes seleccionar un portafolio");
      return;
    }

    if (payload.stock < 0) {
      toast.error("La cantidad en inventario no puede ser negativa");
      return;
    }

    try {
      await createProductMutation.mutateAsync(payload, {
        onSuccess: () => {
          toast.success("Producto creado exitosamente", {
            description: new Date().toLocaleString(),
          });
          reset();
          setOpen(false);
        },
        onError: (error) => {
          toast.error("Error al crear el producto", {
            description: error.message,
          });
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DrawerCreate trigger="Crear Producto" open={open} onOpenChange={setOpen}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
        {/* Campos del formulario con scroll suave y cuadrícula en PC */}
        <div className="flex-1 overflow-y-auto pr-1 py-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Name Field */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="name" className="text-xs font-semibold text-neutral-600">
              Nombre del Producto
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej. Harina Pan 1kg"
              className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-xs text-xs"
              {...register("name", { required: "El nombre es obligatorio" })}
            />
            {errors.name && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>
            )}
          </div>

          {/* Portfolio Selection Dropdown */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label className="text-xs font-semibold text-neutral-600">Portafolio</Label>
            <Controller
              name="portafolioId"
              control={control}
              rules={{ required: "Debes seleccionar un portafolio" }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ? field.value.toString() : ""}
                >
                  <SelectTrigger className="w-full border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-xs text-xs">
                    <SelectValue
                      placeholder={
                        portfoliosLoading ? "Cargando portafolios..." : "Selecciona un portafolio"
                      }
                    />
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
            {errors.portafolioId && (
              <span className="text-[10px] text-red-500 font-semibold">
                {errors.portafolioId.message}
              </span>
            )}
          </div>

          {/* Weight Field */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="gr" className="text-xs font-semibold text-neutral-600">
              Peso (Gramos)
            </Label>
            <Input
              id="gr"
              type="number"
              placeholder="Ej. 1000"
              className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-xs text-xs"
              {...register("gr", { required: "El peso es obligatorio", min: 0 })}
            />
            {errors.gr && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.gr.message}</span>
            )}
          </div>

          {/* Price Field */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="price" className="text-xs font-semibold text-neutral-600">
              Precio ($)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="Ej. 1.25"
              className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-xs text-xs"
              {...register("price", { required: "El precio es obligatorio", min: 0 })}
            />
            {errors.price && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.price.message}</span>
            )}
          </div>

          {/* Stock / Cantidad Field */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="stock" className="text-xs font-semibold text-neutral-600">
              Cantidad en Inventario (Bultos)
            </Label>
            <Input
              id="stock"
              type="number"
              placeholder="Ej. 50"
              className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-xs text-xs"
              {...register("stock", {
                required: "La cantidad de bultos es obligatoria",
                min: { value: 0, message: "La cantidad de bultos no puede ser negativa" },
              })}
            />
            {errors.stock && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.stock.message}</span>
            )}
          </div>
        </div>

        {/* Botón Guardar abajo fijo y siempre a la vista */}
        <div className="pt-3 pb-1 shrink-0 border-t border-neutral-100 bg-white">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all duration-200 rounded-xl text-xs h-10 cursor-pointer"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner className="h-4 w-4" /> : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </DrawerCreate>
  );
}
