"use client";

import React, { useState, useMemo } from "react";
import { useOrdersQuery } from "@/app/querys/useOrders.query";
import { useClientsQuery } from "@/app/querys/useClients.query";
import { useProductQuery } from "@/app/querys/useProduct.query";
import { useZonesQuery } from "@/app/querys/useZones.query";
import { useAuthStore } from "@/app/store/useAuthStore";
import { SpinnerGlobal } from "@/app/components/SpinnerGlobal";
import OrderCard from "../../admin/components/OrderCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { Search, Calendar, Filter, RotateCcw, ClipboardList } from "lucide-react";

export default function SellerHistoryPage() {
  // Obtener el usuario vendedor conectado
  const { user } = useAuthStore();

  // Peticiones de datos necesarias
  const { data: orders, isLoading: ordersLoading } = useOrdersQuery();
  const {
    query: { data: clients, isLoading: clientsLoading },
  } = useClientsQuery();
  const {
    query: { data: products, isLoading: productsLoading },
  } = useProductQuery();
  const {
    query: { data: zones, isLoading: zonesLoading },
  } = useZonesQuery();

  const isLoading =
    ordersLoading || clientsLoading || productsLoading || zonesLoading || !user;

  // Estados locales para los filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  
  // Pestaña de estado: "all" (todos), "pending" (pendientes), "dispatched" (despachados)
  const [statusTab, setStatusTab] = useState<"all" | "pending" | "dispatched">("all");

  // Filtrado de pedidos de la cartera del vendedor en memoria
  const filteredOrders = useMemo(() => {
    if (isLoading || !user || !zones || !clients || !orders) return [];

    // 1. Obtener zonas e IDs del vendedor
    const sellerZones = zones.filter((z) => z.userId === user.id);
    const sellerZoneIds = sellerZones.map((z) => z.id);

    // 2. Obtener clientes en cartera
    const sellerClients = clients.filter((c) => sellerZoneIds.includes(c.zoneId));
    const sellerClientIds = sellerClients.map((c) => c.id);

    // 3. Filtrar pedidos que pertenecen únicamente a su cartera
    const sellerOrders = orders.filter((order) =>
      sellerClientIds.includes(order.clientId)
    );

    // Ordenar cronológicamente descendente (más recientes primero)
    const sortedOrders = [...sellerOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sortedOrders.filter((order) => {
      // Filtro por Estatus (Pestañas)
      if (statusTab === "pending" && order.status !== false) return false;
      if (statusTab === "dispatched" && order.status !== true) return false;

      // Obtener cliente
      const client = sellerClients.find((c) => c.id === order.clientId);
      if (!client) return false;

      // Buscador por nombre de cliente, razón social o RIF
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const clientName = (client.name || "").toLowerCase();
        const compName = (client.company_name || "").toLowerCase();
        const rifStr = (client.rif || "").toLowerCase();
        const orderIdStr = order.id.toString();

        if (
          !clientName.includes(query) &&
          !compName.includes(query) &&
          !rifStr.includes(query) &&
          !orderIdStr.includes(query)
        ) {
          return false;
        }
      }

      // Filtro por Rango de Fechas
      const orderDate = new Date(order.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }

      // Filtro por Producto
      if (selectedProductId) {
        const hasProduct = order.orderDetails?.some(
          (detail) => detail.productId === Number(selectedProductId)
        );
        if (!hasProduct) return false;
      }

      return true;
    });
  }, [isLoading, user, zones, clients, orders, searchQuery, startDate, endDate, selectedProductId, statusTab]);

  // Reiniciar filtros
  const handleResetFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSelectedProductId("");
    setStatusTab("all");
  };

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  // Métricas rápidas de pedidos del vendedor
  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter((o) => !o.status).length,
    dispatched: filteredOrders.filter((o) => o.status).length,
  };

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 bg-neutral-50/50 p-4 md:p-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-2">
        <h2 className="bg-gradient-to-r from-indigo-800 to-indigo-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent flex items-center gap-2">
          <ClipboardList className="size-8 text-indigo-700" />
          Tus Pedidos Tomados
        </h2>
        <p className="text-sm font-medium text-neutral-500">
          Consulta, filtra e inspecciona el historial de todos los pedidos levantados para tu cartera de clientes.
        </p>
      </div>

      {/* PANEL DE FILTROS */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs flex flex-col gap-4">
        {/* Fila 1: Barra de búsqueda */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Buscar cliente, razón social o RIF..."
              className="pl-10 border-neutral-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-xs text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="rounded-xl font-semibold gap-1.5 shrink-0"
            onClick={handleResetFilters}
          >
            <RotateCcw className="size-4" />
            Limpiar Filtros
          </Button>
        </div>

        {/* Fila 2: Filtros de fechas y producto */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-neutral-50 pt-4">
          {/* Desde */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
              <Calendar className="size-3.5" /> Desde
            </Label>
            <Input
              type="date"
              className="border-neutral-200 rounded-xl text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Hasta */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
              <Calendar className="size-3.5" /> Hasta
            </Label>
            <Input
              type="date"
              className="border-neutral-200 rounded-xl text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Producto */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
              <Filter className="size-3.5" /> Producto en Pedido
            </Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="border-neutral-200 rounded-xl text-sm w-full bg-white shadow-xs">
                <SelectValue placeholder="Todos los productos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all-products">Todos los productos</SelectItem>
                  {products &&
                    products.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* PESTAÑAS DE CONTROL DE ESTADO */}
      <div className="flex flex-col gap-4">
        <div className="flex border-b border-neutral-200 overflow-x-auto gap-2">
          <button
            onClick={() => setStatusTab("all")}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              statusTab === "all"
                ? "border-b-2 border-indigo-600 text-indigo-600 font-extrabold"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setStatusTab("pending")}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              statusTab === "pending"
                ? "border-b-2 border-amber-500 text-amber-600 font-extrabold"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Pendientes ({stats.pending})
          </button>
          <button
            onClick={() => setStatusTab("dispatched")}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              statusTab === "dispatched"
                ? "border-b-2 border-emerald-500 text-emerald-600 font-extrabold"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Despachados ({stats.dispatched})
          </button>
        </div>

        {/* LISTADO DE PEDIDOS DEL VENDEDOR */}
        {filteredOrders.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order, index) => {
              // Buscar cliente en la lista
              const client = clients?.find((c) => c.id === order.clientId);
              const orderTotal =
                order.orderDetails?.reduce((acc, curr) => acc + curr.total, 0) || 0;
              return (
                <OrderCard
                  key={index}
                  clientName={client?.company_name || client?.name || "Desconocido"}
                  orderId={order.id}
                  note={order.notes}
                  total={orderTotal}
                  status={order.status}
                  orderDetails={order.orderDetails}
                  createdAt={order.createdAt}
                  updatedAt={order.updatedAt}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-100 bg-white p-12 text-center shadow-xs">
            <p className="text-sm font-semibold text-neutral-400">
              No tienes pedidos registrados que coincidan con estos filtros.
            </p>
            <p className="text-xs text-neutral-300 mt-1 font-medium">
              Intenta cambiar la búsqueda o limpiar los filtros seleccionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
