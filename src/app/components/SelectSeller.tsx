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
import { useSellersQuery } from "../querys/useSellers.query";
import { useNewVentaStore } from "../store/controladorNewVenta.store";
import { SpinnerGlobal } from "./SpinnerGlobal";
import { Label } from "@/components/ui/label";
import { UserCheck } from "lucide-react";

export function SelectSeller() {
  const {
    query: { data: sellers, isLoading },
  } = useSellersQuery();

  const { setSeller, seller: selectedSeller } = useNewVentaStore();

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  return (
    <div className='flex flex-col gap-1.5'>
      <Label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
        <UserCheck className="size-3.5 text-blue-600" />
        Vendedor Asignado
      </Label>
      <Select
        value={selectedSeller?.id ? selectedSeller.id.toString() : undefined}
        onValueChange={(value) => {
          setSeller(sellers!.find((s) => s.id.toString() === value)!);
        }}
      >
        <SelectTrigger className='w-full border-neutral-200 rounded-xl bg-white shadow-xs text-xs h-10'>
          <SelectValue placeholder='Selecciona un vendedor' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Vendedores</SelectLabel>
            {sellers!.map((seller) => (
              <SelectItem key={seller.id} value={seller.id.toString()}>
                {seller.name} {seller.lastname}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
