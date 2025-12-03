import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePortfolioQuery } from "@/app/querys/usePortfolio.query";
import { SpinnerGlobal } from "../SpinnerGlobal";
import { useAddProductStore } from "@/app/store/addProduct.store";
import { Label } from "@/components/ui/label";

export function SelectPortfolioBtn() {
  const {
    query: { data: portfolios, isLoading },
  } = usePortfolioQuery();

  const { setPortfolio } = useAddProductStore();

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  return (
    <div className='flex flex-col gap-1'>
      <Label className=''>Portafolio:</Label>
      <Select
        onValueChange={(value) =>
          setPortfolio(
            portfolios!.find((portfolio) => portfolio.id == Number(value))!
          )
        }
      >
        <SelectTrigger className='w-full '>
          <SelectValue placeholder='Selecciona un portafolio' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Portafolios</SelectLabel>
            {portfolios!.map((portfolio) => (
              <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                {portfolio.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
