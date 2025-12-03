"use client";
import { useClientsQuery } from "@/app/querys/useClients.query";
import { ClientProps } from "@/app/types/types";
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
import { useZonesQuery } from "@/app/querys/useZones.query";

export default function CreateClientDrawer() {
  const { createClientMutation } = useClientsQuery();
  const { register, handleSubmit, control } = useForm<Omit<ClientProps, "id">>({
    defaultValues: {
      address: "",
      cod_sunagro: 0,
      contact: 0,
      rif: "",
      zoneId: 0,
      company_name: "",
      name: "",
    },
  });

  const onSubmit = (data: Omit<ClientProps, "id">) => {
    console.log("data", data);
    data.cod_sunagro = Number(data.cod_sunagro);
    data.contact = Number(data.contact);
    data.zoneId = Number(data.zoneId);
    createClientMutation.mutateAsync(data, {
      onSuccess: () => {
        toast("Cliente creado exitosamente", {
          description: new Date().toLocaleString(),
        });
      },
    });
  };

  const {
    query: { data: zones },
  } = useZonesQuery();

  return (
    <DrawerCreate trigger='Crear Cliente'>
      {/*Eto e un formulario pa lo cliente causa*/}
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2'>
        <Label>Razón Social:</Label>
        <Input type='text' {...register("company_name", { required: true })} />
        <Label>Dueño/Encargado:</Label>
        <Input type='text' {...register("name", { required: true })} />
        <Label>Direccion:</Label>
        <Input type='text' {...register("address", { required: true })} />
        <Label>Codigo Sunagro:</Label>
        <Input type='text' {...register("cod_sunagro", { required: true })} />
        <Label>Contacto:</Label>
        <Input type='text' {...register("contact", { required: true })} />{" "}
        <Label>Rif:</Label>
        <Input type='text' {...register("rif", { required: true })} />{" "}
        <Label>Zona:</Label>
        <Controller
          name='zoneId' // El nombre del campo que registrarás
          control={control} // Viene de useForm()
          rules={{ required: "Debes seleccionar un vendedor" }} // Reglas de validación
          render={({ field }) => (
            <Select
              onValueChange={field.onChange} // Vincula el cambio de valor del Select con RHF
              defaultValue={field.value.toString()}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Selecciona un vendedor' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Vendedores</SelectLabel>
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
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant='outline' type='submit'>
              Guardar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </form>
    </DrawerCreate>
  );
}
