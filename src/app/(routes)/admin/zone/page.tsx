"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash } from "lucide-react";
import { toast } from "sonner";
import { useZonesQuery } from "@/app/querys/useZones.query";
import { useSellersQuery } from "@/app/querys/useSellers.query";
import CreateZoneDrawer from "../components/CreateZoneDrawer";

export default function Home() {
  const router = useRouter();
  const {
    query: { data, isLoading },
    deleteZoneMutation,
  } = useZonesQuery();
  const {
    query: { data: sellers, isLoading: sellersLoading },
  } = useSellersQuery();
  return (
    <div className='flex h-full w-full flex-col gap-2 p-4'>
      <div className='flex justify-between items-center w-full h-10'>
        <Button className='' onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
      </div>
      <p>Zonas</p>
      <CreateZoneDrawer />
      {isLoading ? (
        <p>Cargando Zonas...</p>
      ) : (
        <ul>
          {data?.map((zone, index) => {
            const seller = sellers?.find((seller) => seller.id === zone.userId);

            if (sellersLoading) {
              return <p key={index}>Cargando vendedores...</p>;
            }

            return (
              <li
                key={zone.id}
                className='flex items-center  justify-between border-b py-2'
              >
                <div>
                  {zone.names} - {seller?.name}
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => {
                    deleteZoneMutation.mutateAsync(zone.id, {
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
