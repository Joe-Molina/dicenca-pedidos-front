import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/axiosConfig";
import { SellerProps } from "../types/types";

const getAllSellers = async (): Promise<SellerProps[]> => {
  const data = (await api.get("/seller/all")).data.safeResponseSellers;
  return data;
};

const createSeller = async (
  newSeller: Omit<SellerProps, "id">
): Promise<SellerProps> => {
  const data = (await api.post(`/seller/create`, newSeller)).data;
  return data;
};

const editSeller = async (
  updatedSeller: Partial<SellerProps>
): Promise<SellerProps> => {
  const data = (
    await api.patch(`/seller/edit/${updatedSeller.id}`, { updatedSeller })
  ).data;
  return data;
};

const deleteSeller = async (id: number): Promise<SellerProps> => {
  const data = (await api.delete(`/seller/delete/${id}`)).data;
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

  const deleteSellerMutation = useMutation<SellerProps, Error, number>({
    mutationFn: deleteSeller,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sellers"] }),
  });
  const editSellerMutation = useMutation<
    SellerProps,
    Error,
    Partial<SellerProps>
  >({
    mutationFn: editSeller,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sellers"] }),
  });

  return {
    query,
    createSellerMutation,
    deleteSellerMutation,
    editSellerMutation,
  };
}
