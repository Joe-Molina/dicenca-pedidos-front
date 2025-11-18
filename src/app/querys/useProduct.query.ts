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

  return {
    query,
    createProductMutation,
  };
}
