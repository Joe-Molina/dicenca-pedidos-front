"use client";

// import { SelectSeller } from "@/app/components/SelectSeller";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { useSellersQuery } from "./querys/useSellers.query";

export default function Home() {
  return (
    <div className='flex h-full w-full flex-col gap-2 p-8'>
      {/* <SelectSeller /> */}
      <h1>Panel Administrativo</h1>
      <Button>
        <Link href={"admin/seller"}>Administrar Vendedores</Link>
      </Button>
      <Button>
        <Link href={"admin/zone"}>Administrar Zonas</Link>
      </Button>
      <Button>
        <Link href={"admin/client"}>Administrar Clientes</Link>
      </Button>
      <Button>
        <Link href={"admin/order"}>Crear nueva orden</Link>
      </Button>
    </div>
  );
}
