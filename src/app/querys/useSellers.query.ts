import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/axiosConfig";
import { SellerProps } from "../types/types";

const getAllSellers = async (): Promise<SellerProps[]> => {
  const data = (await api.get("/seller/all")).data.sellers;
  return data;
};

const createSeller = async (
  newSeller: Omit<SellerProps, "id">
): Promise<SellerProps> => {
  const data = (await api.post(`/seller/create`, { newSeller })).data;
  return data;
};

export function useSellersQuery() {
  const queryClient = useQueryClient();
  const query = useQuery<SellerProps[]>({
    queryKey: ["sellers"],
    queryFn: getAllSellers,
  });

  const createSellerMutation = useMutation<
    SellerProps,
    Error,
    Omit<SellerProps, "id">
  >({
    mutationFn: createSeller,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sellers"] }),
  });

  return {
    query,
    createSellerMutation,
  };
}
