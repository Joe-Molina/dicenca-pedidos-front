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
export function SelectZoneSeller() {
  const {
    query: { data: zones, isLoading },
  } = useZonesQuery();

  const { setZone, setSeller } = useNewVentaStore();
  const { user, isAuthenticated } = useAuthStore();
  console.log(user);

  if (isLoading || !isAuthenticated || !user) {
    return <SpinnerGlobal />;
  }

  return (
    <div className='flex flex-col gap-1'>
      <Label>Zona:</Label>
      <Select
        onValueChange={(value) => {
          setSeller(user!);
          setZone(zones!.find((zone) => zone.id == Number(value))!);
        }}
      >
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Selecciona una zona' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>zonas</SelectLabel>
            {zones!
              .filter((zone) => zone.userId == user!.id)
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
