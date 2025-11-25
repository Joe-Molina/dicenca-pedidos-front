"use client";
import { useClientsQuery } from "@/app/querys/useClients.query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import CreateClientDrawer from "../components/createClientDrawer";

export default function AdminClient() {
  const router = useRouter();
  const {
    query: { data, isLoading },
    deleteClientMutation,
  } = useClientsQuery();

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
    </div>
  );
}
