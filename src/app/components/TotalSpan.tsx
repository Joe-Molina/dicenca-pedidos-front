"use client";

import React from "react";
import { useProductQuery } from "../querys/useProduct.query";
import { useNewVentaStore } from "../store/controladorNewVenta.store";
import { OrderDetailsProps } from "../types/types";
import { formatCurrency } from "./utils/FormatPrice";

export function TotalSpan() {
  const {
    query: { data: products },
  } = useProductQuery();

  const { order } = useNewVentaStore();

  const details = order?.details || [];

  const totalBultos = details.reduce((acc: number, curr: Omit<OrderDetailsProps, "id" | "orderId" | "price" | "gr" | "total">) => acc + curr.cant, 0);

  const totalAmount = details.reduce(
    (totalAcc: number, detail: Omit<OrderDetailsProps, "id" | "orderId" | "price" | "gr" | "total">) => {
      const product = products?.find((p) => p.id === detail.productId);
      if (!product) return totalAcc;
      return totalAcc + detail.cant * product.price;
    },
    0
  );

  return (
    <div className="flex flex-col gap-1.5 pt-3 border-t border-neutral-100">
      <div className="flex justify-between items-center text-xs text-neutral-500 font-semibold">
        <span>Total Bultos:</span>
        <span className="font-bold text-neutral-800">{totalBultos} {totalBultos === 1 ? "bulto" : "bultos"}</span>
      </div>
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-extrabold text-neutral-700">Monto Total:</span>
        <span className="text-2xl font-black text-neutral-900 tracking-tight">
          {formatCurrency(totalAmount)}
        </span>
      </div>
    </div>
  );
}
