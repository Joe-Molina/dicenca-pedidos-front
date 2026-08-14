import React, { useState } from "react";
import { DrawerCreate } from "./createDrawer";
import { DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { ZoneProps } from "@/app/types/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useZonesQuery } from "@/app/querys/useZones.query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSellersQuery } from "@/app/querys/useSellers.query";
import { Spinner } from "@/components/ui/spinner";

export default function CreateZoneDrawer() {
  const { createZoneMutation } = useZonesQuery();
  const {
    query: { data: sellers, isLoading },
  } = useSellersQuery();

  // Controlamos la apertura del cajón
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Omit<ZoneProps, "id">>({
    defaultValues: {
      names: "",
      userId: 0,
    },
  });

  // Envío del formulario de creación de zona
  const onSubmit = async (data: Omit<ZoneProps, "id">) => {
    data.userId = Number(data.userId);
    try {
      await createZoneMutation.mutateAsync(data, {
        onSuccess: () => {
          toast.success("Zona creada exitosamente", {
            description: new Date().toLocaleString(),
          });
          reset(); // Limpia los inputs del formulario
          setOpen(false); // Cierra el cajón solo si se crea con éxito
        },
        onError: (err) => {
          toast.error("Error al crear la zona", {
            description: err.message,
          });
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <DrawerCreate trigger="Crear Zona" open={open} onOpenChange={setOpen}>
      {/* Formulario para registrar una zona */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 py-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="userId" className="text-xs font-semibold text-neutral-600">
            Vendedor Asignado
          </Label>
          <Controller
            name="userId"
            control={control}
            rules={{ required: "Debes seleccionar un vendedor" }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ? field.value.toString() : undefined}
              >
                <SelectTrigger className="w-full border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-xs text-sm">
                  <SelectValue placeholder="Selecciona un vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Vendedores</SelectLabel>
                    {sellers &&
                      sellers.map((seller) => (
                        <SelectItem key={seller.id} value={seller.id.toString()}>
                          {seller.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.userId && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.userId.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="names" className="text-xs font-semibold text-neutral-600">
            Nombre de la Zona
          </Label>
          <Input
            id="names"
            type="text"
            placeholder="Ej. Barcelona Centro"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm shadow-xs"
            {...register("names", { required: "El nombre de la zona es obligatorio" })}
          />
          {errors.names && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.names.message}</span>
          )}
        </div>

        <DrawerFooter className="px-0 pt-4">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all duration-200 rounded-xl text-xs h-10"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner className="h-4 w-4" /> : "Guardar Zona"}
          </Button>
        </DrawerFooter>
      </form>
    </DrawerCreate>
  );
}
