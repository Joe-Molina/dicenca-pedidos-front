import { useProductQuery } from "../querys/useProduct.query";
import { useNewVentaStore } from "../store/controladorNewVenta.store";
import { OrderDetailsProps } from "../types/types";
import { SpinnerGlobal } from "./SpinnerGlobal";

export function TotalSpan() {
  const {
    query: { data, isLoading },
  } = useProductQuery();

  const { order } = useNewVentaStore();

  const total = order?.details.reduce(
    (totalAcc: number, detail: OrderDetailsProps) => {
      const product = data?.find((p) => p.id === detail.productId);
      if (!product) return totalAcc;
      return totalAcc + detail.cant * product.price;
    },
    0
  );

  if (isLoading) {
    return <SpinnerGlobal />;
  }

  return (
    <div className='flex justify-end bg-neutral-950 border border-neutral-800 p-2 rounded-sm font-bold text-lg'>
      Total: {total} $
    </div>
  );
}
