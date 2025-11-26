import { create } from "zustand";
import { LoginFormInputs } from "../(notProtected)/login/page";
import api from "../libs/axiosConfig";

export interface UserProps {
  id: number;
  name: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  contact: string;
  role: "seller" | "admin";
}

interface State {
  user: UserProps | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginFormInputs) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<State>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true, // Inicia en true para verificar el estado de autenticación al cargar la app

  login: async (data: LoginFormInputs) => {
    try {
      // La cookie HttpOnly se establece automáticamente por el backend tras el login
      const res = await api.post("/user/login", {
        email: data.email,
        password: data.password,
      });
      if (res) {
        set({ user: res.data.user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      set({ user: null, isAuthenticated: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post("/user/logout"); // El backend debe eliminar la cookie
    } finally {
      // Limpiamos el estado sin importar si la petición falló (ej. si el servidor está caído)
      set({ user: null, isAuthenticated: false });
    }
  },
}));
