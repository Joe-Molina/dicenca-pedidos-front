"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  User as UserIcon,
  Eye,
  Activity,
  Clock,
  Laptop,
  Globe,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit3,
  PlusCircle,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRight,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { useAuditQuery, useAuditStatsQuery } from "@/app/querys/useAudit.query";
import { useUsersQuery } from "@/app/querys/useUsers.query";
import { AuditFilters, AuditLogProps } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

// Formateador de fechas para Venezuela / Español
const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return dateStr;
  }
};

// Traductor de Entidades
const entityLabels: Record<string, { label: string; bg: string; text: string }> = {
  Order: { label: "Pedido", bg: "bg-purple-50", text: "text-purple-700 border-purple-200" },
  Product: { label: "Producto", bg: "bg-blue-50", text: "text-blue-700 border-blue-200" },
  Client: { label: "Cliente", bg: "bg-amber-50", text: "text-amber-700 border-amber-200" },
  User: { label: "Usuario", bg: "bg-emerald-50", text: "text-emerald-700 border-emerald-200" },
  Zone: { label: "Zona", bg: "bg-cyan-50", text: "text-cyan-700 border-cyan-200" },
  Portafolio: { label: "Portafolio", bg: "bg-indigo-50", text: "text-indigo-700 border-indigo-200" },
};

