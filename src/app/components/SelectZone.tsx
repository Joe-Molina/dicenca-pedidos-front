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
export function SelectZone() {
  const {
    query: { data: zones, isLoading },
  } = useZonesQuery();

  const { setZone, seller } = useNewVentaStore();

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  return (
    <div className='flex flex-col gap-1'>
      <Label>Zona:</Label>
      <Select
        onValueChange={(value) =>
          setZone(zones!.find((zone) => zone.id == Number(value))!)
        }
      >
        <SelectTrigger className='w-full'>
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
    </div>
  );
}
