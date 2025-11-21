import { Trash } from "lucide-react";
import { useProductQuery } from "../querys/useProduct.query";
import { useNewVentaStore } from "../store/controladorNewVenta.store";
import { SpinnerGlobal } from "./SpinnerGlobal";

export function SelectedProducts() {
  const {
    query: { data, isLoading },
  } = useProductQuery();
  const { order, deleteDetailFromOrder } = useNewVentaStore();

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  return (
    <>
      <div className='flex flex-col gap-2 mt-4'>
        <h2 className='text-lg font-semibold'>Productos Seleccionados:</h2>
        <div className='flex flex-col gap-1'>
          {order!.details.map(
            (detail: { productId: number; cant: number }, index: number) => {
              const product = data?.find((p) => p.id === detail.productId);
              if (!product) return null;
              return (
                <div
                  key={index}
                  className='flex justify-between bg-neutral-700 p-2 rounded'
                >
                  <span>{product.name}:</span>
                  <span>
                    {detail.cant} x {product.price}$
                  </span>
                  <span>{detail.cant * product.price}$</span>
                  <button onClick={() => deleteDetailFromOrder!(index)}>
                    <Trash color='#7b1919' />
                  </button>
                </div>
              );
            }
          )}
        </div>
      </div>
    </>
  );
}
