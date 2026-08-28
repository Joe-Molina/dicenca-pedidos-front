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
              .map((product) => {
                const stock = product.stock ?? 0;
                return (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    <div className="flex items-center justify-between w-full gap-2">
                      <span>{product.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        stock === 0
                          ? "bg-red-100 text-red-700"
                          : stock <= 10
                          ? "bg-amber-100 text-amber-800"
                          : "bg-neutral-100 text-neutral-600"
                      }`}>
                        {stock === 0 ? "Agotado" : `${stock} ${stock === 1 ? "bulto" : "bultos"}`}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
