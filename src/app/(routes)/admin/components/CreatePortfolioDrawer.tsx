"use client";

import React, { useState } from "react";
import { usePortfolioQuery } from "@/app/querys/usePortfolio.query";
import { PortFolioProps } from "@/app/types/types";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DrawerCreate } from "./createDrawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export default function CreatePortfolioDrawer() {
  const { createPortfolioMutation } = usePortfolioQuery();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Omit<PortFolioProps, "id">>({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: Omit<PortFolioProps, "id">) => {
    try {
      await createPortfolioMutation.mutateAsync(data, {
        onSuccess: () => {
          toast.success("Portafolio creado exitosamente", {
            description: new Date().toLocaleString(),
          });
          reset();
          setOpen(false);
        },
        onError: (error) => {
          toast.error("Error al crear el portafolio", {
            description: error.message,
          });
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DrawerCreate trigger="Crear Portafolio" open={open} onOpenChange={setOpen}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-1 py-1 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-neutral-600">
              Nombre del Portafolio
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej. Distribución Oriente"
              className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-xs shadow-xs"
              {...register("name", { required: "El nombre es obligatorio" })}
            />
            {errors.name && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>
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
            {isSubmitting ? <Spinner className="h-4 w-4" /> : "Guardar Portafolio"}
          </Button>
        </div>
      </form>
    </DrawerCreate>
  );
}
