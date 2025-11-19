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
export function SelectZone() {
  const {
    query: { data: zones, isLoading },
  } = useZonesQuery();

  const { setZone, seller } = useNewVentaStore();

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  console.log(zones);

  return (
    <Select
      onValueChange={(value) =>
        setZone(zones!.find((zone) => zone.id == Number(value))!)
      }
    >
      <SelectTrigger className='w-full bg-zinc-800'>
        <SelectValue placeholder='Selecciona una zona' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>zonas</SelectLabel>
          {zones!
            .filter((zone) => zone.vendedorId == seller?.id)
            .map((zone) => (
              <SelectItem key={zone.id} value={zone.id.toString()}>
                {zone.names}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
