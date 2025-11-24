"use client";

import { Button } from "@/components/ui/button";
import { SelectSeller } from "./components/SelectSeller";
import Link from "next/link";
// import { useSellersQuery } from "./querys/useSellers.query";

export default function Home() {
  return (
    <div className='flex h-full w-full flex-col gap-2 p-8'>
      <SelectSeller />
      <Button>
        <Link href={"/create/seller"}>Administrar Vendedores</Link>
      </Button>
      <Button>
        <Link href={"/create/zone"}>Administrar Zonas</Link>
      </Button>
    </div>
  );
}
