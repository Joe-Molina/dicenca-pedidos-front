import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/axiosConfig";
import { PortFolioProps } from "../types/types";

const getAllPortfolios = async (): Promise<PortFolioProps[]> => {
  const data = (await api.get("/portfolio/all")).data.portafolios;
  return data;
};

const createPortfolio = async ({
  name,
}: Omit<PortFolioProps, "id">): Promise<PortFolioProps> => {
  const data = (await api.post(`/portfolio/create`, name)).data;
  return data;
};

const editPortfolio = async (
  updatedPortfolio: Partial<PortFolioProps>
): Promise<PortFolioProps> => {
  const data = (
    await api.patch(`/portfolio/edit/${updatedPortfolio.id}`, {
      updatedPortfolio,
    })
  ).data;
  return data;
};

const deletePortfolio = async (id: number): Promise<PortFolioProps> => {
  const data = (await api.delete(`/portfolio/delete/${id}`)).data;
  return data;
};

export function usePortfolioQuery() {
  const queryClient = useQueryClient();

  const query = useQuery<PortFolioProps[]>({
    queryKey: ["portfolios"],
    queryFn: getAllPortfolios,
  });

  const createPortfolioMutation = useMutation<
    PortFolioProps,
    Error,
    Omit<PortFolioProps, "id">
  >({
    mutationFn: createPortfolio,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["portfolios"] }),
  });

  const deletePortfolioMutation = useMutation<PortFolioProps, Error, number>({
    mutationFn: deletePortfolio,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["portfolios"] }),
  });

  const editPortfolioMutation = useMutation<
    PortFolioProps,
    Error,
    Partial<PortFolioProps>
  >({
    mutationFn: editPortfolio,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["portfolios"] }),
  });

  return {
    query,
    createPortfolioMutation,
    deletePortfolioMutation,
    editPortfolioMutation,
  };
}
