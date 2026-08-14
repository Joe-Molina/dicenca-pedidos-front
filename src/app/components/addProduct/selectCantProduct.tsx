"use client";

import React from "react";
import { useAddProductStore } from "@/app/store/addProduct.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/app/components/utils/FormatPrice";

export function SelectCantProduct() {
  const { setProductQuantity, product, productQuantity } = useAddProductStore();

  if (!product) return null;

  const currentQty = productQuantity || 1;
  const subtotal = currentQty * product.price;

  return (
    <div className="flex flex-col gap-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-100 mt-1">
      <div className="flex justify-between items-center">
        <Label className="text-xs font-bold text-neutral-700">Cantidad de bultos</Label>
        <span className="text-xs font-semibold text-neutral-500">
          Precio unitario: <strong className="text-neutral-800">{formatCurrency(product.price)}</strong>
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Stepper */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (currentQty > 1) setProductQuantity(currentQty - 1);
            }}
            className="h-9 w-9 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          >
            <Minus className="size-4" />
          </button>

          <Input
            type="number"
            min={1}
            value={currentQty}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value) || 1);
              setProductQuantity(val);
            }}
            className="w-20 text-center font-black text-sm bg-white rounded-xl border-neutral-200 h-9"
          />

          <button
            type="button"
            onClick={() => setProductQuantity(currentQty + 1)}
            className="h-9 w-9 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Subtotal preview */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Subtotal</span>
          <span className="text-base font-black text-blue-600">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
