"use client";

import { Contador } from "./components/contador";
import { useProductQuery } from "./querys/useProduct.query";
import { useContadorStore } from "./store/contador.store";

export default function Home() {
  const { setCount, setCountWithParams, resetList } = useContadorStore();
  const {
    query: { data, isLoading },
  } = useProductQuery();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  console.log(data);
  if (data)
    return (
      <div className='flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
        <main className='flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start'>
          <Contador />
          <div>
            {data.map((portfolio) => {
              return <div key={portfolio.id}>{portfolio.name}</div>;
            })}
          </div>
          <button onClick={setCount}>sumar</button>
          <button onClick={resetList}>reset</button>
          <button onClick={() => setCountWithParams(4)}>
            sumar n cantidad{" "}
          </button>
        </main>
      </div>
    );
}
