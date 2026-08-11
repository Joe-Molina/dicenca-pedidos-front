"use client";

import React, { useMemo } from "react";
import { Package, Users, Clock, Award, ShoppingCart, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useOrdersQuery } from "@/app/querys/useOrders.query";
import { useClientsQuery } from "@/app/querys/useClients.query";
import { useZonesQuery } from "@/app/querys/useZones.query";
import { SpinnerGlobal } from "@/app/components/SpinnerGlobal";
import { formatCurrency } from "@/app/components/utils/FormatPrice";

export default function SellerDashboard() {
  // Obtener el usuario vendedor conectado
  const { user } = useAuthStore();

  // Queries de datos
  const { data: orders, isLoading: ordersLoading } = useOrdersQuery();
  const {
    query: { data: clients, isLoading: clientsLoading },
  } = useClientsQuery();
  const {
    query: { data: zones, isLoading: zonesLoading },
  } = useZonesQuery();

  const isLoading = ordersLoading || clientsLoading || zonesLoading || !user;

  // Cálculos de métricas específicos para este vendedor
  const sellerStats = useMemo(() => {
    if (isLoading || !user || !zones || !clients || !orders) {
      return {
        totalClients: 0,
        activeClients: 0,
        totalOrders: 0,
        delayedOrders: 0,
        topClients: [],
        sellerZonesList: [],
      };
    }

    // 1. Obtener las zonas que pertenecen a este vendedor
    const sellerZonesList = zones.filter((z) => z.userId === user.id);
    const sellerZoneIds = sellerZonesList.map((z) => z.id);

    // 2. Obtener los clientes asociados a esas zonas (cartera del vendedor)
    const sellerClientsList = clients.filter((c) => sellerZoneIds.includes(c.zoneId));
    const sellerClientIds = sellerClientsList.map((c) => c.id);
    const totalClients = sellerClientsList.length;

    // 3. Filtrar pedidos realizados por los clientes del vendedor
    const sellerOrdersList = orders.filter((order) =>
      sellerClientIds.includes(order.clientId)
    );
    const totalOrders = sellerOrdersList.length;

    // 4. Pedidos atrasados de la cartera del vendedor (pendientes de más de 2 días)
    const sellerPendingOrders = sellerOrdersList.filter((order) => !order.status);
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    const delayedOrdersList = sellerPendingOrders.filter(
      (order) => new Date(order.createdAt).getTime() < twoDaysAgo
    );
    const delayedOrders = delayedOrdersList.length;

    // 5. Clientes activos (compras en el mes actual) de este vendedor
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const sellerOrdersThisMonth = sellerOrdersList.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    const activeClientIdsSet = new Set(
      sellerOrdersThisMonth.map((order) => order.clientId)
    );
    const activeClients = activeClientIdsSet.size;

    // 6. Top clientes del vendedor en el mes (por volumen de compra $)
    const clientSpentMap: { [clientId: number]: number } = {};
    sellerClientsList.forEach((c) => {
      clientSpentMap[c.id] = 0;
    });

    sellerOrdersThisMonth.forEach((order) => {
      const orderTotal =
        order.orderDetails?.reduce((sum, item) => sum + item.total, 0) || 0;
      if (clientSpentMap[order.clientId] !== undefined) {
        clientSpentMap[order.clientId] += orderTotal;
      } else {
        clientSpentMap[order.clientId] = orderTotal;
      }
    });

    const topClients = Object.entries(clientSpentMap)
      .map(([id, spent]) => {
        const client = sellerClientsList.find((c) => c.id === Number(id));
        return {
          id: Number(id),
          name: client?.company_name || client?.name || `Cliente #${id}`,
          rif: client?.rif || "",
          spent,
        };
      })
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5); // Top 5 de su cartera

    return {
      totalClients,
      activeClients,
      totalOrders,
      delayedOrders,
      topClients,
      sellerZonesList,
    };
  }, [isLoading, user, zones, clients, orders]);

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  // Máximo gasto de cliente de este vendedor para cálculo de barra
  const maxSpenderValue = sellerStats.topClients[0]?.spent || 1;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Saludo y Botón Principal */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="bg-gradient-to-r from-indigo-800 to-indigo-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            Panel de Ventas
          </h2>
          <p className="text-sm font-medium text-neutral-500">
            Monitorea tu cartera de clientes, toma nuevos pedidos y revisa despachos atrasados.
          </p>
        </div>
        <Link href="/seller/order">
          <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-xl text-xs gap-1.5 shadow-sm py-5 px-6 cursor-pointer">
            <Plus className="size-4" />
            Crear Nueva Orden
          </Button>
        </Link>
      </div>

      {/* Grid de Métricas de Vendedor */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Clientes Activos vs Cartera */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-20 w-20 rounded-full bg-blue-500/5 blur-lg"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5.5 w-5.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Clientes Activos / Cartera
              </p>
              <h3 className="text-xl font-bold text-neutral-800 mt-0.5">
                {sellerStats.activeClients} <span className="text-neutral-400 text-sm font-medium">/ {sellerStats.totalClients}</span>
              </h3>
              {/* Barra de progreso visual de clientes activados */}
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      sellerStats.totalClients > 0
                        ? (sellerStats.activeClients / sellerStats.totalClients) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Total Pedidos */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-20 w-20 rounded-full bg-indigo-500/5 blur-lg"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingCart className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Total Pedidos Tomados
              </p>
              <h3 className="text-xl font-bold text-neutral-800 mt-0.5">
                {sellerStats.totalOrders}
              </h3>
            </div>
          </div>
        </div>

        {/* Pedidos Atrasados (+2 días) */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-20 w-20 rounded-full bg-rose-500/5 blur-lg"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Clock className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Pedidos Atrasados (+2d)
              </p>
              <h3 className={`text-xl font-bold mt-0.5 ${sellerStats.delayedOrders > 0 ? "text-rose-600" : "text-neutral-800"}`}>
                {sellerStats.delayedOrders}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Secciones del Vendedor */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Clientes de su Cartera - Ocupa 2 Cols en Desktop */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-50">
            <Award className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-neutral-800">
              Tus Clientes con Más Compras (Mes Actual)
            </h3>
          </div>
          {sellerStats.topClients.length === 0 ? (
            <p className="text-xs text-neutral-400 mt-4 text-center py-8 font-medium">
              Ninguno de los clientes de tu cartera registra compras este mes.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-4.5">
              {sellerStats.topClients.map((client, index) => {
                const percentage = Math.round(
                  (client.spent / maxSpenderValue) * 100
                );
                return (
                  <div key={client.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-neutral-800 font-bold truncate max-w-[280px]">
                        {index + 1}. {client.name}
                      </span>
                      <span className="text-indigo-600 font-bold">
                        {formatCurrency(client.spent)}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Zonas de Trabajo del Vendedor - Ocupa 1 Col en Desktop */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-50">
            <MapPin className="h-5 w-5 text-indigo-500" />
            <h3 className="text-base font-bold text-neutral-800">
              Tus Zonas Asignadas
            </h3>
          </div>
          {sellerStats.sellerZonesList.length === 0 ? (
            <p className="text-xs text-neutral-400 mt-4 text-center py-6 font-medium">
              No tienes zonas de despacho asignadas actualmente.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-2.5">
              {sellerStats.sellerZonesList.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100/50 transition-colors"
                >
                  <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-800 truncate">
                    {zone.names}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
