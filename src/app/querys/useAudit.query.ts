import { useQuery } from "@tanstack/react-query";
import api from "../libs/axiosConfig";
import { AuditFilters, AuditLogProps, AuditStatsProps } from "../types/types";

export interface AuditResponse {
  logs: AuditLogProps[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Obtener logs de auditoría con filtros y paginación
const getAuditLogs = async (filters: AuditFilters): Promise<AuditResponse> => {
  const params: Record<string, any> = {};
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.search && filters.search.trim()) params.search = filters.search.trim();
  if (filters.action && filters.action !== "all") params.action = filters.action;
  if (filters.entity && filters.entity !== "all") params.entity = filters.entity;
  if (filters.userId && Number(filters.userId) > 0) params.userId = filters.userId;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  const response = await api.get("/audit", { params });
  return response.data;
};

// Obtener estadísticas generales de auditoría
const getAuditStats = async (): Promise<AuditStatsProps> => {
  const response = await api.get("/audit/stats");
  return response.data;
};

// Obtener detalle de un log por ID
const getAuditById = async (id: string): Promise<AuditLogProps> => {
  const response = await api.get(`/audit/${id}`);
  return response.data;
};

export function useAuditQuery(filters: AuditFilters = { page: 1, limit: 20 }) {
  const query = useQuery<AuditResponse>({
    queryKey: ["audit", filters],
    queryFn: () => getAuditLogs(filters),
    placeholderData: (previousData) => previousData,
  });

  return { query };
}

export function useAuditStatsQuery() {
  const query = useQuery<AuditStatsProps>({
    queryKey: ["audit-stats"],
    queryFn: getAuditStats,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  return { query };
}

export function useAuditDetailQuery(id: string | null) {
  const query = useQuery<AuditLogProps>({
    queryKey: ["audit-detail", id],
    queryFn: () => getAuditById(id!),
    enabled: !!id,
  });

  return { query };
}
