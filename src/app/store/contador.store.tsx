import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

//creacion de type para el estado del zustand
interface ContadorStateProps {
  count: number;
  listaNumeros: number[];
  setCount: () => void;
  deleteItem: (index: number) => void;
  setCountWithParams: (p: number) => void;
  resetList: () => void;
}

// se una el metodo create para crear un nuevo estado global con zustand
// que recibe como parametro una funcion fecha con el set que sirve para modificar y actualizar el estado
export const useContadorStore = create<ContadorStateProps>()(
  persist(
    (set) => ({
      count: 0,
      listaNumeros: [],
      setCount: () => {
        set((state) => {
          const nuevoCount = state.count + 1;
          return {
            count: nuevoCount,
            listaNumeros: [...state.listaNumeros, nuevoCount],
          };
        });
      },
      deleteItem: (index) => {
        set((state) => {
          const nuevaLista = state.listaNumeros.filter((_, i) => i !== index);
          return {
            listaNumeros: nuevaLista,
          };
        });
      },
      resetList: () => {
        set(() => ({
          count: 0,
          listaNumeros: [],
        }));
      },
      setCountWithParams: (p: number) => {
        set((state) => ({ count: state.count + p }));
      },
    }),
    {
      name: "contador-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
    }
  )
);
