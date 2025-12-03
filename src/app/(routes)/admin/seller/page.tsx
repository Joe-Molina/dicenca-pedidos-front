"use client";

import CreateSellerDrawer from "../components/CreateSellerDrawer";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useSellersQuery } from "@/app/querys/useSellers.query";
import { toast } from "sonner";

export default function Home() {
  const {
    query: { data, isLoading },
    deleteSellerMutation,
  } = useSellersQuery();

  if (isLoading) {
    return <p>Cargando vendedores...</p>;
  }

  return (
    <div className='flex h-full w-full flex-col gap-2 p-4'>
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
                {seller.name} - {seller.username}
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
