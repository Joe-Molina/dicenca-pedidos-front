"use client";
import { AddDetailButton } from "@/app/components/addDetail";
import { CreateOrderBtn } from "@/app/components/CreateOrderBtn";
import { SelectClient } from "@/app/components/SelectClient";
import { SelectedProducts } from "@/app/components/SelectedProducts";
// import { SelectSeller } from "@/app/components/SelectSeller";
import { SelectZone } from "@/app/components/SelectZone";
import { TotalSpan } from "@/app/components/TotalSpan";
import { useNewVentaStore } from "@/app/store/controladorNewVenta.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  console.log("Seller ID:", id);
  const { seller, zone, client, order, setOrderNote, reset } =
    useNewVentaStore();

  return (
    <div className='flex h-full w-full flex-col gap-2 border-neutral-900 text-white p-3'>
      <div className='flex justify-between items-center w-full h-10'>
        <Button onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <Button onClick={reset}>Reset Orden</Button>
      </div>
      {/* <SelectSeller /> */}
      <p className='border-b border-neutral-700'>Crear Nuevo Pedido</p>
      {seller && <SelectZone />}
      {zone && <SelectClient />}
      {client && <AddDetailButton />}
      {client && (
        <div className='flex flex-col gap-1'>
          <Label>Nota:</Label>
          <Input
            className='bg-neutral-900 border-none'
            type='text'
            onChange={(e) => setOrderNote(e.target.value)}
          />
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
