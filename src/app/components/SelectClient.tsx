"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNewVentaStore } from "../store/controladorNewVenta.store";
import { SpinnerGlobal } from "./SpinnerGlobal";
import { useClientsQuery } from "../querys/useClients.query";
import { Label } from "@/components/ui/label";
import { Building2, Phone, MapPin, Barcode } from "lucide-react";

export function SelectClient() {
  const {
    query: { data: clients, isLoading },
  } = useClientsQuery();

  const { setClient, zone, client: selectedClient } = useNewVentaStore();

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  const zoneClients = clients ? clients.filter((client) => client.zoneId == zone?.id) : [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
          <Building2 className="size-3.5 text-blue-600" />
          Cliente (Razón Social)
        </Label>
        <Select
          value={selectedClient?.id ? selectedClient.id.toString() : undefined}
          onValueChange={(value) =>
            setClient(clients!.find((client) => client.id == Number(value))!)
          }
        >
          <SelectTrigger className="w-full border-neutral-200 rounded-xl bg-white shadow-xs text-xs h-10">
            <SelectValue placeholder="Selecciona un Cliente..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Clientes de esta Zona</SelectLabel>
              {zoneClients.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.company_name} ({c.rif})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Tarjeta de información del cliente seleccionado */}
      {selectedClient && (
        <div className="p-3.5 bg-blue-50/40 rounded-2xl border border-blue-100 flex flex-col gap-1.5 animate-in fade-in duration-200">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-neutral-800">{selectedClient.company_name}</span>
            <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-blue-200 text-blue-800">
              {selectedClient.rif}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-600 pt-1 border-t border-blue-100/50">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3 text-blue-500 shrink-0" />
              <span className="truncate">{selectedClient.address || "Sin dirección"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="size-3 text-blue-500 shrink-0" />
              <span>
                {(() => {
                  const raw = selectedClient.contact ? String(selectedClient.contact).trim() : "";
                  if (!raw || raw === "0") return "Sin teléfono";
                  if (raw.length === 10 && !raw.startsWith("0")) return "0" + raw;
                  return raw;
                })()}
              </span>
            </div>
            {selectedClient.cod_sunagro && Number(selectedClient.cod_sunagro) !== 0 ? (
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <Barcode className="size-3 text-blue-500 shrink-0" />
                <span>Sunagro: <strong>{selectedClient.cod_sunagro}</strong></span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
