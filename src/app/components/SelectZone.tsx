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
import { useZonesQuery } from "../querys/useZones.query";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

export function SelectZone() {
  const {
    query: { data: zones, isLoading },
  } = useZonesQuery();

  const { setZone, seller, zone: selectedZone } = useNewVentaStore();

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  const sellerZones = zones ? zones.filter((zone) => zone.userId == seller?.id) : [];

  return (
    <div className='flex flex-col gap-1.5'>
      <Label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
        <MapPin className="size-3.5 text-blue-600" />
        Zona de Despacho
      </Label>
      <Select
        value={selectedZone?.id ? selectedZone.id.toString() : undefined}
        onValueChange={(value) =>
          setZone(zones!.find((zone) => zone.id == Number(value))!)
        }
      >
        <SelectTrigger className='w-full border-neutral-200 rounded-xl bg-white shadow-xs text-xs h-10'>
          <SelectValue placeholder='Selecciona una zona' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Zonas de este Vendedor</SelectLabel>
            {sellerZones.map((zone) => (
              <SelectItem key={zone.id} value={zone.id.toString()}>
                {zone.names}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
