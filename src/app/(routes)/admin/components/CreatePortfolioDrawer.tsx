"use client";
import { usePortfolioQuery } from "@/app/querys/usePortfolio.query";
import { PortFolioProps } from "@/app/types/types";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DrawerCreate } from "./createDrawer";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CreatePortfolioDrawer() {
  const { createPortfolioMutation } = usePortfolioQuery();
  const { register, handleSubmit, reset } = useForm<Omit<PortFolioProps, "id">>({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: Omit<PortFolioProps, "id">) => {
    createPortfolioMutation.mutateAsync(data, {
      onSuccess: () => {
        toast.success("Portafolio creado exitosamente", {
          description: new Date().toLocaleString(),
        });
        reset();
      },
      onError: (error) => {
        toast.error("Error al crear el portafolio", {
          description: error.message,
        });
      }
    });
  };

  return (
    <DrawerCreate trigger="Crear Portafolio">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-sm font-medium text-neutral-700">
            Nombre del Portafolio
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Ej. Distribución Oriente"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
            {...register("name", { required: "El nombre es obligatorio" })}
          />
        </div>
        <DrawerFooter className="px-0 pt-4">
          <DrawerClose asChild>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all duration-200"
              type="submit"
            >
              Guardar Portafolio
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </form>
    </DrawerCreate>
  );
}
