import { DrawerCreate } from "./createDrawer";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { SellerProps } from "@/app/types/types";
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
  } = useForm<Omit<SellerProps, "id">>({
    defaultValues: {
      name: "",
      contact: 0,
    },
  });

  const onSubmit = (data: Omit<SellerProps, "id">) => {
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
    <DrawerCreate trigger="Crear Vendedor">
      {/* Formulario para crear un vendedor */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Label>Nombre:</Label>
        {errors.name && <span>El nombre es obligatorio</span>}
        <Input type="text" {...register("name", { required: true })} />
        <Label>Contacto:</Label>
        <Input type="number" {...register("contact", { required: true })} />
        {errors.contact && <span>El contacto es obligatorio</span>}
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" type="submit">
              Guardar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </form>
    </DrawerCreate>
  );
}
