"use client";

import { Package, User } from "lucide-react";
import { useNewVentaStore } from "../../store/controladorNewVenta.store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Seller() {
  const { seller } = useNewVentaStore();

  const router = useRouter();

  if (!seller) {
    router.push("/");
  }

  return (
    <div className='flex h-full w-full flex-col gap-2 border-neutral-600 p-3 '>
      <div className='flex justify-between items-center'>
        <div className='flex items-center  gap-3 p-1'>
          <Package size={20} />
          <div className='border px-2 py-1  rounded-sm border-neutral-300'>
            Historial de Pedidos
          </div>
        </div>
        <div className='flex px-3 py-1 gap-2 border rounded-sm border-neutral-300'>
          <User />
          {seller && <div>{seller.name}</div>}
        </div>
      </div>
      <Link href={"/sellers/new-order"} className='w-full'>
        <Button className=' w-full'>Crear nueva orden</Button>
      </Link>
    </div>
  );
}
