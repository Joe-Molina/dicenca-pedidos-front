import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/axiosConfig";
import { CreateOrderProps, OrderProps } from "../types/types";

const getAllOrders = async (): Promise<OrderProps[]> => {
  const data = (await api.get("/order/all")).data;
  return data;
};

const createOrder = async (newOrder: CreateOrderProps): Promise<OrderProps> => {
  const data = (await api.post(`/order/create`, newOrder)).data;
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
  return { ...query, createOrderMutation };
}
