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
  checkAuth: () => Promise<void>;
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
      throw error; // Propaga el error para manejarlo en el componente de login
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

  checkAuth: async () => {
    set({ loading: true });
    try {
      // Este endpoint verifica la cookie y devuelve los datos del usuario si es válida
      const { data: user } = await api.get("/auth/me");
      set({ user, isAuthenticated: true, loading: false });
    } catch (error) {
      console.error(error);
      // Si la petición falla (ej. 401 Unauthorized), el usuario no está autenticado
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
}));
