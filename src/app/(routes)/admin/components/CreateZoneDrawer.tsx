import { DrawerCreate } from "./createDrawer";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
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

export default function CreateZoneDrawer() {
  const { createZoneMutation } = useZonesQuery();
  const {
    query: { data: sellers, isLoading },
  } = useSellersQuery();

  const { register, handleSubmit, control } = useForm<Omit<ZoneProps, "id">>({
    defaultValues: {
      names: "",
      userId: 0,
    },
  });

  const onSubmit = (data: Omit<ZoneProps, "id">) => {
    console.log("data", data);
    data.userId = Number(data.userId);
    createZoneMutation.mutateAsync(data, {
      onSuccess: () => {
        toast("Zona creado exitosamente", {
          description: new Date().toLocaleString(),
        });
      },
    });
  };

  if (isLoading) {
    return <p>Cargando user...</p>;
  }

  return (
    <DrawerCreate trigger='asignar Zona'>
      {/* Formulario para crear un user */}
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2'>
        <Label>user:</Label>
        <Controller
          name='userId' // El nombre del campo que registrarás
          control={control} // Viene de useForm()
          rules={{ required: "Debes seleccionar un user" }} // Reglas de validación
          render={({ field }) => (
            <Select
              onValueChange={field.onChange} // Vincula el cambio de valor del Select con RHF
              defaultValue={field.value.toString()}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Selecciona un user' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>useres</SelectLabel>
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
        <Label>Nombre:</Label>
        <Input type='text' {...register("names", { required: true })} />
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
