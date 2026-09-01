"use client";

import React from "react";
import { AddDetailButton } from "@/app/components/addDetail";
import { CreateOrderBtn } from "@/app/components/CreateOrderBtn";
import { SelectClient } from "@/app/components/SelectClient";
import { SelectedProducts } from "@/app/components/SelectedProducts";
import { SelectSeller } from "@/app/components/SelectSeller";
import { SelectZone } from "@/app/components/SelectZone";
import { TotalSpan } from "@/app/components/TotalSpan";
import { useNewVentaStore } from "@/app/store/controladorNewVenta.store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  RotateCcw,
  ClipboardList,
  FileText,
  UserCheck,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminCreateOrderPage() {
  const router = useRouter();
  const { seller, zone, client, order, setOrderNote, reset } =
    useNewVentaStore();

  const detailsCount = order?.details?.length || 0;

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 bg-neutral-50/50 p-4 md:p-8 pb-36 lg:pb-12">
      {/* Cabecera Principal */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-2xl md:text-3xl font-extrabold tracking-tight text-transparent flex items-center gap-2.5">
            <ClipboardList className="size-7 text-blue-600" />
            Crear Nuevo Pedido
          </h1>
          <p className="text-xs md:text-sm font-medium text-neutral-500 mt-1">
            Asigna el vendedor, selecciona el cliente y añade los productos requeridos por bultos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            className="rounded-xl text-xs font-bold border-neutral-200 text-neutral-600 hover:text-red-600 hover:bg-red-50 gap-1.5 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            Limpiar Formulario
          </Button>
        </div>
      </div>

      {/* Grid de Creación de Pedidos: 2 Columnas en Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda: Configuración del Pedido (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Card 1: Selección en Cascada de Destino */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 md:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-50">
              <UserCheck className="size-4 text-blue-600" />
              <h2 className="text-sm font-extrabold text-neutral-800">
                1. Datos de Destino y Cliente
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <SelectSeller />

              {seller ? (
                <SelectZone />
              ) : (
                <div className="p-3 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-center">
                  <p className="text-xs text-neutral-400 font-medium">
                    Selecciona un vendedor para cargar sus zonas asociadas.
                  </p>
                </div>
              )}

              {seller && zone ? (
                <SelectClient />
              ) : seller ? (
                <div className="p-3 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-center">
                  <p className="text-xs text-neutral-400 font-medium">
                    Selecciona una zona para cargar la cartera de clientes.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Card 2: Agregar Productos al Pedido */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 md:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-blue-600" />
                <h2 className="text-sm font-extrabold text-neutral-800">
                  2. Catálogo y Selección de Bultos
                </h2>
              </div>
             
            </div>

            {!client ? (
              <div className="p-6 bg-neutral-50/70 rounded-2xl border border-dashed border-neutral-200 text-center flex flex-col items-center">
                <p className="text-xs font-semibold text-neutral-500">
                  Debes seleccionar un cliente primero para habilitar la carga de productos al pedido.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-blue-50/30 rounded-xl border border-blue-100/60">
                <p className="text-xs text-neutral-600 font-medium">
                  Presiona el botón para elegir portafolios y agregar productos por bultos.
                </p>
                <div className="hidden sm:block">
                  <AddDetailButton />
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Observaciones / Notas */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 md:p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-50">
              <FileText className="size-4 text-blue-600" />
              <Label htmlFor="order-note" className="text-sm font-extrabold text-neutral-800">
                3. Observaciones del Pedido (Opcional)
              </Label>
            </div>
            <textarea
              id="order-note"
              placeholder="Escribe aquí cualquier indicación especial de despacho, horario de recepción o instrucciones de facturación..."
              className="border border-neutral-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none p-3 rounded-xl text-xs resize-none h-20 bg-neutral-50/20 w-full"
              value={order?.notes || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrderNote(e.target.value)}
            />
          </div>

        </div>

        {/* Columna Derecha: Resumen del Pedido (5 Cols - Sticky en Desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 md:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-50">
              <h2 className="text-sm font-extrabold text-neutral-800 flex items-center gap-2">
                <ClipboardList className="size-4 text-blue-600" />
                Resumen de la Orden
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {detailsCount} {detailsCount === 1 ? "ítem" : "ítems"}
              </span>
            </div>

            {/* Listado de Productos Seleccionados */}
            <SelectedProducts />

            {/* Desglose y Totales */}
            {detailsCount > 0 && <TotalSpan />}

            {/* Botón de Creación de Orden en Desktop */}
            <div className="pt-2">
              <CreateOrderBtn redirectPath="/admin/order/pending" />
            </div>
          </div>
        </div>

      </div>

      {/* Barra Flotante Inferior ÚNICAMENTE en Pantallas Móviles para Máxima Ergonomía */}
      {detailsCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-4 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold text-neutral-400">Total a Pagar</span>
            <div className="scale-90 origin-left">
              <TotalSpan />
            </div>
          </div>
          <div className="flex-1 max-w-[200px]">
            <CreateOrderBtn redirectPath="/admin/order/pending" className="py-2.5 text-xs" />
          </div>
        </div>
      )}
    </div>
  );
}
