"use client";

import React, { useState } from "react";
import { useClientsQuery } from "@/app/querys/useClients.query";
import { ClientProps } from "@/app/types/types";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DrawerCreate } from "./createDrawer";
import { DrawerFooter } from "@/components/ui/drawer";
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
import { useZonesQuery } from "@/app/querys/useZones.query";
import { Spinner } from "@/components/ui/spinner";

interface ClientFormValues {
  company_name: string;
  name: string;
  rif: string;
  address: string;
  cod_sunagro?: string;
  contact?: string;
  zoneId: string;
}

export default function CreateClientDrawer() {
  const { createClientMutation } = useClientsQuery();
  const {
    query: { data: zones },
  } = useZonesQuery();

  // Controlamos la apertura del cajón
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    defaultValues: {
      address: "",
      cod_sunagro: "",
      contact: "",
      rif: "",
      zoneId: "",
      company_name: "",
      name: "",
    },
  });

  // Envío del formulario de creación de cliente
  const onSubmit = async (data: ClientFormValues) => {
    const payload: Omit<ClientProps, "id"> = {
      name: data.name,
      company_name: data.company_name,
      address: data.address,
      rif: data.rif,
      cod_sunagro: Number(data.cod_sunagro) || 0,
      contact: data.contact ? String(data.contact).trim() : "",
      zoneId: Number(data.zoneId),
    };

    try {
      await createClientMutation.mutateAsync(payload, {
        onSuccess: () => {
          toast.success("Cliente creado exitosamente", {
            description: new Date().toLocaleString(),
          });
          reset(); // Limpia los inputs del formulario
          setOpen(false); // Cierra el cajón solo si se crea con éxito
        },
        onError: (err) => {
          toast.error("Error al crear el cliente", {
            description: err.message,
          });
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DrawerCreate trigger="Crear Cliente" open={open} onOpenChange={setOpen}>
      {/* Formulario para registrar un cliente */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 py-3 overflow-y-auto max-h-[75vh]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company_name" className="text-xs font-semibold text-neutral-600">
            Razón Social (Empresa)
          </Label>
          <Input
            id="company_name"
            type="text"
            placeholder="Ej. Distribuidora Dicenca C.A."
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm shadow-xs"
            {...register("company_name", { required: "La razón social es obligatoria" })}
          />
          {errors.company_name && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.company_name.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-xs font-semibold text-neutral-600">
            Encargado / Dueño
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Ej. Jefferson Molina"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm shadow-xs"
            {...register("name", { required: "El nombre del encargado es obligatorio" })}
          />
          {errors.name && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address" className="text-xs font-semibold text-neutral-600">
            Dirección de Despacho
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Ej. Av. Principal Local 10"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm shadow-xs"
            {...register("address", { required: "La dirección es obligatoria" })}
          />
          {errors.address && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.address.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cod_sunagro" className="text-xs font-semibold text-neutral-600">
            Código Sunagro
          </Label>
          <Input
            id="cod_sunagro"
            type="text"
            inputMode="numeric"
            placeholder="Ej. 1002345"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-sm shadow-xs"
            {...register("cod_sunagro", { required: "El código Sunagro es obligatorio" })}
          />
          {errors.cod_sunagro && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.cod_sunagro.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact" className="text-xs font-semibold text-neutral-600">
            Teléfono de Contacto (11 dígitos, inicia con 0)
          </Label>
          <Input
            id="contact"
            type="tel"
            inputMode="tel"
            maxLength={11}
            placeholder="Ej. 04121234567"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-sm shadow-xs"
            {...register("contact")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rif" className="text-xs font-semibold text-neutral-600">
            RIF
          </Label>
          <Input
            id="rif"
            type="text"
            placeholder="Ej. J-12345678-9"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm shadow-xs font-mono"
            {...register("rif", { required: "El RIF es obligatorio" })}
          />
          {errors.rif && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.rif.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="zoneId" className="text-xs font-semibold text-neutral-600">
            Zona de Despacho
          </Label>
          <Controller
            name="zoneId"
            control={control}
            rules={{ required: "Debes seleccionar una zona" }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ? field.value.toString() : undefined}
              >
                <SelectTrigger className="w-full border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-xs text-sm">
                  <SelectValue placeholder="Selecciona una zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Zonas</SelectLabel>
                    {zones &&
                      zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          {zone.names}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.zoneId && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.zoneId.message}</span>
          )}
        </div>

        <DrawerFooter className="px-0 pt-4">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all duration-200 rounded-xl text-xs h-10"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner className="h-4 w-4" /> : "Guardar Cliente"}
          </Button>
        </DrawerFooter>
      </form>
    </DrawerCreate>
  );
}
