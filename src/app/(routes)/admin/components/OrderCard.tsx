import { formatCurrency } from "@/app/components/utils/FormatPrice";
import { Package } from "lucide-react";
import React from "react";

export default function OrderCard({
  clientName,
  orderId,
  total,
}: {
  orderId: number;
  clientName: string;
  total: number;
}) {
  return (
    <div className='flex gap-3 items-center  w-full shadow-sm p-4 bg-white rounded-lg'>
      <Package color='#4D81C9' />
      <div className='flex flex-col w-full gap-2'>
        <div className='flex justify-between'>
          <p className='flex font-semibold'>{`Pedido #${orderId}(${clientName})`}</p>
          <span className='bg-red-300 text-red-800 rounded-2xl px-2 py-1 text-xs font-bold'>
            pendiente
          </span>
        </div>
        <div className='flex justify-end'>
          <p className='text-sm text-neutral-600'>{formatCurrency(total)}</p>
        </div>
      </div>
    </div>
  );
}
