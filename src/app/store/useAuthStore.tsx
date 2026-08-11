import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LoginFormInputs } from "../(routes)/login/page";
import api from "../libs/axiosConfig";
import { UserProps } from "../types/types";

interface State {
  user: UserProps | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginFormInputs) => Promise<string>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<State>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false, // Cambiado a false ya que se recupera automáticamente de localStorage

      login: async (data: LoginFormInputs) => {
        try {
          // La cookie HttpOnly se establece automáticamente por el backend tras el login
          const res = await api.post("/user/login", {
            email: data.email,
            password: data.password,
          });
          if (res) {
            set({ user: res.data.user, isAuthenticated: true });
            return res.data.role;
          }
          return "";
        } catch (error) {
          console.error("Login failed:", error);
          set({ user: null, isAuthenticated: false });
          return "";
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
