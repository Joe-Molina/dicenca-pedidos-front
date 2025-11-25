"use client";

import { useRouter } from "next/navigation";
import CreateSellerDrawer from "../components/CreateSellerDrawer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash } from "lucide-react";
import { useSellersQuery } from "@/app/querys/useSellers.query";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const {
    query: { data, isLoading },
    deleteSellerMutation,
  } = useSellersQuery();

  if (isLoading) {
    return <p>Cargando vendedores...</p>;
  }

  return (
    <div className='flex h-full w-full flex-col gap-2 p-4'>
      <div className='flex justify-between items-center w-full h-10'>
        <Button className='' onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
      </div>
      <p>Vendedores</p>
      <CreateSellerDrawer />
      {isLoading ? (
        <p>Cargando vendedores...</p>
      ) : (
        <ul>
          {data?.map((seller) => (
            <li
              key={seller.id}
              className='flex items-center  justify-between border-b py-2'
            >
              <div>
                {seller.name} - {seller.contact}
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                  deleteSellerMutation.mutateAsync(seller.id, {
                    onSuccess: () => {
                      toast("Vendedor eliminado exitosamente", {
                        description: new Date().toLocaleString(),
                      });
                    },
                  });
                }}
              >
                <Trash className='cursor-pointer' />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
