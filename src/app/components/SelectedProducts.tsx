import { Button } from "@/components/ui/button";
import { useProductQuery } from "../querys/useProduct.query";
import { useNewVentaStore } from "../store/controladorNewVenta.store";
import { SpinnerGlobal } from "./SpinnerGlobal";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
      <div className='flex flex-col gap-1 max-h-48 overflow-auto'>
        {order!.details.map(
          (detail: { productId: number; cant: number }, index: number) => {
            const product = data?.find((p) => p.id === detail.productId);
            if (!product) return null;
            return (
              <Drawer key={index}>
                <DrawerTrigger>
                  <div className='flex justify-between items-center py-1 px-4 rounded-sm font-semibold border border-neutral-200 bg-white'>
                    <div className='flex justify-between w-full'>
                      <div className='flex flex-col'>
                        <span>{product.name}</span>
                        <span className='text-neutral-600 text-sm'>
                          {detail.cant} x {product.price}$
                        </span>
                      </div>
                      <span className='text-xl self-end'>
                        {detail.cant * product.price}$
                      </span>
                    </div>
                  </div>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Eliminar Producto de la orden</DrawerTitle>
                    <DrawerDescription>
                      Quieres eliminar este detalle de la orden actual?
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <button
                      onClick={() => deleteDetailFromOrder!(index)}
                      className='bg-sky-700 p-2 rounded-sm text-white'
                    >
                      Eliminar
                    </button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            );
          }
        )}
      </div>
    </div>
  );
}
