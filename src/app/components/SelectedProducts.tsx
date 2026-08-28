"use client";

import React from "react";
import { useProductQuery } from "../querys/useProduct.query";
import { useNewVentaStore } from "../store/controladorNewVenta.store";
import { SpinnerGlobal } from "./SpinnerGlobal";
import { Trash2, Plus, Minus, Package, ShoppingBag } from "lucide-react";
import { formatCurrency } from "./utils/FormatPrice";
import { OrderDetailsProps } from "../types/types";

export function SelectedProducts() {
  const {
    query: { data: products, isLoading },
  } = useProductQuery();
  
  const { order, deleteDetailFromOrder, updateDetailQuantity } = useNewVentaStore();

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  const details: Omit<OrderDetailsProps, "id" | "orderId" | "price" | "gr" | "total">[] = order?.details || [];

  if (details.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 text-center">
        <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-xs">
          <ShoppingBag className="size-6" />
        </div>
        <p className="text-sm font-bold text-neutral-700">No hay productos en el pedido</p>
        <p className="text-xs text-neutral-400 mt-0.5">
          Haz clic en &quot;Agregar Producto&quot; para añadir bultos a esta orden.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
          <Package className="size-4 text-blue-600" />
          Productos Añadidos ({details.length})
        </h3>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {details.map((detail: Omit<OrderDetailsProps, "id" | "orderId" | "price" | "gr" | "total">, index: number) => {
          const product = products?.find((p) => p.id === detail.productId);
          if (!product) return null;
          const subtotal = detail.cant * product.price;

          return (
            <div
              key={`${detail.productId}-${index}`}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-100 bg-white hover:border-blue-100 hover:shadow-xs transition-all duration-200"
            >
              {/* Info del Producto */}
              <div className="flex flex-col min-w-0 flex-1 pr-3">
                <span className="font-bold text-xs text-neutral-800 truncate">
                  {product.name}
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">
                  {formatCurrency(product.price)} por bulto
                </span>
              </div>

              {/* Controles de Cantidad */}
              <div className="flex items-center gap-1.5 bg-neutral-50 p-1 rounded-xl border border-neutral-100 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (detail.cant > 1) {
                      updateDetailQuantity(index, detail.cant - 1);
                    } else {
                      deleteDetailFromOrder(index);
                    }
                  }}
                  className="h-6 w-6 rounded-lg bg-white text-neutral-600 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  title="Disminuir bultos"
                >
                  <Minus className="size-3" />
                </button>

                <span className="text-xs font-black text-neutral-800 min-w-[28px] text-center">
                  {detail.cant} <span className="text-[10px] text-neutral-400 font-medium font-sans">b</span>
                </span>

                <button
                  type="button"
                  onClick={() => updateDetailQuantity(index, detail.cant + 1)}
                  className="h-6 w-6 rounded-lg bg-white text-neutral-600 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  title="Aumentar bultos"
                >
                  <Plus className="size-3" />
                </button>
              </div>

              {/* Subtotal y Botón Eliminar */}
              <div className="flex items-center gap-3 pl-3 shrink-0">
                <span className="font-extrabold text-xs text-neutral-900 min-w-[65px] text-right">
                  {formatCurrency(subtotal)}
                </span>

                <button
                  type="button"
                  onClick={() => deleteDetailFromOrder(index)}
                  className="h-7 w-7 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Eliminar de la orden"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
