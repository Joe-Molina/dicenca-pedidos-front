"use client";

import { Input } from "@/components/ui/input";
import { AddDetailButton } from "./components/addDetail";
import { SelectClient } from "./components/SelectClient";
import { SelectSeller } from "./components/SelectSeller";
import { SelectZone } from "./components/SelectZone";
// import { useSellersQuery } from "./querys/useSellers.query";
import { useNewVentaStore } from "./store/controladorNewVenta.store";
import { Label } from "@/components/ui/label";
import { SelectedProducts } from "./components/SelectedProducts";
import { TotalSpan } from "./components/TotalSpan";
import { CreateOrderBtn } from "./components/CreateOrderBtn";

export default function Home() {
  const { seller, zone, client, order, setOrderNote } = useNewVentaStore();

  return (
    <div className='flex h-full w-full flex-col gap-2 border-zinc-600 text-white p-8'>
      <SelectSeller />
      {seller && <SelectZone />}
      {zone && <SelectClient />}
      {client && <AddDetailButton />}
      {client && (
        <div className='flex flex-col gap-1'>
          <Label>Nota:</Label>
          <Input type='text' onChange={(e) => setOrderNote(e.target.value)} />
        </div>
      )}
      {order && order.details && order.details.length > 0 && (
        <SelectedProducts />
      )}
      {order && order.details && order.details.length > 0 && <TotalSpan />}
      {order && order.details && order.details.length > 0 && <CreateOrderBtn />}
    </div>
  );
}
