"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useNewVentaStore } from "../store/controladorNewVenta.store";
import { useOrdersQuery } from "../querys/useOrders.query";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateOrderBtnProps {
  redirectPath?: string;
  className?: string;
}

export function CreateOrderBtn({ redirectPath, className }: CreateOrderBtnProps) {
  const router = useRouter();
  const { order, reset, client } = useNewVentaStore();
  const { createOrderMutation } = useOrdersQuery();

  const detailsCount = order?.details?.length || 0;
  const isPending = createOrderMutation.isPending;

  const handleCreateOrder = async () => {
    if (!client || !order?.clientId) {
      toast.error("Debes seleccionar un cliente para el pedido");
      return;
    }
    if (!order?.details || order.details.length === 0) {
      toast.error("Debes agregar al menos un producto al pedido");
      return;
    }

    try {
      await createOrderMutation.mutateAsync(order, {
        onSuccess: () => {
          toast.success("¡Pedido creado exitosamente!", {
            description: `Se registró la orden para ${client.company_name}`,
          });
          reset();
          if (redirectPath) {
            router.push(redirectPath);
          }
        },
        onError: (err: any) => {
          toast.error("Error al procesar la orden", {
            description: err?.message || "Ocurrió un error inesperado",
          });
        },
      });
    } catch (error) {
      console.error("Error al crear la orden:", error);
    }
  };

  const isDisabled = isPending || detailsCount === 0 || !client;

  return (
    <Button
      type="button"
      onClick={handleCreateOrder}
      disabled={isDisabled}
      className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md py-3.5 px-6 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm ${
        className || ""
      }`}
    >
      {isPending ? (
        <>
          <Spinner className="h-4 w-4 text-white" />
          <span>Registrando pedido...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="size-4.5" />
          <span>Realizar Pedido ({detailsCount} {detailsCount === 1 ? "producto" : "productos"})</span>
        </>
      )}
    </Button>
  );
}
