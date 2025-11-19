"use client";

import { SelectClient } from "./components/SelectClient";
import { SelectSeller } from "./components/SelectSeller";
import { SelectZone } from "./components/SelectZone";
// import { useSellersQuery } from "./querys/useSellers.query";
import { useNewVentaStore } from "./store/controladorNewVenta.store";

export default function Home() {
  const { seller, zone, client, order } = useNewVentaStore();

  return (
    <div className='flex h-full w-full flex-col gap-2 border-zinc-600 text-white p-8'>
      <SelectSeller />
      {seller && <SelectZone />}
      {zone && <SelectClient />}

      {client && <button onClick={() => console.log(order)}>ver</button>}
    </div>
  );
}
