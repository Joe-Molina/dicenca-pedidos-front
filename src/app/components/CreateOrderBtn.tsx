import { Button } from "@/components/ui/button";
import { CreateOrderProps } from "../types/types";
import { useNewVentaStore } from "../store/controladorNewVenta.store";
import { useOrdersQuery } from "../querys/useOrders.query";
import { toast } from "sonner";
import { SpinnerGlobal } from "./SpinnerGlobal";

export function CreateOrderBtn() {
  const { order, reset } = useNewVentaStore();
  const { createOrderMutation } = useOrdersQuery();

  const createOrder = async (newOrder: CreateOrderProps) => {
    try {
      createOrderMutation.mutateAsync(newOrder, {
        onSuccess: () => {
          reset();
          toast("Orden Creada exitosamente", {
            description: new Date().toLocaleString(),
            // action: {
            //   label: "Undo",
            //   onClick: () => console.log("Undo"),
            // },
          });
        },
      });
    } catch (error) {
      console.error("Error al crear la orden:", error);
    }
  };

  if (createOrderMutation.isPending) {
    return <SpinnerGlobal />;
  }

  return (
    <Button className='bg-zinc-700' onClick={() => createOrder(order!)}>
      realizar orden
    </Button>
  );
}
