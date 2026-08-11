"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useZonesQuery } from "@/app/querys/useZones.query";
import { useSellersQuery } from "@/app/querys/useSellers.query";
import CreateZoneDrawer from "../components/CreateZoneDrawer";
import {
  MapPin,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  UserCheck,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminZones() {
  const {
    query: { data: zones, isLoading: zonesLoading },
    deleteZoneMutation,
    editZoneMutation,
  } = useZonesQuery();

  const {
    query: { data: sellers, isLoading: sellersLoading },
  } = useSellersQuery();

  // Estado para la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el modo de edición en línea
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    names: "",
    userId: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Filtrado de zonas según el término de búsqueda
  const filteredZones = useMemo(() => {
    if (!zones) return [];
    return zones.filter((zone) =>
      zone.names.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [zones, searchTerm]);

  // Cálculo de estadísticas
  const stats = useMemo(() => {
    return {
      totalZones: zones?.length || 0,
    };
  }, [zones]);

  // Iniciar la edición de una zona
  const handleStartEdit = (zone: any) => {
    setEditingId(zone.id);
    setEditForm({
      names: zone.names,
      userId: zone.userId || 0,
    });
  };

  // Cancelar la edición
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Guardar los cambios de la zona editada
  const handleSaveEdit = async (id: number) => {
    if (!editForm.names.trim()) {
      toast.error("El nombre de la zona no puede estar vacío");
      return;
    }
    if (!editForm.userId) {
      toast.error("Debes asignar un vendedor a la zona");
      return;
    }

    setIsSaving(true);
    try {
      await editZoneMutation.mutateAsync(
        {
          id,
          names: editForm.names.trim(),
          userId: Number(editForm.userId),
        },
        {
          onSuccess: () => {
            toast.success("Zona actualizada exitosamente", {
              description: new Date().toLocaleString(),
            });
            setEditingId(null);
          },
          onError: (err) => {
            toast.error("Error al actualizar la zona", {
              description: err.message,
            });
          },
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar una zona definitivamente
  const handleDelete = (id: number, names: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la zona "${names}"?`)) {
      deleteZoneMutation.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Zona eliminada exitosamente", {
            description: new Date().toLocaleString(),
          });
        },
        onError: (err) => {
          toast.error("Error al eliminar la zona", {
            description: err.message,
          });
        },
      });
    }
  };

  const isLoading = zonesLoading || sellersLoading;

  return (
    <div className='flex min-h-screen w-full flex-col gap-6 bg-neutral-50/50 p-4 md:p-8'>
      {/* Cabecera de la página */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent'>
            Zonas
          </h1>
          <p className='text-sm font-medium text-neutral-500'>
            Configura y administra las áreas de despacho y asigna vendedores a cada una.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <CreateZoneDrawer />
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <div className='relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md'>
          <div className='absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl'></div>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600'>
              <MapPin className='h-6 w-6' />
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-neutral-400'>
                Total de Zonas
              </p>
              <h3 className='text-2xl font-bold text-neutral-800'>
                {isLoading ? (
                  <span className='inline-block h-6 w-8 animate-pulse rounded bg-neutral-200' />
                ) : (
                  stats.totalZones
                )}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Control y Búsqueda */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm'>
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400' />
          <Input
            type='text'
            placeholder='Buscar zonas por nombre...'
            className='pl-9 pr-4 py-2 border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-semibold'
            >
              Limpiar
            </button>
          )}
        </div>
        <div className='text-xs text-neutral-500 font-medium px-1'>
          {!isLoading && (
            <span>
              Mostrando <strong>{filteredZones.length}</strong> de{" "}
              <strong>{zones?.length || 0}</strong> zonas
            </span>
          )}
        </div>
      </div>

      {/* Vista principal (Tabla de zonas) */}
      {isLoading ? (
        // Cargadores esqueletos de alta fidelidad
        <div className='flex flex-col gap-3'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='h-16 w-full animate-pulse rounded-xl bg-white border border-neutral-100 p-4'
            />
          ))}
        </div>
      ) : filteredZones.length === 0 ? (
        // Estado vacío elegante
        <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center shadow-sm'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 shadow-inner'>
            <MapPin className='h-8 w-8' />
          </div>
          <h3 className='mt-4 text-lg font-bold text-neutral-800'>
            No se encontraron zonas
          </h3>
          <p className='mt-1 text-sm text-neutral-500 max-w-sm'>
            {searchTerm
              ? "Prueba a cambiar los términos de búsqueda o a limpiar los filtros actuales."
              : "Crea tu primera zona utilizando el botón superior para empezar a asignar clientes."}
          </p>
          {searchTerm && (
            <Button
              variant='outline'
              onClick={() => setSearchTerm("")}
              className='mt-4 rounded-xl'
            >
              Restablecer Filtros
            </Button>
          )}
        </div>
      ) : (
        // Tabla con diseño premium de escritorio
        <div className='overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='border-b border-neutral-100 bg-neutral-50/50 text-xs font-bold uppercase tracking-wider text-neutral-400'>
                  <th className='px-6 py-4'>Nombre de la Zona</th>
                  <th className='px-6 py-4'>Vendedor Asignado</th>
                  <th className='px-6 py-4 text-center'>Acciones</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-neutral-50'>
                {filteredZones.map((zone) => {
                  const isEditing = editingId === zone.id;
                  const seller = sellers?.find((s) => s.id === zone.userId);

                  return (
                    <tr
                      key={zone.id}
                      className='group transition-colors duration-200 hover:bg-neutral-50/40'
                    >
                      {/* Columna de Nombre */}
                      <td className='px-6 py-4'>
                        {isEditing ? (
                          <Input
                            type='text'
                            value={editForm.names}
                            onChange={(e) =>
                              setEditForm({ ...editForm, names: e.target.value })
                            }
                            className='h-9 w-full min-w-[150px] border-blue-500 focus:ring-blue-500 text-sm font-semibold rounded-lg'
                            disabled={isSaving}
                          />
                        ) : (
                          <div className='flex items-center gap-3'>
                            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300'>
                              <MapPin className='h-4.5 w-4.5' />
                            </div>
                            <span className='font-semibold text-neutral-800 transition-colors group-hover:text-indigo-600 duration-300'>
                              {zone.names}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Columna de Vendedor Asignado */}
                      <td className='px-6 py-4'>
                        {isEditing ? (
                          <Select
                            value={editForm.userId.toString()}
                            onValueChange={(val) =>
                              setEditForm({ ...editForm, userId: Number(val) })
                            }
                            disabled={isSaving}
                          >
                            <SelectTrigger className='h-9 w-full min-w-[150px] border-blue-500 focus:ring-blue-500 rounded-lg text-xs font-semibold'>
                              <SelectValue placeholder='Selecciona un vendedor' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {sellers?.map((s) => (
                                  <SelectItem key={s.id} value={s.id.toString()}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className='inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600'>
                            <UserCheck className='h-3 w-3' />
                            {seller?.name || "Sin Vendedor"}
                          </span>
                        )}
                      </td>

                      {/* Columna de Acciones */}
                      <td className='px-6 py-4 text-center'>
                        <div className='flex items-center justify-center gap-1'>
                          {isEditing ? (
                            <>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 rounded-lg px-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                                onClick={() => handleSaveEdit(zone.id)}
                                disabled={isSaving}
                              >
                                {isSaving ? (
                                  <Spinner className='h-3.5 w-3.5' />
                                ) : (
                                  <Check className='h-4 w-4' />
                                )}
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 rounded-lg px-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-blue-600 transition-colors'
                                onClick={() => handleStartEdit(zone)}
                              >
                                <Edit2 className='h-3.5 w-3.5' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-red-600 transition-colors'
                                onClick={() =>
                                  handleDelete(zone.id, zone.names)
                                }
                              >
                                <Trash2 className='h-3.5 w-3.5' />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
