"use client";
import { AddDetailButton } from "@/app/components/addDetail";
import { CreateOrderBtn } from "@/app/components/CreateOrderBtn";
import { SelectClient } from "@/app/components/SelectClient";
import { SelectedProducts } from "@/app/components/SelectedProducts";
import { TotalSpan } from "@/app/components/TotalSpan";
import { useNewVentaStore } from "@/app/store/controladorNewVenta.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { SelectZoneSeller } from "./components/SelectZoneSeller";

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  console.log("Seller ID:", id);
  const { zone, client, order, setOrderNote, reset } = useNewVentaStore();

  return (
    <div className='flex flex-col h-full w-full gap-2 border-neutral-300 p-3'>
      <div className='flex justify-between items-center w-full h-10'>
        <Button className='' onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <Button onClick={reset} className=''>
          Reset Orden
        </Button>
      </div>
      <div className='flex flex-col w-full gap-2'>
        <p className='font-semibold text-2xl'>Crear Nuevo Pedido</p>
        <SelectZoneSeller />
        {zone && <SelectClient />}
        {client && (
          <div className='flex flex-col gap-1'>
            <Label>Nota:</Label>
            <Input
              className='border border-neutral-200 h-14'
              type='text'
              onChange={(e) => setOrderNote(e.target.value)}
            />
          </div>
        )}
        {client && <AddDetailButton />}
        {order && order.details && order.details.length > 0 && (
          <SelectedProducts />
        )}
      </div>
      <div className='flex flex-col gap-2 w-full fixed bottom-0 z-50 right-0 left-0 p-3 bg-white border-t border-neutral-300'>
        {order && order.details && order.details.length > 0 && <TotalSpan />}
        {order && order.details && order.details.length > 0 && (
          <CreateOrderBtn />
        )}
      </div>
    </div>
  );
}
