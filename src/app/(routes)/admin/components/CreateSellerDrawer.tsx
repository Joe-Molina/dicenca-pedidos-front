import { DrawerCreate } from "./createDrawer";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { UserProps } from "@/app/types/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSellersQuery } from "@/app/querys/useSellers.query";
import { toast } from "sonner";

export default function CreateSellerDrawer() {
  const { createSellerMutation } = useSellersQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<UserProps, "id" | "role">>({
    defaultValues: {
      username: "",
      password: "",
      name: "",
      lastname: "",
      email: "",
    },
  });

  const onSubmit = (data: Omit<UserProps, "id" | "role">) => {
    console.log("data", data);
    createSellerMutation.mutateAsync(data, {
      onSuccess: () => {
        toast("Vendedor creado exitosamente", {
          description: new Date().toLocaleString(),
        });
      },
    });
  };

  return (
    <DrawerCreate trigger='Crear Vendedor'>
      {/* Formulario para crear un vendedor */}
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2'>
        <Label>Nombre</Label>
        {errors.name && <span>El nombre es obligatorio</span>}
        <Input type='text' {...register("name", { required: true })} />
        <Label>Apellido</Label>
        <Input type='text' {...register("lastname", { required: true })} />
        <Label>Usuario</Label>
        <Input type='text' {...register("username", { required: true })} />
        <Label>Email</Label>
        <Input type='email' {...register("email", { required: true })} />
        <Label>Contraseña</Label>
        <Input type='password' {...register("password", { required: true })} />
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
