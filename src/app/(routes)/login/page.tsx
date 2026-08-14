"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export interface LoginFormInputs {
  email: string;
  password: string;
}

export default function Page() {
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);
    try {
      const result = await login(data);

      if (result.success && result.role) {
        toast.success("¡Bienvenido!", {
          description: "Inicio de sesión exitoso.",
        });

        if (result.role === "admin") {
          router.push("/admin");
        } else if (result.role === "seller") {
          router.push("/seller");
        }
      } else {
        const errorMsg =
          result.message || "Credenciales incorrectas. Verifica tus datos.";
        setServerError(errorMsg);
        toast.error("Error de autenticación", {
          description: errorMsg,
        });
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "No se pudo conectar con el servidor. Intenta más tarde.";
      setServerError(errorMsg);
      toast.error("Error al iniciar sesión", {
        description: errorMsg,
      });
    }
  };

  const onInvalid = (formErrors: typeof errors) => {
    let message = "Por favor, completa todos los campos requeridos.";

    if (formErrors.email) {
      message = formErrors.email.message || "El correo electrónico es inválido.";
    } else if (formErrors.password) {
      message = formErrors.password.message || "La contraseña es obligatoria.";
    }

    setServerError(message);
    toast.error("Validación requerida", {
      description: message,
    });
  };

  return (
    <div className='h-screen p-2 md:p-6 bg-neutral-100 flex items-center justify-center'>
      <div className='flex flex-col md:flex-row rounded-xl shadow-lg overflow-hidden h-full max-h-[800px] w-full max-w-5xl border border-neutral-200 bg-white'>
        {/* Banner lateral */}
        <div className='md:w-1/2 h-1/3 md:h-full bg-neutral-900 text-white p-8 md:p-10 flex flex-col justify-between'>
          <span className='text-2xl font-bold tracking-tight'>
            Diacenca Ventas
          </span>
          <div>
            <h3 className='text-xl md:text-2xl font-semibold mb-2'>
              ¡Descubre el futuro de las ventas online!
            </h3>
            <p className='text-sm md:text-base text-neutral-300'>
              Ahorra tiempo, aumenta tus ventas y mejora la satisfacción de tus
              clientes.
            </p>
          </div>
        </div>

        {/* Sección del formulario */}
        <div className='md:w-1/2 flex justify-center items-center p-6 md:p-12 overflow-y-auto'>
          <div className='w-full max-w-sm flex flex-col justify-center items-center gap-5'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-neutral-900'>
                Iniciar Sesión
              </h2>
              <p className='text-sm text-neutral-500 mt-1'>
                Introduce tu correo electrónico y contraseña para acceder
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              noValidate
              className='w-full flex flex-col gap-4'
            >
              {/* Campo Email */}
              <div className='flex flex-col gap-1.5 w-full'>
                <Label
                  htmlFor='email'
                  className='text-xs font-semibold text-neutral-700'
                >
                  Correo Electrónico
                </Label>
                <Input
                  type='email'
                  id='email'
                  autoComplete='email'
                  placeholder='correo@ejemplo.com'
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={
                    errors.email
                      ? "border-red-500 focus-visible:ring-red-400"
                      : ""
                  }
                  {...register("email", {
                    required: "El correo electrónico es obligatorio",
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                      message: "Ingresa un correo electrónico válido",
                    },
                    onChange: () => {
                      if (serverError) setServerError(null);
                    },
                  })}
                />
                {errors.email && (
                  <span
                    id='email-error'
                    className='text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5'
                  >
                    <AlertCircle className='w-3.5 h-3.5 shrink-0' />
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className='flex flex-col gap-1.5 w-full'>
                <Label
                  htmlFor='password'
                  className='text-xs font-semibold text-neutral-700'
                >
                  Contraseña
                </Label>
                <Input
                  type='password'
                  id='password'
                  autoComplete='current-password'
                  placeholder='Ingresa tu contraseña'
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className={
                    errors.password
                      ? "border-red-500 focus-visible:ring-red-400"
                      : ""
                  }
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: {
                      value: 6,
                      message: "La contraseña debe tener al menos 6 caracteres",
                    },
                    onChange: () => {
                      if (serverError) setServerError(null);
                    },
                  })}
                />
                {errors.password && (
                  <span
                    id='password-error'
                    className='text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5'
                  >
                    <AlertCircle className='w-3.5 h-3.5 shrink-0' />
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Botones de acción */}
              <div className='flex flex-col sm:flex-row gap-3 w-full pt-2'>
                <Button
                  type='submit'
                  className='flex-1 cursor-pointer'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className='flex items-center gap-2'>
                      <Spinner className='h-4 w-4 text-white' />
                      <span>Ingresando...</span>
                    </div>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
                <Link href='/' className='flex-1'>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full cursor-pointer'
                  >
                    Crear cuenta
                  </Button>
                </Link>
              </div>

              {/* Label de notificación / alerta debajo de los botones de ingresar */}
              {serverError && (
                <div
                  role='alert'
                  className='w-full p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md flex items-center gap-2'
                >
                  <AlertCircle className='w-4 h-4 shrink-0 text-red-600' />
                  <span className='font-medium'>{serverError}</span>
                </div>
              )}
            </form>

            <p className='text-xs text-neutral-500 text-center'>
              Al utilizar nuestros servicios estás de acuerdo con nuestra
              política de privacidad y términos del servicio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
