"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { SelectPortfolioBtn } from "./addProduct/selectPortfolio";
import { useAddProductStore } from "../store/addProduct.store";
import { SelectProductBtn } from "./addProduct/selectProduct";
import { SelectCantProduct } from "./addProduct/selectCantProduct";
import { useNewVentaStore } from "../store/controladorNewVenta.store";
import { Plus, PackagePlus } from "lucide-react";
import { toast } from "sonner";

export function AddDetailButton() {
  const [open, setOpen] = useState(false);
  const { portfolio, product, productQuantity, resetData } = useAddProductStore();
  const { addDetailToOrder } = useNewVentaStore();

  const handleAddProduct = () => {
    if (!product) {
      toast.error("Selecciona un producto primero");
      return;
    }
    const qty = Math.max(1, productQuantity || 1);
    addDetailToOrder({
      cant: qty,
      productId: product.id,
    });
    toast.success(`Se agregaron ${qty} bultos de ${product.name}`);
    resetData();
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs py-2.5 px-5 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="size-4" />
          <span>Agregar Producto</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-white max-w-xl mx-auto rounded-t-3xl border-t border-neutral-200">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
            <PackagePlus className="size-5 text-blue-600" />
            Añadir Producto al Pedido
          </DrawerTitle>
          <p className="text-xs text-neutral-500 mt-1">
            Selecciona el portafolio, el producto y la cantidad requerida en bultos.
          </p>
        </DrawerHeader>

        <div className="p-4 flex flex-col gap-3.5">
          <SelectPortfolioBtn />
          {portfolio && <SelectProductBtn />}
          {product && <SelectCantProduct />}
        </div>

        <DrawerFooter className="pt-2 pb-6 px-4 flex flex-col sm:flex-row gap-2">
          <DrawerClose asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl text-xs font-semibold"
              onClick={() => resetData()}
            >
              Cancelar
            </Button>
          </DrawerClose>

          <Button
            type="button"
            disabled={!product}
            onClick={handleAddProduct}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm py-2.5 disabled:opacity-50 cursor-pointer"
          >
            Añadir a la Orden
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
