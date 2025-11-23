import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
export function SpinnerGlobal() {
  return (
    <div className='flex w-full max-w-xs flex-col gap-4 [--radius:1rem]'>
      <Item>
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Cargando...</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
}
