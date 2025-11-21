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
  order: CreateOrderProps;
  reset: () => void;
  setSeller: (seller: SellerProps) => void;
  setZone: (zone: ZoneProps) => void;
  setClient: (client: ClientProps) => void;
  setOrderNote: (notes: string) => void;
  addDetailToOrder: (
    detail: Omit<OrderDetailsProps, "id" | "orderId" | "price" | "gr" | "total">
  ) => void;
  deleteDetailFromOrder?: (index: number) => void;
}

// se una el metodo create para crear un nuevo estado global con zustand
// que recibe como parametro una funcion fecha con el set que sirve para modificar y actualizar el estado
export const useNewVentaStore = create<ControladorStateProps>((set) => ({
  seller: undefined,
  zone: undefined,
  client: undefined,
  order: {
    clientId: 0,
    notes: "",
    details: [],
  },
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
        clientId: client.id,
      } as CreateOrderProps,
    }));
  },
  setOrderNote: (notes: string) => {
    set((state) => ({
      order: {
        ...state.order,
        notes,
      } as CreateOrderProps,
    }));
  },
  addDetailToOrder: (
    detail: Omit<OrderDetailsProps, "id" | "orderId" | "price" | "gr" | "total">
  ) => {
    set((state) => ({
      order: {
        ...state.order,
        details: state.order?.details
          ? [...state.order.details, detail]
          : [detail],
      } as CreateOrderProps,
    }));
  },
  deleteDetailFromOrder: (index: number) => {
    set((state) => {
      if (!state.order) return state;
      const newDetails = [...state.order.details];
      newDetails.splice(index, 1);
      return {
        order: {
          ...state.order,
          details: newDetails,
        } as CreateOrderProps,
      };
    });
  },
  reset: () => {
    set({
      zone: undefined,
      client: undefined,
      order: undefined,
    });
  },
}));
