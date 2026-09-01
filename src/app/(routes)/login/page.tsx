"use client";

import { useState } from "react";
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
    <div className='min-h-screen p-4 md:p-8 bg-neutral-50/60 flex items-center justify-center'>
      <div className='flex flex-col md:flex-row rounded-3xl shadow-xl overflow-hidden w-full max-w-4xl border border-neutral-100 bg-white'>
        {/* Banner lateral elegante blanco con acentos azules */}
        <div className='md:w-1/2 bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-100'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center shadow-md shadow-blue-500/20 text-lg'>
              D
            </div>
            <span className='text-2xl font-extrabold tracking-tight text-neutral-900'>
              Diacenca <span className='text-blue-600'>Pedidos</span>
            </span>
          </div>

          <div className='my-8 md:my-0'>
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4'>
              Sistema de Gestión y Despachos
            </span>
            <h3 className='text-2xl md:text-3xl font-extrabold text-neutral-900 leading-tight mb-3'>
              Control total de ventas e inventario en tiempo real.
            </h3>
            <p className='text-sm text-neutral-600 leading-relaxed'>
              Optimiza tus pedidos por bultos, gestiona zonas de despacho y monitorea el rendimiento comercial en una plataforma unificada.
            </p>
          </div>

          <div className='text-xs font-semibold text-neutral-400'>
            © {new Date().getFullYear()} Diacenca. Todos los derechos reservados.
          </div>
        </div>

        {/* Sección del formulario */}
        <div className='md:w-1/2 flex justify-center items-center p-8 md:p-12 bg-white'>
          <div className='w-full max-w-sm flex flex-col justify-center items-center gap-6'>
            <div className='text-center w-full'>
              <h2 className='text-2xl font-bold text-neutral-900'>
                Iniciar Sesión
              </h2>
              <p className='text-xs text-neutral-500 mt-1.5'>
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
                  className='text-xs font-bold text-neutral-700'
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
                  className={`rounded-xl border-neutral-200 focus:border-blue-600 focus:ring-blue-600 text-sm ${errors.email
                    ? "border-red-500 focus-visible:ring-red-400"
                    : ""
                    }`}
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
                  className='text-xs font-bold text-neutral-700'
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
                  className={`rounded-xl border-neutral-200 focus:border-blue-600 focus:ring-blue-600 text-sm ${errors.password
                    ? "border-red-500 focus-visible:ring-red-400"
                    : ""
                    }`}
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

              {/* Botón de acción */}
              <div className='w-full pt-2'>
                <Button
                  type='submit'
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all duration-150 cursor-pointer h-10'
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
              </div>

              {/* Label de notificación / alerta debajo de los botones de ingresar */}
              {serverError && (
                <div
                  role='alert'
                  className='w-full p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 mt-1'
                >
                  <AlertCircle className='w-4 h-4 shrink-0 text-red-600' />
                  <span className='font-semibold'>{serverError}</span>
                </div>
              )}
            </form>

            <p className='text-[11px] text-neutral-400 text-center leading-normal'>
              Al utilizar nuestros servicios estás de acuerdo con nuestra
              política de privacidad y términos del servicio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
