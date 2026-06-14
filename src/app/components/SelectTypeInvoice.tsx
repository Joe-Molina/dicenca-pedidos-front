import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/axiosConfig";

import { TypeInvoiceProps } from "../types/types";

const getAllTypeInvoices = async (): Promise<TypeInvoiceProps[]> => {
  const data = (await api.get("/typeinvoice/all")).data;
  return data;
};

const createTypeInvoice = async (
  newTypeInvoice: Omit<TypeInvoiceProps, "id">,
): Promise<TypeInvoiceProps> => {
  const data = (await api.post(`/typeinvoice/create`, newTypeInvoice)).data;
  return data;
};

const editTypeInvoice = async (
  updateTypeInvoice: Partial<TypeInvoiceProps>,
): Promise<TypeInvoiceProps> => {
  const data = (
    await api.put(`/typeinvoice/edit/${updateTypeInvoice.id}`, {
      updateTypeInvoice,
    })
  ).data;
  return data;
};

const deleteTypeInvoice = async (id: number): Promise<TypeInvoiceProps> => {
  const data = (await api.delete(`/typeinvoice/delete/${id}`)).data;
  return data;
};

export function useTypeInvoiceQuery() {
  const queryClient = useQueryClient();
  const query = useQuery<TypeInvoiceProps[]>({
    queryKey: ["typeInvoices"],
    queryFn: getAllTypeInvoices,
  });

  const createTypeInvoiceMutation = useMutation<
    TypeInvoiceProps,
    Error,
    Omit<TypeInvoiceProps, "id">
  >({
    mutationFn: createTypeInvoice,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["typeinvoices"] }),
  });

  const editTypeInvoiceMutation = useMutation<
    TypeInvoiceProps,
    Error,
    Partial<TypeInvoiceProps>
  >({
    mutationFn: editTypeInvoice,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["typeinvoices"] }),
  });

  const deletTypeInvoiceMutation = useMutation<TypeInvoiceProps, Error, number>(
    {
      mutationFn: deleteTypeInvoice,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["typeinvoices"] }),
    },
  );

  return {
    query,
    createTypeInvoiceMutation,
    editTypeInvoiceMutation,
    deletTypeInvoiceMutation,
  };
}
