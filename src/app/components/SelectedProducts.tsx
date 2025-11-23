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
    <div className='flex flex-col gap-2 mt-4'>
      <h2 className='text-lg font-semibold'>Productos Seleccionados:</h2>
      <div className='flex flex-col gap-1 max-h-64 overflow-auto'>
        {order!.details.map(
          (detail: { productId: number; cant: number }, index: number) => {
            const product = data?.find((p) => p.id === detail.productId);
            if (!product) return null;
            return (
              <div
                key={index}
                className='flex justify-between items-center py-1 px-4 rounded-xl font-semibold border border-neutral-200'
              >
                <div className="flex flex-col ">
                  <span>{product.name}</span>
                  <span className="text-neutral-600 text-sm">
                    {detail.cant} x {product.price}$
                  </span>
                  <span className="text-2xl">{detail.cant * product.price}$</span>
                </div>
                <button onClick={() => deleteDetailFromOrder!(index)} className="bg-white p-2 rounded-sm">
                  <Trash color='red' size={25} />
                </button>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
