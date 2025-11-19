import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/axiosConfig";
import { ClientProps } from "../types/types";

const getAllClients = async (): Promise<ClientProps[]> => {
  const data = (await api.get("/client/all")).data.clients;
  return data;
};

const createClient = async (
  newClient: Omit<ClientProps, "id">
): Promise<ClientProps> => {
  const data = (await api.post(`/client/create`, { newClient })).data;
  return data;
};

const editClient = async (
  updatedClient: Partial<ClientProps>
): Promise<ClientProps> => {
  const data = (
    await api.put(`/client/edit/${updatedClient.id}`, { updatedClient })
  ).data;
  return data;
};

export function useClientsQuery() {
  const queryClient = useQueryClient();
  const query = useQuery<ClientProps[]>({
    queryKey: ["clients"],
    queryFn: getAllClients,
  });

  const deleteClient = async (id: number): Promise<ClientProps> => {
    const data = (await api.delete(`/client/create/${id}`)).data;
    return data;
  };

  const createClientMutation = useMutation<
    ClientProps,
    Error,
    Omit<ClientProps, "id">
  >({
    mutationFn: createClient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const editClientMutation = useMutation<
    ClientProps,
    Error,
    Partial<ClientProps>
  >({
    mutationFn: editClient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const deleteClientMutation = useMutation<ClientProps, Error, number>({
    mutationFn: deleteClient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  return {
    query,
    createClientMutation,
    editClientMutation,
    deleteClientMutation,
  };
}
