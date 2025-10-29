import {create} from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

//creacion de type para el estado del zustand
interface ContadorStateProps {
  count: number
  setCount: () => void
  setCountWithParams: (p: number) => void
}

// se una el metodo create para crear un nuevo estado global con zustand
// que recibe como parametro una funcion fecha con el set que sirve para modificar y actualizar el estado
export const useContadorStore = create<ContadorStateProps>()(
  persist(
    (set) =>({
  count: 0,
  setCount: () => {set((state)=>({count:state.count+1}))},
  setCountWithParams: (p) => {set((state)=>({count:state.count+p}))}
}),
  {
    name: 'food-storage', // name of the item in the storage (must be unique)
    storage: createJSONStorage(() => sessionStorage), 
  }
))