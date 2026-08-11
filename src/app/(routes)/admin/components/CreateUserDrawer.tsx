import React, { useState } from "react";
import { DrawerCreate } from "./createDrawer";
import { DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { UserProps } from "@/app/types/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsersQuery } from "@/app/querys/useUsers.query";
import { toast } from "sonner";
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

export default function CreateUserDrawer() {
  const { createUserMutation } = useUsersQuery();

  // Controlamos la apertura del cajón (drawer)
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Omit<UserProps, "id">>({
    defaultValues: {
      username: "",
      password: "",
      name: "",
      lastname: "",
      email: "",
      role: "seller", // Por defecto Vendedor
    },
  });

  // Envío del formulario de creación de usuario
  const onSubmit = async (data: Omit<UserProps, "id">) => {
    try {
      await createUserMutation.mutateAsync(data, {
        onSuccess: () => {
          toast.success("Usuario creado exitosamente", {
            description: new Date().toLocaleString(),
          });
          reset(); // Limpia los inputs del formulario
          setOpen(false); // Cierra el cajón solo si se crea con éxito
        },
        onError: (err: any) => {
          const errorMsg =
            err.response?.data?.alert ||
            err.response?.data?.error ||
            err.message ||
            "Error desconocido al registrar usuario";
          
          toast.error("Error al crear usuario", {
            description: errorMsg,
          });
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DrawerCreate trigger="Crear Usuario" open={open} onOpenChange={setOpen}>
      {/* Formulario para registrar un usuario del sistema */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 py-3 overflow-y-auto max-h-[75vh]">
        
        {/* Campo: Rol */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role" className="text-xs font-semibold text-neutral-600">
            Rol de Usuario
          </Label>
          <Controller
            name="role"
            control={control}
            rules={{ required: "El rol es obligatorio" }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger className="w-full border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-xs text-xs">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles del Sistema</SelectLabel>
                    <SelectItem value="seller">Vendedor (Seller)</SelectItem>
                    <SelectItem value="admin">Administrador (Admin)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.role.message}</span>
          )}
        </div>

        {/* Campo: Nombre */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-xs font-semibold text-neutral-600">
            Nombre
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Ej. José"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-xs shadow-xs"
            {...register("name", { required: "El nombre es obligatorio" })}
          />
          {errors.name && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>
          )}
        </div>

        {/* Campo: Apellido */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastname" className="text-xs font-semibold text-neutral-600">
            Apellido
          </Label>
          <Input
            id="lastname"
            type="text"
            placeholder="Ej. Molina"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-xs shadow-xs"
            {...register("lastname", { required: "El apellido es obligatorio" })}
          />
          {errors.lastname && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.lastname.message}</span>
          )}
        </div>

        {/* Campo: Usuario */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username" className="text-xs font-semibold text-neutral-600">
            Usuario de Login
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="Ej. jmolina"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-xs shadow-xs"
            {...register("username", { required: "El nombre de usuario es obligatorio" })}
          />
          {errors.username && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.username.message}</span>
          )}
        </div>

        {/* Campo: Email */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-neutral-600">
            Correo Electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Ej. jose.molina@dicenca.com"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-xs shadow-xs"
            {...register("email", { 
              required: "El correo electrónico es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo electrónico no válido",
              }
            })}
          />
          {errors.email && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.email.message}</span>
          )}
        </div>

        {/* Campo: Contraseña */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-xs font-semibold text-neutral-600">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-xs shadow-xs"
            {...register("password", { 
              required: "La contraseña es obligatoria",
              minLength: {
                value: 6,
                message: "Debe tener al menos 6 caracteres",
              }
            })}
          />
          {errors.password && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.password.message}</span>
          )}
        </div>

        <DrawerFooter className="px-0 pt-4">
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md transition-all duration-200 rounded-lg text-xs"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner className="h-4 w-4" /> : "Guardar Usuario"}
          </Button>
        </DrawerFooter>
      </form>
    </DrawerCreate>
  );
}
