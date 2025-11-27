import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/axiosConfig";
import { UserProps } from "../types/types";

const getAllSellers = async (): Promise<UserProps[]> => {
  const data = (await api.get("/user/all/sellers")).data;
  return data;
};

const createSeller = async (
  newSeller: Omit<UserProps, "id" | "role">
): Promise<UserProps> => {
  const data = (await api.post(`/user/create/seller`, newSeller)).data;
  return data;
};

const editSeller = async (
  updatedSeller: Partial<UserProps>
): Promise<UserProps> => {
  const data = (
    await api.patch(`/seller/edit/${updatedSeller.id}`, { updatedSeller })
  ).data;
  return data;
};

const deleteSeller = async (id: number): Promise<UserProps> => {
  const data = (await api.delete(`/seller/delete/${id}`)).data;
  return data;
};

export function useSellersQuery() {
  const queryClient = useQueryClient();
  const query = useQuery<UserProps[]>({
    queryKey: ["sellers"],
    queryFn: getAllSellers,
  });

  const createSellerMutation = useMutation<
    UserProps,
    Error,
    Omit<UserProps, "id" | "role">
  >({
    mutationFn: createSeller,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sellers"] }),
  });

  const deleteSellerMutation = useMutation<UserProps, Error, number>({
    mutationFn: deleteSeller,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sellers"] }),
  });
  const editSellerMutation = useMutation<UserProps, Error, Partial<UserProps>>({
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
