"use client";

import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SpinnerGlobal } from "@/app/components/SpinnerGlobal";
import { useZonesQuery } from "@/app/querys/useZones.query";
import { useNewVentaStore } from "@/app/store/controladorNewVenta.store";
import { useAuthStore } from "@/app/store/useAuthStore";
import { MapPin } from "lucide-react";

export function SelectZoneSeller() {
  const {
    query: { data: zones, isLoading },
  } = useZonesQuery();

  const { setZone, setSeller, zone: selectedZone, seller } = useNewVentaStore();
  const { user, isAuthenticated } = useAuthStore();

  // Asegurar que el vendedor asignado sea el usuario conectado
  useEffect(() => {
    if (user && (!seller || seller.id !== user.id)) {
      setSeller(user);
    }
  }, [user, seller, setSeller]);

  if (isLoading || !isAuthenticated || !user) {
    return <SpinnerGlobal />;
  }

  const sellerZones = zones ? zones.filter((zone) => zone.userId == user.id) : [];

  return (
    <div className='flex flex-col gap-1.5'>
      <Label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
        <MapPin className="size-3.5 text-blue-600" />
        Zona de Despacho Asignada
      </Label>
      <Select
        value={selectedZone?.id ? selectedZone.id.toString() : undefined}
        onValueChange={(value) => {
          setSeller(user);
          setZone(zones!.find((zone) => zone.id == Number(value))!);
        }}
      >
        <SelectTrigger className='w-full border-neutral-200 rounded-xl bg-white shadow-xs text-xs h-10'>
          <SelectValue placeholder='Selecciona tu zona...' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tus Zonas Asignadas</SelectLabel>
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