// Configuración visual por tipo de acción / movimiento
const actionConfig: Record<
  string,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  CREATE: {
    label: "Creación",
    icon: <PlusCircle className="size-3.5" />,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  UPDATE: {
    label: "Modificación",
    icon: <Edit3 className="size-3.5" />,
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  STATUS_CHANGE: {
    label: "Cambio de Estado",
    icon: <AlertTriangle className="size-3.5" />,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  DELETE: {
    label: "Eliminación",
    icon: <Trash2 className="size-3.5" />,
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
  LOGIN_SUCCESS: {
    label: "Inicio de Sesión",
    icon: <LogIn className="size-3.5" />,
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  LOGOUT: {
    label: "Cierre de Sesión",
    icon: <LogOut className="size-3.5" />,
    badgeClass: "bg-neutral-100 text-neutral-700 border-neutral-200",
  },
};

// Función para simplificar User-Agent
const parseUserAgent = (ua?: string | null) => {
  if (!ua) return "Desconocido";
  let browser = "Navegador";
  let os = "";

  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";

  return os ? `${browser} (${os})` : browser;
};

export default function AuditPage() {
  // Estado de Filtros
  const [filters, setFilters] = useState<AuditFilters>({
    page: 1,
    limit: 20,
    search: "",
    action: "all",
    entity: "all",
    userId: undefined,
    startDate: "",
    endDate: "",
  });

  // Estado para el modal de detalle del log
  const [selectedLog, setSelectedLog] = useState<AuditLogProps | null>(null);

  // Queries
  const { query: auditQuery } = useAuditQuery(filters);
  const { query: statsQuery } = useAuditStatsQuery();
  const { query: usersQuery } = useUsersQuery();

  const auditData = auditQuery.data;
  const stats = statsQuery.data;
  const users = usersQuery.data;

  // Manejador para cambiar filtros
  const handleFilterChange = (key: keyof AuditFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      page: 1, // Reiniciar a página 1 al cambiar cualquier filtro
      [key]: value,
    }));
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      search: "",
      action: "all",
      entity: "all",
      userId: undefined,
      startDate: "",
      endDate: "",
    });
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return (
      (filters.search && filters.search.trim() !== "") ||
      (filters.action && filters.action !== "all") ||
      (filters.entity && filters.entity !== "all") ||
      (filters.userId && Number(filters.userId) > 0) ||
      (filters.startDate && filters.startDate !== "") ||
      (filters.endDate && filters.endDate !== "")
    );
  }, [filters]);

  // Parsear JSON de cambios de forma segura
  const parsedChanges = useMemo(() => {
    if (!selectedLog) return null;
    let oldObj: Record<string, any> | null = null;
    let newObj: Record<string, any> | null = null;

    try {
      if (selectedLog.oldData) oldObj = JSON.parse(selectedLog.oldData);
    } catch {}

    try {
      if (selectedLog.newData) newObj = JSON.parse(selectedLog.newData);
    } catch {}

    // Combinar todas las claves únicas para la comparación
    const allKeys = Array.from(
      new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])
    );

    return { oldObj, newObj, allKeys };
  }, [selectedLog]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. ENCABEZADO DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-xs">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Módulo de Auditoría y Trazabilidad
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Registro cronológico de movimientos, operaciones de usuarios y eventos de seguridad
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              auditQuery.refetch();
              statsQuery.refetch();
            }}
            disabled={auditQuery.isFetching}
            className="rounded-xl border-gray-200 text-xs font-semibold hover:bg-gray-50 cursor-pointer shadow-xs"
          >
            <RefreshCw
              className={`size-3.5 mr-1.5 ${
                auditQuery.isFetching ? "animate-spin text-blue-600" : ""
              }`}
            />
            {auditQuery.isFetching ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS / ESTADÍSTICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Eventos */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Movimientos</span>
            <Activity className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {stats?.totalLogs ?? "-"}
          </p>
        </div>

        {/* Movimientos Hoy */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Movimientos Hoy</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {stats?.todayLogs ?? "-"}
          </p>
        </div>

        {/* Creaciones */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Creaciones</span>
            <PlusCircle className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {stats?.createLogs ?? "-"}
          </p>
        </div>

        {/* Modificaciones */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Modificaciones</span>
            <Edit3 className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">
            {stats?.updateLogs ?? "-"}
          </p>
        </div>

        {/* Eliminaciones */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Eliminaciones</span>
            <Trash2 className="size-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">
            {stats?.deleteLogs ?? "-"}
          </p>
        </div>

        {/* Inicios de Sesión */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Accesos (Login)</span>
            <LogIn className="size-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-teal-600 mt-2">
            {stats?.loginLogs ?? "-"}
          </p>
        </div>
      </div>

      {/* 3. BARRA DE FILTROS AVANZADOS */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
            <SlidersHorizontal className="size-4 text-blue-600" />
            <span>Filtros de Búsqueda</span>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2.5 rounded-lg font-semibold cursor-pointer"
            >
              <X className="size-3.5 mr-1" />
              Limpiar Filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Buscador de texto */}
          <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
            <Label className="text-xs font-semibold text-gray-600">Búsqueda General</Label>
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Usuario, IP, ID..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-9 text-xs rounded-xl border-gray-200 focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Filtro: Tipo de Movimiento */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold text-gray-600">Tipo de Movimiento</Label>
            <Select
              value={filters.action || "all"}
              onValueChange={(val) => handleFilterChange("action", val)}
            >
              <SelectTrigger className="w-full text-xs rounded-xl border-gray-200 focus:border-blue-500 shadow-xs">
                <SelectValue placeholder="Todos los movimientos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos los movimientos</SelectItem>
                  <SelectItem value="CREATE">Creación (CREATE)</SelectItem>
                  <SelectItem value="UPDATE">Modificación (UPDATE)</SelectItem>
                  <SelectItem value="STATUS_CHANGE">Cambio de Estado (STATUS_CHANGE)</SelectItem>
                  <SelectItem value="DELETE">Eliminación (DELETE)</SelectItem>
                  <SelectItem value="LOGIN_SUCCESS">Inicio de Sesión (LOGIN)</SelectItem>
                  <SelectItem value="LOGOUT">Cierre de Sesión (LOGOUT)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro: Módulo / Entidad */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold text-gray-600">Módulo / Entidad</Label>
            <Select
              value={filters.entity || "all"}
              onValueChange={(val) => handleFilterChange("entity", val)}
            >
              <SelectTrigger className="w-full text-xs rounded-xl border-gray-200 focus:border-blue-500 shadow-xs">
                <SelectValue placeholder="Todas las entidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todas las entidades</SelectItem>
                  <SelectItem value="Order">Pedidos</SelectItem>
                  <SelectItem value="Product">Productos</SelectItem>
                  <SelectItem value="Client">Clientes</SelectItem>
                  <SelectItem value="User">Usuarios</SelectItem>
                  <SelectItem value="Zone">Zonas</SelectItem>
                  <SelectItem value="Portafolio">Portafolios</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro: Usuario */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold text-gray-600">Usuario Responsable</Label>
            <Select
              value={filters.userId ? String(filters.userId) : "all"}
              onValueChange={(val) =>
                handleFilterChange("userId", val === "all" ? undefined : Number(val))
              }
            >
              <SelectTrigger className="w-full text-xs rounded-xl border-gray-200 focus:border-blue-500 shadow-xs">
                <SelectValue placeholder="Todos los usuarios" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {users?.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name} {u.lastname} ({u.username})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro: Rango de Fechas (Desde / Hasta) */}
          <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
            <Label className="text-xs font-semibold text-gray-600">Rango de Fechas</Label>
            <div className="grid grid-cols-2 gap-1.5">
              <Input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="text-[11px] px-2 py-1 rounded-xl border-gray-200 shadow-xs"
                title="Fecha Desde"
              />
              <Input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="text-[11px] px-2 py-1 rounded-xl border-gray-200 shadow-xs"
                title="Fecha Hasta"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABLA DE REGISTROS DE AUDITORÍA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">Registros Encontrados:</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-black px-2 py-0.5 rounded-full">
              {auditData?.total ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Por página:</span>
            <select
              value={filters.limit || 20}
              onChange={(e) => handleFilterChange("limit", Number(e.target.value))}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white font-semibold text-gray-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Movimiento</th>
                <th className="py-3 px-4">Módulo / ID</th>
                <th className="py-3 px-4">Dirección IP</th>
                <th className="py-3 px-4">Dispositivo / Navegador</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Spinner className="size-6 text-blue-600" />
                      <span className="text-xs font-semibold">Cargando pistas de auditoría...</span>
                    </div>
                  </td>
                </tr>
              ) : auditData?.logs && auditData.logs.length > 0 ? (
                auditData.logs.map((log) => {
                  const act = actionConfig[log.action] || {
                    label: log.action,
                    icon: <Activity className="size-3.5" />,
                    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
                  };

                  const ent = entityLabels[log.entity] || {
                    label: log.entity,
                    bg: "bg-gray-50",
                    text: "text-gray-700 border-gray-200",
                  };

                  const userInitial = log.user
                    ? `${log.user.name[0] || ""}${log.user.lastname[0] || ""}`.toUpperCase()
                    : "S";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-blue-50/30 transition-colors duration-150"
                    >
                      {/* Fecha y Hora */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-800 font-medium">
                          <Calendar className="size-3.5 text-gray-400" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* Usuario */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.user ? (
                          <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shadow-xs">
                              {userInitial}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 leading-tight">
                                {log.user.name} {log.user.lastname}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono">
                                @{log.user.username}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400 italic">
                            <UserIcon className="size-3.5" />
                            <span>Sistema / Público</span>
                          </div>
                        )}
                      </td>

                      {/* Tipo de Movimiento */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${act.badgeClass}`}
                        >
                          {act.icon}
                          {act.label}
                        </span>
                      </td>

                      {/* Módulo / ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${ent.bg} ${ent.text}`}
                          >
                            {ent.label}
                          </span>
                          <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            #{log.entityId}
                          </span>
                        </div>
                      </td>

                      {/* Dirección IP */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-700 font-mono text-[11px]">
                          <Globe className="size-3.5 text-gray-400" />
                          <span>{log.ipAddress || "No registrada"}</span>
                        </div>
                      </td>

                      {/* Dispositivo / User Agent */}
                      <td className="py-3 px-4 max-w-[200px] truncate" title={log.userAgent || ""}>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Laptop className="size-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{parseUserAgent(log.userAgent)}</span>
                        </div>
                      </td>

                      {/* Botón de Detalles */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-8 px-2.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-xs cursor-pointer"
                        >
                          <Eye className="size-3.5 mr-1" />
                          Detalles
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="size-8 text-gray-300" />
                      <p className="text-sm font-bold text-gray-700">No se encontraron movimientos</p>
                      <p className="text-xs text-gray-400 max-w-sm">
                        Intenta ajustar o limpiar los filtros de búsqueda para ver más registros de auditoría.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {auditData && auditData.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Página <strong className="text-gray-800">{auditData.page}</strong> de{" "}
              <strong className="text-gray-800">{auditData.totalPages}</strong> (
              {auditData.total} registros en total)
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={auditData.page <= 1}
                onClick={() => handleFilterChange("page", (filters.page || 1) - 1)}
                className="h-8 px-2.5 rounded-xl border-gray-200 text-xs font-semibold cursor-pointer"
              >
                <ChevronLeft className="size-3.5 mr-1" />
                Anterior
              </Button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, auditData.totalPages) }, (_, i) => {
                  let pNum = i + 1;
                  if (auditData.totalPages > 5 && (filters.page || 1) > 3) {
                    pNum = Math.min(
                      auditData.totalPages - 4 + i,
                      Math.max(1, (filters.page || 1) - 2 + i)
                    );
                  }
                  return (
                    <button
                      key={pNum}
                      onClick={() => handleFilterChange("page", pNum)}
                      className={`size-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        auditData.page === pNum
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={auditData.page >= auditData.totalPages}
                onClick={() => handleFilterChange("page", (filters.page || 1) + 1)}
                className="h-8 px-2.5 rounded-xl border-gray-200 text-xs font-semibold cursor-pointer"
              >
                Siguiente
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 5. MODAL DE INSPECCIÓN DE DETALLE Y COMPARADOR (DIFF VIEWER) */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in-50"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl shadow-xs">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Inspección de Registro de Auditoría
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    UUID: {selectedLog.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Contenido con Scroll */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Metadatos de la Operación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Fecha y Hora
                  </span>
                  <span className="font-bold text-gray-800 mt-0.5 block">
                    {formatDate(selectedLog.createdAt)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Usuario Responsable
                  </span>
                  <span className="font-bold text-gray-800 mt-0.5 block">
                    {selectedLog.user
                      ? `${selectedLog.user.name} ${selectedLog.user.lastname}`
                      : "Sistema"}
                  </span>
                  {selectedLog.user && (
                    <span className="text-[10px] text-gray-500 capitalize">
                      Rol: {selectedLog.user.role}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Tipo de Movimiento
                  </span>
                  <span className="font-bold text-blue-600 mt-0.5 block">
                    {selectedLog.action}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Módulo / ID Afectado
                  </span>
                  <span className="font-bold text-gray-800 mt-0.5 block">
                    {entityLabels[selectedLog.entity]?.label || selectedLog.entity} #{selectedLog.entityId}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Dirección IP
                  </span>
                  <span className="font-mono text-gray-800 font-bold mt-0.5 block">
                    {selectedLog.ipAddress || "No registrada"}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    User-Agent / Dispositivo
                  </span>
                  <span className="text-gray-700 mt-0.5 block break-all font-mono text-[11px]">
                    {selectedLog.userAgent || "No disponible"}
                  </span>
                </div>
              </div>

              {/* Comparador de Cambios (Diff Viewer) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Layers className="size-4 text-blue-600" />
                  <h4 className="font-bold text-gray-900 text-sm">
                    Detalle de Información Alterada
                  </h4>
                </div>

                {parsedChanges && parsedChanges.allKeys.length > 0 ? (
                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100/70 text-gray-600 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-4 w-1/4">Campo / Atributo</th>
                          <th className="py-2.5 px-4 w-3/8 text-red-700 bg-red-50/50">
                            Estado Anterior (Previo)
                          </th>
                          <th className="py-2.5 px-4 w-3/8 text-emerald-700 bg-emerald-50/50">
                            Nuevo Estado (Resultante)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                        {parsedChanges.allKeys.map((key) => {
                          const oldVal = parsedChanges.oldObj?.[key];
                          const newVal = parsedChanges.newObj?.[key];
                          const isDifferent =
                            JSON.stringify(oldVal) !== JSON.stringify(newVal);

                          const formatVal = (v: any) => {
                            if (v === undefined) return <span className="text-gray-300 italic">No definido</span>;
                            if (v === null) return <span className="text-gray-400 italic">null</span>;
                            if (typeof v === "object") return JSON.stringify(v, null, 2);
                            return String(v);
                          };

                          return (
                            <tr
                              key={key}
                              className={
                                isDifferent ? "bg-amber-50/30" : "hover:bg-gray-50/50"
                              }
                            >
                              <td className="py-2 px-4 font-bold text-gray-700 bg-gray-50/30">
                                {key}
                              </td>
                              <td
                                className={`py-2 px-4 break-all ${
                                  isDifferent && oldVal !== undefined
                                    ? "bg-red-50/40 text-red-800 font-semibold"
                                    : "text-gray-600"
                                }`}
                              >
                                {formatVal(oldVal)}
                              </td>
                              <td
                                className={`py-2 px-4 break-all ${
                                  isDifferent && newVal !== undefined
                                    ? "bg-emerald-50/40 text-emerald-800 font-semibold"
                                    : "text-gray-600"
                                }`}
                              >
                                {formatVal(newVal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500 font-medium">
                    No hay información de diferencias serializada para este evento.
                  </div>
                )}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/80 shrink-0">
              <Button
                variant="outline"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl px-5 text-xs font-bold cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
