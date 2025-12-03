import { useAddProductStore } from "@/app/store/addProduct.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SelectCantProduct() {
  const { setProductQuantity, product, productQuantity } = useAddProductStore();
  return (
    <div className=''>
      <div className='w-full flex flex-col gap-2'>
        <Label>Cantidad del producto</Label>
        <div className='flex gap-2 items-center'>
          <Input
            type='number'
            className='w-16'
            onChange={(e) => setProductQuantity(Number(e.target.value))}
          />
          <span>x$</span>
          <span>
            {product!.price} = {productQuantity * product!.price}$
          </span>
        </div>
      </div>
    </div>
  );
}
