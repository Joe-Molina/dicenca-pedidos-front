"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export interface LoginFormInputs {
  email: string;
  password: string;
}

export default function Page() {
  const { login } = useAuthStore();
  const {
    register, // Función para registrar los inputs
    handleSubmit, // Función que maneja el envío del formularios
  } = useForm<LoginFormInputs>();

  const router = useRouter();

  const onSubmit = async (data: LoginFormInputs) => {
    const isLoged = await login(data);
    if (isLoged) router.push("create/new_order");
  };

  return (
    <div className=' h-screen  p-2 md:p-6'>
      <div className='flex flex-col md:flex-row rounded-md shadow-md overflow-hidden h-full border border-neutral-200'>
        <div className='md:w-1/2 h-1/2 md:h-full bg-neutral-900 text-white p-10 flex flex-col justify-between'>
          <span className='text-2xl font-semibold'>
            Pedidos-App(nombre por definir xd)
          </span>
          <p className='text-xl'>
            ¡Descubre el futuro de las ventas online! Ahorra tiempo, aumenta tus
            ventas y mejora la satisfacción de tus clientes.
          </p>
        </div>

        <div className='md:w-1/2 flex justify-center items-center'>
          <div className='md:w-96 flex flex-col justify-center items-center gap-5 p-10 md:px-5 md: border '>
            <h2>Iniciar Sesion</h2>
            <p className='text-sm text-neutral-500 text-center'>
              introduce tu nombre de usuario y contraseña abajo para iniciar
              sesion
            </p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='w-full flex flex-col justify-center items-center gap-5'
            >
              <Input
                type='text'
                placeholder='Email'
                id='email'
                {...register("email", {
                  required: "El nombre de usuario es obligatorio",
                })}
              />
              <Input
                type='password'
                placeholder='Contraseña'
                id='password'
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 3,
                    message: "La contraseña debe tener al menos 6 caracteres",
                  },
                })}
              />
              <div className='flex gap-3'>
                <Button type='submit' className='w-32'>
                  {"Iniciar sesión"}
                </Button>
                <Link href={"/"}>
                  <Button>crear cuenta</Button>
                </Link>
              </div>
            </form>
            <p className='text-sm text-neutral-500 text-center'>
              Al utilizar nuestros servicios estas de acuerdo con nuestra
              politica de privacidad y terminos del servicio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
