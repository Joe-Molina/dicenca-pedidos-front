import { useContadorStore } from "../store/contador.store"

export function Contador() {
    const {count} = useContadorStore()
  return (
    <div>contador: {count}</div>
  )
}
