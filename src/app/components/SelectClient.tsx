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
export function SelectClient() {
  const {
    query: { data: clients, isLoading },
  } = useClientsQuery();

  const { setClient, zone } = useNewVentaStore();

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  return (
    <div className='flex flex-col gap-1'>
      <Label>Cliente:</Label>
      <Select
        onValueChange={(value) =>
          setClient(clients!.find((client) => client.id == Number(value))!)
        }
      >
        <SelectTrigger className='w-full '>
          <SelectValue placeholder='Selecciona un Cliente' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Clientes</SelectLabel>
            {clients!
              .filter((client) => client.zoneId == zone!.id)
              .map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.cod_sunagro}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
