import { formatCurrency } from "@/app/components/utils/FormatPrice";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Package } from "lucide-react";

export default function GlobalSales({
  globalSales,
  totalOrders,
}: {
  globalSales: number;
  totalOrders: number;
}) {
  return (
    <div className='flex justify-between w-full shadow-sm p-4 bg-white rounded-lg'>
      <div>
        <div className='flex gap-2 text-sm text-neutral-600'>
          <p>Ventas Globales Hoy</p>
          <CircleDollarSign color='#4D81C9' />
        </div>
        <p className='text-2xl font-semibold'>{formatCurrency(globalSales)}</p>
      </div>
      <div>
        <div className='flex gap-2 text-sm text-neutral-600'>
          <p>Pedidos Totales Hoy</p>
          <Package color='#4D81C9' />
        </div>
        <p className='text-2xl font-semibold'>{totalOrders}</p>
      </div>
    </div>
  );
}
