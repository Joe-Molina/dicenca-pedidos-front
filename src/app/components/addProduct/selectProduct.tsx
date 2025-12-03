import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductQuery } from "@/app/querys/useProduct.query";
import { SpinnerGlobal } from "../SpinnerGlobal";
import { useAddProductStore } from "@/app/store/addProduct.store";
import { Label } from "@/components/ui/label";

export function SelectProductBtn() {
  const {
    query: { data: products, isLoading },
  } = useProductQuery();

  const { portfolio, setProduct } = useAddProductStore();

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  return (
    <div className='flex flex-col gap-1'>
      <Label className=''>Producto:</Label>
      <Select
        onValueChange={(value) =>
          setProduct(products!.find((product) => product.id == Number(value))!)
        }
      >
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Selecciona un producto' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>producto</SelectLabel>
            {products!
              .filter((product) => product.portafolioId == portfolio?.id)
              .map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
