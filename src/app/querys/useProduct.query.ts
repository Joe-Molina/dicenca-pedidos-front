import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/axiosConfig";
import { ProductProps } from "../types/types";

const getAllProducts = async (): Promise<ProductProps[]> => {
  const data = (await api.get("/product/all")).data.productos;
  return data;
};

const createProduct = async (
  newProduct: Omit<ProductProps, "id">
): Promise<ProductProps> => {
  const data = (await api.post(`/product/create`, { newProduct })).data;
  return data;
};

const editProduct = async (
  updatedProduct: Partial<ProductProps>
): Promise<ProductProps> => {
  const data = (
    await api.patch(`/product/edit/${updatedProduct.id}`, { updatedProduct })
  ).data;
  return data;
};

const deleteProduct = async (id: number): Promise<ProductProps> => {
  const data = (await api.delete(`/product/delete/${id}`)).data;
  return data;
};

export function useProductQuery() {
  const queryClient = useQueryClient();

  const query = useQuery<ProductProps[]>({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  const createProductMutation = useMutation<
    ProductProps,
    Error,
    Omit<ProductProps, "id">
  >({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const deleteProductMutation = useMutation<ProductProps, Error, number>({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const editProductMutation = useMutation<
    ProductProps,
    Error,
    Partial<ProductProps>
  >({
    mutationFn: editProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  return {
    query,
    createProductMutation,
    deleteProductMutation,
    editProductMutation,
  };
}
