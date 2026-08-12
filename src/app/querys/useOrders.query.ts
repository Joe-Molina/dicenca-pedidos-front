import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/axiosConfig";
import { CreateOrderProps, OrderProps } from "../types/types";

const getAllOrders = async (): Promise<OrderProps[]> => {
  const data = (await api.get("/order/all")).data.ordenes;
  return data;
};

const createOrder = async (newOrder: CreateOrderProps): Promise<OrderProps> => {
  const data = (await api.post(`/order/create`, newOrder)).data;
  return data;
};

// Petición para editar un pedido en el backend (por ejemplo, cambiar su estatus)
const editOrder = async (updatedOrder: Partial<OrderProps>): Promise<OrderProps> => {
  const data = (
    await api.patch(`/order/edit/${updatedOrder.id}`, updatedOrder)
  ).data;
  return data;
};

// Petición para eliminar un pedido en el backend
const deleteOrder = async (id: number): Promise<any> => {
  const data = (await api.delete(`/order/delete/${id}`)).data;
  return data;
};

export function useOrdersQuery() {
  const queryClient = useQueryClient();

  const query = useQuery<OrderProps[]>({
    queryKey: ["orders"],
    queryFn: getAllOrders,
  });
  const createOrderMutation = useMutation<OrderProps, Error, CreateOrderProps>({
    mutationFn: createOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
  
  // Mutación para editar un pedido
  const editOrderMutation = useMutation<OrderProps, Error, Partial<OrderProps>>({
    mutationFn: editOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  // Mutación para eliminar un pedido
  const deleteOrderMutation = useMutation<any, Error, number>({
    mutationFn: deleteOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  return { ...query, createOrderMutation, editOrderMutation, deleteOrderMutation };
}
