import { formatCurrency } from "@/app/components/utils/FormatPrice";
import { Bookmark, Package } from "lucide-react";

export default function OrderCard({
  clientName,
  orderId,
  total,
  note,
  status,
}: {
  orderId: number;
  clientName: string;
  total: number;
  note: string;
  status: boolean;
}) {
  return (
    <div className='flex gap-3 items-center  w-full shadow-sm p-4 bg-white rounded-lg'>
      <Package color='#4D81C9' />
      <div className='flex flex-col w-full gap-2'>
        <div className='flex justify-between'>
          <p className='flex font-semibold'>{`Pedido #${orderId}(${clientName})`}</p>
          <span className='bg-red-300 text-red-800 rounded-2xl px-2 py-1 text-xs font-bold'>
            {status ? "completada" : "pendiente"}
          </span>
        </div>
        <div className='flex justify-between'>
          <p className='text-neutral-400 text-sm flex gap-1 items-center'>
            <Bookmark size={18} /> {note}
          </p>
          <p className='text-sm text-neutral-600'>{formatCurrency(total)}</p>
        </div>
      </div>
    </div>
  );
}
