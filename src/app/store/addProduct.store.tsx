import { create } from "zustand";
import { PortFolioProps, ProductProps } from "../types/types";

interface AddProductProps {
  portfolio: PortFolioProps | undefined;
  product: ProductProps | undefined;
  productQuantity: number;
  setPortfolio: (portfolio: PortFolioProps) => void;
  setProduct: (product: ProductProps) => void;
  setProductQuantity: (quantity: number) => void;
  resetData: () => void;
}

export const useAddProductStore = create<AddProductProps>((set) => ({
  portfolio: undefined,
  product: undefined,
  productQuantity: 1,
  setPortfolio: (portfolio: PortFolioProps) => {
    set({ portfolio });
  },
  setProduct: (product: ProductProps) => {
    set({ product });
  },
  setProductQuantity: (quantity: number) => {
    set({ productQuantity: quantity });
  },
  resetData: () => {
    set({ portfolio: undefined, product: undefined, productQuantity: 1 });
  },
}));
