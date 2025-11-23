import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SelectPortfolioBtn } from "./addProduct/selectPortfolio";
import { useAddProductStore } from "../store/addProduct.store";
import { SelectProductBtn } from "./addProduct/selectProduct";
import { SelectCantProduct } from "./addProduct/selectCantProduct";
import { useNewVentaStore } from "../store/controladorNewVenta.store";
import { Plus } from "lucide-react";

export function AddDetailButton() {
  const { portfolio, product, productQuantity, resetData } =
    useAddProductStore();

  const { addDetailToOrder } = useNewVentaStore();

  return (
    <Drawer>
      <DrawerTrigger className='flex  justify-center items-center gap-2
       p-2  rounded-sm font-medium bg-neutral-950 text-neutral-100'>
        <Plus size={17} />
        <p className="text-sm">Agregar Producto</p>
      </DrawerTrigger>
      <DrawerContent className='dark h-[400px]'>
        <DrawerHeader>
          <DrawerTitle>
            Escoje un portafolio y un producto para agregar
          </DrawerTitle>
          <div className='mt-4 flex flex-col gap-3'>
            <SelectPortfolioBtn />
            {portfolio && <SelectProductBtn />}
            {product && <SelectCantProduct />}
          </div>
        </DrawerHeader>
        <DrawerClose
          onClick={() => {
            addDetailToOrder({
              cant: productQuantity,
              productId: product!.id,
            });
            resetData();
          }}
          className='bg-neutral-50 py-2 rounded-sm hover:bg-neutral-900 flex justify-center items-center gap-2 w-60 mx-auto mt-4'
        >
          <p className=' font-semibold'>Agregar producto</p>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
