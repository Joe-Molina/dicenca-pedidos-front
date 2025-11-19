import { create } from "zustand";
// import { createJSONStorage, persist } from "zustand/middleware";
import {
  ClientProps,
  CreateOrderProps,
  OrderDetailsProps,
  SellerProps,
  ZoneProps,
} from "../types/types";

//creacion de type para el estado del zustand
interface ControladorStateProps {
  seller: SellerProps | undefined;
  zone: ZoneProps | undefined;
  client: ClientProps | undefined;
  order: CreateOrderProps | undefined;
  setSeller: (seller: SellerProps) => void;
  setZone: (zone: ZoneProps) => void;
  setClient: (client: ClientProps) => void;
  setOrderNote: (notes: string) => void;
  addDetailToOrder: (detail: Omit<OrderDetailsProps, "id" | "orderId">) => void;
}

// se una el metodo create para crear un nuevo estado global con zustand
// que recibe como parametro una funcion fecha con el set que sirve para modificar y actualizar el estado
export const useNewVentaStore = create<ControladorStateProps>((set) => ({
  seller: undefined,
  zone: undefined,
  client: undefined,
  order: undefined,
  setSeller: (seller: SellerProps) => {
    set({ seller, zone: undefined, client: undefined });
  },
  setZone: (zone: ZoneProps) => {
    set({ zone, client: undefined });
  },
  setClient: (client: ClientProps) => {
    set((state) => ({
      client,
      order: {
        ...state.order,
        orden: { ...state.order?.orden, clientId: client.id },
      } as CreateOrderProps,
    }));
  },
  setOrderNote: (notes: string) => {
    set((state) => ({
      order: {
        ...state.order,
        orden: {
          ...state.order?.orden,
          notes,
        },
      } as CreateOrderProps,
    }));
  },
  addDetailToOrder: (detail: Omit<OrderDetailsProps, "id" | "orderId">) => {
    set((state) => ({
      order: {
        ...state.order,
        details: state.order ? [...state.order.details, detail] : [detail],
      } as CreateOrderProps,
    }));
  },
}));
