"use client";
import { format } from "@formkit/tempo";
import GlobalSales from "./components/GlobalSales";
import OrderCard from "./components/OrderCard";

export default function Home() {
  return (
    <div className='flex h-full w-full flex-col gap-5 p-4'>
      <div>
        <p className='text-2xl font-bold'>Panel General</p>
        <p className='text-sm text-neutral-600'>{format(new Date(), "full")}</p>
      </div>
      <GlobalSales />
      <div className='flex flex-col gap-2'>
        <p className='text-xl font-semibold'>Pedidos Recientes</p>
        <OrderCard clientName='mauricio' orderId={342} total={342} />
        <OrderCard clientName='gerardo' orderId={123} total={2745} />
        <OrderCard clientName='patricio' orderId={2365} total={1500} />
        <OrderCard clientName='diego' orderId={8865} total={1010} />
      </div>
    </div>
  );
}
