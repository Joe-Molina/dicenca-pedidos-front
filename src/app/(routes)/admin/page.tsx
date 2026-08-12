"use client";

import React, { useMemo } from "react";
import { format } from "@formkit/tempo";
import { useOrdersQuery } from "@/app/querys/useOrders.query";
import { useClientsQuery } from "@/app/querys/useClients.query";
import { useProductQuery } from "@/app/querys/useProduct.query";
import { SpinnerGlobal } from "@/app/components/SpinnerGlobal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Package,
  Clock,
  AlertTriangle,
  Award,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CircleDollarSign,
} from "lucide-react";
import { formatCurrency } from "@/app/components/utils/FormatPrice";
import OrderCard from "./components/OrderCard";

export default function AdminDashboard() {
  const { data: orders, isLoading: ordersLoading } = useOrdersQuery();
  const {
    query: { data: clients, isLoading: clientsLoading },
  } = useClientsQuery();
  const {
    query: { data: products, isLoading: productsLoading },
  } = useProductQuery();

  const isLoading = ordersLoading || clientsLoading || productsLoading;

  // 1. Cálculo de Ventas y Pedidos de HOY
  const todayStats = useMemo(() => {
    if (!orders) return { sales: 0, count: 0 };
    const today = new Date().toDateString();
    
    // Filtramos las órdenes creadas el día de hoy
    const todayOrders = orders.filter(
      (order) => new Date(order.createdAt).toDateString() === today
    );

    const sales = todayOrders.reduce((acc, order) => {
      const orderTotal = order.orderDetails?.reduce(
        (sum, item) => sum + item.total,
        0
      ) || 0;
      return acc + orderTotal;
    }, 0);

    return {
      sales,
      count: todayOrders.length,
    };
  }, [orders]);

  // 2. Cálculo de Pedidos Pendientes
  const pendingOrders = useMemo(() => {
    if (!orders) return [];
    // Pendiente significa que status es false
    return orders.filter((order) => !order.status);
  }, [orders]);

  // 3. Cálculo de Pedidos Atrasados (más de 2 días sin despachar/pendientes)
  const delayedOrders = useMemo(() => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    return pendingOrders.filter(
      (order) => new Date(order.createdAt).getTime() < twoDaysAgo
    );
  }, [pendingOrders]);

  // 4. Cálculo de Productos Más y Menos Vendidos (acumulando cantidades)
  const productPerformances = useMemo(() => {
    if (!orders || !products) return { top: [], least: null };

    // Inicializar mapa de cantidades por producto en 0
    const salesMap: { [productId: number]: number } = {};
    products.forEach((p) => {
      salesMap[p.id] = 0;
    });

    // Acumular cantidades vendidas
    orders.forEach((order) => {
      order.orderDetails?.forEach((detail) => {
        const pid = detail.productId;
        if (salesMap[pid] !== undefined) {
          salesMap[pid] += detail.cant;
        } else {
          salesMap[pid] = detail.cant;
        }
      });
    });

    // Mapear los productos con sus nombres
    const list = Object.entries(salesMap).map(([id, qty]) => {
      const prod = products.find((p) => p.id === Number(id));
      return {
        id: Number(id),
        name: prod?.name || `Producto #${id}`,
        quantity: qty,
        price: prod?.price || 0,
      };
    });

    // Ordenar de mayor a menor cantidad vendida
    const sorted = [...list].sort((a, b) => b.quantity - a.quantity);
    const top = sorted.slice(0, 5); // Top 5 más vendidos

    // Producto menos vendido: del catálogo completo, el que tiene la menor cantidad acumulada
    const least = sorted.length > 0 ? sorted[sorted.length - 1] : null;

    return { top, least };
  }, [orders, products]);

  // 5. Cálculo de Top Clientes de este Mes (según monto comprado)
  const topClientsThisMonth = useMemo(() => {
    if (!orders || !clients) return [];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spentMap: { [clientId: number]: number } = {};
    clients.forEach((c) => {
      spentMap[c.id] = 0;
    });

    // Acumular totales de compras en el mes actual
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const isThisMonth =
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear;

      if (isThisMonth) {
        const orderTotal =
          order.orderDetails?.reduce((sum, item) => sum + item.total, 0) || 0;
        const cid = order.clientId;
        if (spentMap[cid] !== undefined) {
          spentMap[cid] += orderTotal;
        } else {
          spentMap[cid] = orderTotal;
        }
      }
    });

    // Mapear y ordenar clientes que compraron este mes
    return Object.entries(spentMap)
      .map(([id, spent]) => {
        const client = clients.find((c) => c.id === Number(id));
        return {
          id: Number(id),
          companyName: client?.company_name || client?.name || `Cliente #${id}`,
          rif: client?.rif || "",
          spent,
        };
      })
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5); // Top 5 clientes del mes
  }, [orders, clients]);

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  // Máximo gasto de cliente este mes para cálculo de barra de porcentaje
  const maxSpenderValue = topClientsThisMonth[0]?.spent || 1;

  return (
    <div className='flex min-h-screen w-full flex-col gap-6 bg-neutral-50/50 p-4 md:p-8'>
      {/* Cabecera y Fecha */}
      <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
        <div>
          <h1 className='bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent'>
            Panel General
          </h1>
          <p className='text-sm font-medium text-neutral-500 capitalize'>
            {format(new Date(), "full")}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Link href='/admin/order'>
            <Button className='bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl text-xs gap-1.5 shadow-sm'>
              Crear Nuevo Pedido
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de Tarjetas Estadísticas */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Ventas Globales de Hoy */}
        <div className='relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md'>
          <div className='absolute top-0 right-0 -mr-4 -mt-4 h-20 w-20 rounded-full bg-blue-500/5 blur-lg'></div>
          <div className='flex items-center gap-4'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600'>
              <CircleDollarSign className='h-5.5 w-5.5' />
            </div>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-wider text-neutral-400'>
                Ventas de Hoy
              </p>
              <h3 className='text-xl font-bold text-neutral-800 mt-0.5'>
                {formatCurrency(todayStats.sales)}
              </h3>
            </div>
          </div>
        </div>

        {/* Pedidos Totales de Hoy */}
        <div className='relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md'>
          <div className='absolute top-0 right-0 -mr-4 -mt-4 h-20 w-20 rounded-full bg-indigo-500/5 blur-lg'></div>
          <div className='flex items-center gap-4'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600'>
              <Package className='h-5.5 w-5.5' />
            </div>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-wider text-neutral-400'>
                Pedidos de Hoy
              </p>
              <h3 className='text-xl font-bold text-neutral-800 mt-0.5'>
                {todayStats.count}
              </h3>
            </div>
          </div>
        </div>

        {/* Total Pedidos Pendientes */}
        <div className='relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md'>
          <div className='absolute top-0 right-0 -mr-4 -mt-4 h-20 w-20 rounded-full bg-amber-500/5 blur-lg'></div>
          <div className='flex items-center gap-4'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600'>
              <Clock className='h-5.5 w-5.5' />
            </div>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-wider text-neutral-400'>
                Pedidos Pendientes
              </p>
              <h3 className='text-xl font-bold text-neutral-800 mt-0.5'>
                {pendingOrders.length}
              </h3>
            </div>
          </div>
        </div>

        {/* Pedidos Atrasados (+2 días) */}
        <div className='relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md'>
          <div className='absolute top-0 right-0 -mr-4 -mt-4 h-20 w-20 rounded-full bg-red-500/5 blur-lg'></div>
          <div className='flex items-center gap-4'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600'>
              <AlertTriangle className='h-5.5 w-5.5' />
            </div>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-wider text-neutral-400'>
                Pedidos Atrasados (+2d)
              </p>
              <h3 className='text-xl font-bold text-red-600 mt-0.5'>
                {delayedOrders.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Enlaces a listados de órdenes */}
      <div className='flex flex-col gap-3 sm:flex-row'>
        <Link href='/admin/order/pending' className='grow'>
          <Button className='w-full bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-xs shadow-xs'>
            Ver Pedidos Pendientes ({pendingOrders.length})
          </Button>
        </Link>
        <Button className='grow bg-neutral-800 hover:bg-neutral-900 font-bold rounded-xl text-xs shadow-xs'>
          Ver Pedidos Listos ({orders ? orders.length - pendingOrders.length : 0})
        </Button>
      </div>

      {/* Grid de Contenido Principal del Dashboard */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Columna Izquierda (Clientes del mes y Órdenes Recientes) - Ocupa 2 cols */}
        <div className='lg:col-span-2 flex flex-col gap-6'>
          {/* Top Clientes del Mes */}
          <div className='rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs'>
            <div className='flex items-center gap-2.5 pb-4 border-b border-neutral-50'>
              <Award className='h-5 w-5 text-amber-500' />
              <h3 className='text-base font-bold text-neutral-800'>
                Top Clientes del Mes (Compras Acumuladas)
              </h3>
            </div>
            {topClientsThisMonth.length === 0 ? (
              <p className='text-xs text-neutral-400 mt-4 text-center py-6 font-medium'>
                No se registran compras de clientes en el mes en curso.
              </p>
            ) : (
              <div className='mt-4 flex flex-col gap-4.5'>
                {topClientsThisMonth.map((client, index) => {
                  const percentage = Math.round(
                    (client.spent / maxSpenderValue) * 100
                  );
                  return (
                    <div key={client.id} className='flex flex-col gap-1.5'>
                      <div className='flex justify-between items-center text-xs font-semibold'>
                        <span className='text-neutral-800 font-bold truncate max-w-[280px]'>
                          {index + 1}. {client.companyName}
                        </span>
                        <span className='text-blue-600 font-bold'>
                          {formatCurrency(client.spent)}
                        </span>
                      </div>
                      <div className='w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden shadow-inner'>
                        <div
                          className='bg-blue-600 h-full rounded-full transition-all duration-500'
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pedidos Recientes */}
          <div className='flex flex-col gap-3.5'>
            <p className='text-lg font-bold text-neutral-800 px-1'>Pedidos Recientes</p>
            {orders && orders.length > 0 ? (
              <div className='flex flex-col gap-3.5'>
                {orders.slice(-5).reverse().map((order, index) => {
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
              <p className='text-xs text-neutral-400 text-center py-8 bg-white border rounded-2xl'>
                No hay pedidos registrados en el sistema.
              </p>
            )}
          </div>
        </div>

        {/* Columna Derecha (Productos más vendidos y menos vendidos) - Ocupa 1 col */}
        <div className='flex flex-col gap-6'>
          {/* Productos Más Vendidos */}
          <div className='rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs'>
            <div className='flex items-center gap-2.5 pb-4 border-b border-neutral-50'>
              <TrendingUp className='h-5 w-5 text-emerald-500' />
              <h3 className='text-base font-bold text-neutral-800'>
                Productos Más Vendidos
              </h3>
            </div>
            {productPerformances.top.length === 0 ? (
              <p className='text-xs text-neutral-400 mt-4 text-center py-6 font-medium'>
                No hay registros de productos vendidos.
              </p>
            ) : (
              <div className='mt-4 flex flex-col gap-4'>
                {productPerformances.top.map((item, index) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 transition-colors'
                  >
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold shrink-0'>
                        #{index + 1}
                      </div>
                      <span className='text-xs font-semibold text-neutral-800 truncate max-w-[130px]'>
                        {item.name}
                      </span>
                    </div>
                    <span className='inline-flex items-center rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-600'>
                      {item.quantity} unds
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Producto Menos Vendido */}
          <div className='rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs relative overflow-hidden'>
            <div className='absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-red-500/5 blur-md'></div>
            <div className='flex items-center gap-2.5 pb-4 border-b border-neutral-50'>
              <TrendingDown className='h-5 w-5 text-red-500' />
              <h3 className='text-base font-bold text-neutral-800'>
                Producto Menos Vendido
              </h3>
            </div>
            {productPerformances.least ? (
              <div className='mt-4 flex flex-col gap-3'>
                <div className='flex items-center gap-3.5'>
                  <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500'>
                    <ShoppingBag className='h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h4 className='truncate text-sm font-bold text-neutral-800'>
                      {productPerformances.least.name}
                    </h4>
                    <p className='text-[10px] text-neutral-500 font-semibold mt-0.5'>
                      Precio de lista: {formatCurrency(productPerformances.least.price)}
                    </p>
                  </div>
                </div>
                <div className='mt-2 flex items-center justify-between border-t border-neutral-50 pt-3'>
                  <span className='text-[10px] text-neutral-400 font-bold uppercase tracking-wider'>
                    Cantidad Vendida
                  </span>
                  <span className='inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600'>
                    {productPerformances.least.quantity} unidades
                  </span>
                </div>
              </div>
            ) : (
              <p className='text-xs text-neutral-400 mt-4 text-center py-6 font-medium'>
                No hay productos cargados en el catálogo.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
