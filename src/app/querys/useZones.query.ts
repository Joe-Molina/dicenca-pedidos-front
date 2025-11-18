import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../libs/axiosConfig";
import { ZoneProps } from "../types/types";

const getAllZones = async (): Promise<ZoneProps[]> => {
  const data = (await api.get("/zone/all")).data.zones;
  return data;
};

const createZone = async (
  newZone: Omit<ZoneProps, "id">
): Promise<ZoneProps> => {
  const data = (await api.post(`/zone/create`, { newZone })).data;
  return data;
};

export function useZonesQuery() {
  const queryClient = useQueryClient();
  const query = useQuery<ZoneProps[]>({
    queryKey: ["zones"],
    queryFn: getAllZones,
  });
  const createZoneMutation = useMutation<
    ZoneProps,
    Error,
    Omit<ZoneProps, "id">
  >({
    mutationFn: createZone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["zones"] }),
  });
  return {
    query,
    createZoneMutation,
  };
}
