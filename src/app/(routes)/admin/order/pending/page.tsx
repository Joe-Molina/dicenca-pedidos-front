"use client";
import { useOrdersQuery } from "@/app/querys/useOrders.query";
import { SpinnerGlobal } from "@/app/components/SpinnerGlobal";
import { useClientsQuery } from "@/app/querys/useClients.query";
import OrderCard from "../../components/OrderCard";

export default function Home() {
  const { data, isLoading } = useOrdersQuery();
  const {
    query: { data: clients, isLoading: clientIsLoadding },
  } = useClientsQuery();

  return (
    <div className='flex h-full w-full flex-col gap-5 p-4'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <p className='text-xl font-semibold'>Pedidos Pendientes</p>
          <span className='px-2 py-1 bg-red-300 text-red-800 font-semibold rounded-2xl'>
            Total {data && data.length}
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
