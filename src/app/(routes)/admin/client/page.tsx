"use client";
import { useClientsQuery } from "@/app/querys/useClients.query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateClientDrawer from "../components/createClientDrawer";
import { useZonesQuery } from "@/app/querys/useZones.query";
import { toast } from "sonner";

export default function AdminClient() {
  const router = useRouter();
  const {
    query: { data, isLoading },
    deleteClientMutation,
  } = useClientsQuery();
  const {
    query: { data: zones, isLoading: zonesLoading },
  } = useZonesQuery();

  if (isLoading) {
    return <p>Cargando Clientes...</p>;
  }

  return (
    <div className="flex h-full w-full flex-col gap-2 p-4">
      <div className="flex justify-between items-center w-full h-10">
        <Button onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
      </div>
      <p>Clientes</p>
      <CreateClientDrawer />
      {isLoading ? (
        <p>Cargando Clientes... </p>
      ) : (
        <u>
          {data?.map((client, index) => {
            const zone = zones?.find((zone) => zone.id === client.zoneId);

            if (zonesLoading) {
              return <p key={index}>webo peluisimo</p>;
            }

            return (
              <li
                key={client.id}
                className="flex items-center  justify-between border-b py-2"
              >
                <div>
                  {client.name} - {zone?.names}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deleteClientMutation.mutateAsync(client.id, {
                      onSuccess: () => {
                        toast("Cliente eliminado exitosamente", {
                          description: new Date().toLocaleString(),
                        });
                      },
                    });
                  }}
                >
                  <Trash className="cursor-pointer" />
                </Button>
              </li>
            );
          })}
        </u>
      )}
    </div>
  );
}
