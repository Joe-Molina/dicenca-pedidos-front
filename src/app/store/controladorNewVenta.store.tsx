import { create } from "zustand";
// import { createJSONStorage, persist } from "zustand/middleware";
import {
  ClientProps,
  CreateOrderProps,
  OrderDetailsProps,
  UserProps,
  ZoneProps,
} from "../types/types";

//creacion de type para el estado del zustand
interface ControladorStateProps {
  seller: UserProps | undefined;
  zone: ZoneProps | undefined;
  client: ClientProps | undefined;
  order: CreateOrderProps;
  reset: () => void;
  setSeller: (seller: UserProps) => void;
  setZone: (zone: ZoneProps) => void;
  setClient: (client: ClientProps) => void;
  setOrderNote: (notes: string) => void;
  addDetailToOrder: (
    detail: Omit<OrderDetailsProps, "id" | "orderId" | "price" | "gr" | "total">
  ) => void;
  deleteDetailFromOrder: (index: number) => void;
  updateDetailQuantity: (index: number, cant: number) => void;
}

// se usa el metodo create para crear un nuevo estado global con zustand
export const useNewVentaStore = create<ControladorStateProps>((set) => ({
  seller: undefined,
  zone: undefined,
  client: undefined,
  order: {
    clientId: 0,
    notes: "",
    details: [],
  },
  setSeller: (seller: UserProps) => {
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
    set((state) => {
      const details = state.order?.details ? [...state.order.details] : [];
      // Si el producto ya existe en la orden, sumamos la cantidad
      const existingIdx = details.findIndex((d) => d.productId === detail.productId);
      if (existingIdx >= 0) {
        details[existingIdx] = {
          ...details[existingIdx],
          cant: details[existingIdx].cant + detail.cant,
        };
      } else {
        details.push(detail);
      }
      return {
        order: {
          ...state.order,
          details,
        } as CreateOrderProps,
      };
    });
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
  updateDetailQuantity: (index: number, cant: number) => {
    set((state) => {
      if (!state.order || cant <= 0) return state;
      const newDetails = [...state.order.details];
      newDetails[index] = {
        ...newDetails[index],
        cant,
      };
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
      seller: undefined,
      zone: undefined,
      client: undefined,
      order: {
        clientId: 0,
        notes: "",
        details: [],
      },
    });
  },
}));
