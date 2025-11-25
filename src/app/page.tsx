"use client";

// import { useSellersQuery } from "./querys/useSellers.query";

export default function Home() {
<<<<<<< HEAD
  return <div className='flex h-full w-full flex-col gap-2 p-8'>home page</div>;
=======
  return (
    <div className="flex h-full w-full flex-col gap-2 p-8">
      <SelectSeller />
      <Button>
        <Link href={"/create/seller"}>Administrar Vendedores</Link>
      </Button>
      <Button>
        <Link href={"/create/zone"}>Administrar Zonas</Link>
      </Button>
      <Button>
        <Link href={"/create/client"}>Administrar Clientes</Link>
      </Button>
    </div>
  );
>>>>>>> 04b3c8e (feature: add client management functionality and UI components)
}
