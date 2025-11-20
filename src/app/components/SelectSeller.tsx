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
export function SelectSeller() {
  const {
    query: { data: sellers, isLoading },
  } = useSellersQuery();

  const { setSeller } = useNewVentaStore();

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  return (
    <div className='flex flex-col gap-1'>
      <Label>Vendedor:</Label>
      <Select
        onValueChange={(value) =>
          setSeller(sellers!.find((seller) => seller.id == Number(value))!)
        }
      >
        <SelectTrigger className='w-full bg-zinc-800'>
          <SelectValue placeholder='Selecciona un vendedor' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Vendedores</SelectLabel>
            {sellers!.map((seller) => (
              <SelectItem key={seller.id} value={seller.id.toString()}>
                {seller.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
