"use client";

import { SelectSeller } from "./components/SelectSeller";
// import { useSellersQuery } from "./querys/useSellers.query";

export default function Home() {
  return (
    <div className='flex h-full w-full flex-col gap-2 p-8'>
      <SelectSeller />
    </div>
  );
}
