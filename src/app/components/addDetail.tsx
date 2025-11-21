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

export function AddDetailButton() {
  const { portfolio, product, productQuantity, resetData } =
    useAddProductStore();

  const { addDetailToOrder } = useNewVentaStore();

  return (
    <Drawer>
      <DrawerTrigger className='bg-neutral-900 border border-neutral-950 py-2 rounded-sm '>
        Agregar Producto
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
          className='bg-neutral-800 py-2 rounded-sm hover:bg-neutral-900 flex justify-center items-center gap-2 w-60 mx-auto mt-4'
        >
          <p className='text-white '>Agregar producto</p>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
