"use client";
import { format } from "@formkit/tempo";
import GlobalSales from "./components/GlobalSales";
import OrderCard from "./components/OrderCard";
import { useOrdersQuery } from "@/app/querys/useOrders.query";
import { SpinnerGlobal } from "@/app/components/SpinnerGlobal";
import { useClientsQuery } from "@/app/querys/useClients.query";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data, isLoading } = useOrdersQuery();
  const {
    query: { data: clients, isLoading: clientIsLoadding },
  } = useClientsQuery();

  const globalSales = () => {
    const sales = data?.map((order) => {
      return order.orderDetails.reduce(
        (acc, current) => acc + current.total,
        0
      );
    });

    const globalSales = sales?.reduce((acc, current) => acc + current, 0);

    return globalSales;
  };

  return (
    <div className='flex h-full w-full flex-col gap-5 p-4'>
      <div>
        <p className='text-2xl font-bold'>Panel General</p>
        <p className='text-sm text-neutral-600'>{format(new Date(), "full")}</p>
      </div>
      {data && (
        <GlobalSales globalSales={globalSales()!} totalOrders={data.length} />
      )}
      <div className='flex justify-between gap-2'>
        <Button className='grow bg-sky-700'>pedidos pendientes</Button>
        <Button className='grow bg-sky-700'>pedidos listos</Button>
      </div>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <p className='text-xl font-semibold'>Pedidos Recientes</p>
          <span className='px-2 py-1 bg-red-300 text-red-800 font-semibold rounded-2xl'>
            Pedidos Pendientes {data && data.length}
          </span>
        </div>
        {isLoading || clientIsLoadding || !data ? (
          <SpinnerGlobal />
        ) : (
          data!.map((order, index) => {
            const client = clients!.find(
              (client) => client.id == order.clientId
            );
            const orderTotal = order.orderDetails.reduce(
              (acc, current) => acc + current.total,
              0
            );

            return (
              <OrderCard
                key={index}
                clientName={client!.company_name}
                orderId={order.id}
                note={order.notes}
                total={orderTotal}
                status={order.status}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
