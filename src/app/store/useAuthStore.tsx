import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { isAxiosError } from "axios";
import { LoginFormInputs } from "../(routes)/login/page";
import api from "../libs/axiosConfig";
import { UserProps } from "../types/types";

export interface LoginResult {
  success: boolean;
  role?: string;
  message?: string;
}

interface State {
  user: UserProps | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginFormInputs) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<State>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false, // Cambiado a false ya que se recupera automáticamente de localStorage

      login: async (data: LoginFormInputs): Promise<LoginResult> => {
        try {
          // La cookie HttpOnly se establece automáticamente por el backend tras el login
          const res = await api.post("/user/login", {
            email: data.email,
            password: data.password,
          });

          if (res && res.data && res.data.loged) {
            set({ user: res.data.user, isAuthenticated: true });
            return {
              success: true,
              role: res.data.role,
              message: res.data.message || "Inicio de sesión exitoso",
            };
          }

          set({ user: null, isAuthenticated: false });
          let errorMsg = "Credenciales incorrectas";
          if (res?.data?.message === "user not found") {
            errorMsg = "El correo electrónico no está registrado";
          } else if (res?.data?.message === "incorrect password") {
            errorMsg = "La contraseña ingresada es incorrecta";
          }
          return {
            success: false,
            message: errorMsg,
          };
        } catch (error: unknown) {
          console.error("Login failed:", error);
          set({ user: null, isAuthenticated: false });
          let errorMsg = "Error de conexión con el servidor";
          if (isAxiosError(error)) {
            const data = error.response?.data as { message?: string; error?: string } | undefined;
            errorMsg = data?.message || data?.error || error.message || errorMsg;
          } else if (error instanceof Error) {
            errorMsg = error.message;
          }
          return {
            success: false,
            message: errorMsg,
          };
        }
      },

      logout: async () => {
        try {
          await api.get("/user/logout"); // Cambiado a GET para coincidir con la ruta del backend
        } catch (error) {
          console.error("Logout failed at backend:", error);
        } finally {
          // Limpiamos el estado sin importar si la petición falló
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
