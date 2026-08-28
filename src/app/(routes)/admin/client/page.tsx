"use client";

import React, { useState, useMemo } from "react";
import { useClientsQuery } from "@/app/querys/useClients.query";
import { useZonesQuery } from "@/app/querys/useZones.query";
import CreateClientDrawer from "../components/createClientDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  User,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  MapPin,
  Phone,
  Barcode,
  Building,
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

function formatPhone(contact?: string | number) {
  if (!contact) return "";
  const str = String(contact).trim();
  if (!str || str === "0") return "";
  if (str.length === 10 && !str.startsWith("0")) {
    return "0" + str;
  }
  return str;
}

export default function AdminClients() {
  const {
    query: { data: clients, isLoading: clientsLoading },
    deleteClientMutation,
    editClientMutation,
  } = useClientsQuery();

  const {
    query: { data: zones, isLoading: zonesLoading },
  } = useZonesQuery();

  // Estados para búsqueda y filtrado por zona
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState("all");

  // Estado para el modo de edición en línea
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    company_name: string;
    rif: string;
    contact: string;
    cod_sunagro: string | number;
    address: string;
    zoneId: number;
  }>({
    name: "",
    company_name: "",
    rif: "",
    contact: "",
    cod_sunagro: "",
    address: "",
    zoneId: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Filtrado de clientes según búsqueda y zona seleccionada
  const filteredClients = useMemo(() => {
    if (!Array.isArray(clients)) return [];
    return clients.filter((client) => {
      const name = (client.name || "").toLowerCase();
      const companyName = (client.company_name || "").toLowerCase();
      const rif = (client.rif || "").toLowerCase();
      const phone = formatPhone(client.contact);
      const query = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        companyName.includes(query) ||
        rif.includes(query) ||
        phone.includes(query);
      
      const matchesZone =
        selectedZoneFilter === "all" ||
        client.zoneId === Number(selectedZoneFilter);

      return matchesSearch && matchesZone;
    });
  }, [clients, searchTerm, selectedZoneFilter]);

  // Cálculo de estadísticas
  const stats = useMemo(() => {
    return {
      totalClients: Array.isArray(clients) ? clients.length : 0,
    };
  }, [clients]);


  // Iniciar la edición de un cliente
  const handleStartEdit = (client: any) => {
    setEditingId(client.id);
    setEditForm({
      name: client.name || "",
      company_name: client.company_name || "",
      rif: client.rif || "",
      contact: formatPhone(client.contact),
      cod_sunagro: client.cod_sunagro && Number(client.cod_sunagro) !== 0 ? client.cod_sunagro.toString() : "",
      address: client.address || "",
      zoneId: client.zoneId || 0,
    });
  };

  // Cancelar la edición
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Guardar los cambios del cliente editado
  const handleSaveEdit = async (id: number) => {
    if (!editForm.name.trim()) {
      toast.error("El nombre del cliente no puede estar vacío");
      return;
    }
    if (!editForm.company_name.trim()) {
      toast.error("La razón social no puede estar vacía");
      return;
    }
    if (!editForm.rif.trim()) {
      toast.error("El RIF no puede estar vacío");
      return;
    }
    if (!editForm.zoneId) {
      toast.error("Debes asignar una zona al cliente");
      return;
    }

    setIsSaving(true);
    try {
      await editClientMutation.mutateAsync(
        {
          id,
          name: editForm.name.trim(),
          company_name: editForm.company_name.trim(),
          rif: editForm.rif.trim(),
          contact: editForm.contact ? editForm.contact.trim() : "",
          cod_sunagro: editForm.cod_sunagro ? Number(editForm.cod_sunagro) : 0,
          address: editForm.address.trim(),
          zoneId: Number(editForm.zoneId),
        },
        {
          onSuccess: () => {
            toast.success("Cliente actualizado exitosamente", {
              description: new Date().toLocaleString(),
            });
            setEditingId(null);
          },
          onError: (err) => {
            toast.error("Error al actualizar el cliente", {
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

  // Eliminar un cliente definitivamente
  const handleDelete = (id: number, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al cliente "${name}"?`)) {
      deleteClientMutation.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Cliente eliminado exitosamente", {
            description: new Date().toLocaleString(),
          });
        },
        onError: (err) => {
          toast.error("Error al eliminar al cliente", {
            description: err.message,
          });
        },
      });
    }
  };

  const isLoading = clientsLoading || zonesLoading;

  return (
    <div className='flex min-h-screen w-full flex-col gap-6 bg-neutral-50/50 p-4 md:p-8'>
      {/* Cabecera de la página */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent'>
            Clientes
          </h1>
          <p className='text-sm font-medium text-neutral-500'>
            Visualiza, busca y administra el directorio de clientes, sus códigos y zonas.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <CreateClientDrawer />
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <div className='relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md'>
          <div className='absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl'></div>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600'>
              <User className='h-6 w-6' />
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-neutral-400'>
                Clientes Totales
              </p>
              <h3 className='text-2xl font-bold text-neutral-800'>
                {isLoading ? (
                  <span className='inline-block h-6 w-8 animate-pulse rounded bg-neutral-200' />
                ) : (
                  stats.totalClients
                )}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Control, Búsqueda y Filtros */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm'>
        {/* Barra de búsqueda */}
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400' />
          <Input
            type='text'
            placeholder='Buscar clientes por nombre, razón social o RIF...'
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

        {/* Filtro por Zona */}
        <div className='w-full md:w-64 shrink-0'>
          <Select
            value={selectedZoneFilter}
            onValueChange={setSelectedZoneFilter}
          >
            <SelectTrigger className='w-full border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl'>
              <SelectValue placeholder='Filtrar por Zona' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='all'>Todas las Zonas</SelectItem>
                {zones?.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id.toString()}>
                    {zone.names}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vista principal (Tabla de clientes) */}
      {isLoading ? (
        // Cargadores esqueletos
        <div className='flex flex-col gap-3'>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className='h-16 w-full animate-pulse rounded-xl bg-white border border-neutral-100 p-4'
            />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        // Estado vacío elegante
        <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center shadow-sm'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 shadow-inner'>
            <User className='h-8 w-8' />
          </div>
          <h3 className='mt-4 text-lg font-bold text-neutral-800'>
            No se encontraron clientes
          </h3>
          <p className='mt-1 text-sm text-neutral-500 max-w-sm'>
            {searchTerm || selectedZoneFilter !== "all"
              ? "Prueba a cambiar los términos de búsqueda o a limpiar los filtros actuales."
              : "Registra tu primer cliente utilizando el botón superior para empezar a registrar pedidos."}
          </p>
          {(searchTerm || selectedZoneFilter !== "all") && (
            <Button
              variant='outline'
              onClick={() => {
                setSearchTerm("");
                setSelectedZoneFilter("all");
              }}
              className='mt-4 rounded-xl'
            >
              Restablecer Filtros
            </Button>
          )}
        </div>
      ) : (
        // Tabla con diseño premium y columnas reducidas
        <div className='overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left table-auto min-w-[900px]'>
              <thead>
                <tr className='border-b border-neutral-100 bg-neutral-50/50 text-xs font-bold uppercase tracking-wider text-neutral-400'>
                  <th className='px-4 py-4'>Cliente</th>
                  <th className='px-4 py-4'>Razón Social</th>
                  <th className='px-4 py-4'>RIF</th>
                  <th className='px-4 py-4'>Zona</th>
                  <th className='px-4 py-4'>Contacto</th>
                  <th className='px-4 py-4'>Cód. Sunagro</th>
                  <th className='px-4 py-4'>Dirección</th>
                  <th className='px-4 py-4 text-center'>Acciones</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-neutral-50 text-sm'>
                {filteredClients.map((client) => {
                  const isEditing = editingId === client.id;
                  const zone = zones?.find((z) => z.id === client.zoneId);

                  return (
                    <tr
                      key={client.id}
                      className='group transition-colors duration-200 hover:bg-neutral-50/40'
                    >
                      {/* Nombre */}
                      <td className='px-4 py-3'>
                        {isEditing ? (
                          <Input
                            type='text'
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className='h-8 w-32 border-blue-500 focus:ring-blue-500 text-xs font-semibold rounded-md'
                            disabled={isSaving}
                          />
                        ) : (
                          <div className='flex items-center gap-2'>
                            <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded bg-neutral-50 text-neutral-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors duration-300'>
                              <User className='h-4 w-4' />
                            </div>
                            <span className='font-semibold text-neutral-800 transition-colors group-hover:text-emerald-600 duration-300'>
                              {client.name}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Razón Social */}
                      <td className='px-4 py-3'>
                        {isEditing ? (
                          <Input
                            type='text'
                            value={editForm.company_name}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                company_name: e.target.value,
                              })
                            }
                            className='h-8 w-36 border-blue-500 focus:ring-blue-500 text-xs rounded-md'
                            disabled={isSaving}
                          />
                        ) : (
                          <span className='font-medium text-neutral-600'>
                            {client.company_name}
                          </span>
                        )}
                      </td>

                      {/* RIF */}
                      <td className='px-4 py-3'>
                        {isEditing ? (
                          <Input
                            type='text'
                            value={editForm.rif}
                            onChange={(e) =>
                              setEditForm({ ...editForm, rif: e.target.value })
                            }
                            className='h-8 w-28 border-blue-500 focus:ring-blue-500 text-xs rounded-md font-mono'
                            disabled={isSaving}
                          />
                        ) : (
                          <span className='font-mono text-neutral-500 text-xs'>
                            {client.rif}
                          </span>
                        )}
                      </td>

                      {/* Zona */}
                      <td className='px-4 py-3'>
                        {isEditing ? (
                          <Select
                            value={editForm.zoneId.toString()}
                            onValueChange={(val) =>
                              setEditForm({ ...editForm, zoneId: Number(val) })
                            }
                            disabled={isSaving}
                          >
                            <SelectTrigger className='h-8 w-32 border-blue-500 focus:ring-blue-500 rounded-md text-xs font-semibold'>
                              <SelectValue placeholder='Zona' />
                            </SelectTrigger>
                            <SelectContent>
                              {zones?.map((z) => (
                                <SelectItem key={z.id} value={z.id.toString()}>
                                  {z.names}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className='inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600'>
                            <MapPin className='h-2.5 w-2.5' />
                            {zone?.names || "Sin Zona"}
                          </span>
                        )}
                      </td>

                      {/* Contacto */}
                      <td className='px-4 py-3'>
                        {isEditing ? (
                          <Input
                            type='tel'
                            inputMode='tel'
                            placeholder='Sin teléfono'
                            value={editForm.contact || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                contact: e.target.value,
                              })
                            }
                            className='h-8 w-28 border-blue-500 focus:ring-blue-500 text-xs rounded-md'
                            disabled={isSaving}
                          />
                        ) : formatPhone(client.contact) ? (
                          <span className='text-neutral-600 font-medium flex items-center gap-1 text-xs'>
                            <Phone className='h-3 w-3 text-neutral-400' />
                            {formatPhone(client.contact)}
                          </span>
                        ) : (
                          <span className='text-neutral-300 text-xs font-semibold'>—</span>
                        )}
                      </td>

                      {/* Código Sunagro */}
                      <td className='px-4 py-3'>
                        {isEditing ? (
                          <Input
                            type='text'
                            inputMode='numeric'
                            placeholder='Sin código'
                            value={editForm.cod_sunagro || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                cod_sunagro: e.target.value,
                              })
                            }
                            className='h-8 w-28 border-blue-500 focus:ring-blue-500 text-xs rounded-md'
                            disabled={isSaving}
                          />
                        ) : client.cod_sunagro && Number(client.cod_sunagro) !== 0 ? (
                          <span className='text-neutral-500 font-mono text-xs flex items-center gap-1'>
                            <Barcode className='h-3 w-3 text-neutral-400' />
                            {client.cod_sunagro}
                          </span>
                        ) : (
                          <span className='text-neutral-300 text-xs font-semibold'>—</span>
                        )}
                      </td>

                      {/* Dirección */}
                      <td className='px-4 py-3 max-w-[200px]'>
                        {isEditing ? (
                          <Input
                            type='text'
                            value={editForm.address}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                address: e.target.value,
                              })
                            }
                            className='h-8 w-full border-blue-500 focus:ring-blue-500 text-xs rounded-md'
                            disabled={isSaving}
                          />
                        ) : (
                          <p
                            className='truncate text-neutral-500 text-xs'
                            title={client.address}
                          >
                            {client.address}
                          </p>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className='px-4 py-3 text-center shrink-0'>
                        <div className='flex items-center justify-center gap-0.5'>
                          {isEditing ? (
                            <>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-7 rounded px-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                                onClick={() => handleSaveEdit(client.id)}
                                disabled={isSaving}
                              >
                                {isSaving ? (
                                  <Spinner className='h-3 w-3' />
                                ) : (
                                  <Check className='h-3.5 w-3.5' />
                                )}
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-7 rounded px-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                              >
                                <X className='h-3.5 w-3.5' />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-7 w-7 rounded text-neutral-400 hover:bg-neutral-50 hover:text-blue-600 transition-colors'
                                onClick={() => handleStartEdit(client)}
                              >
                                <Edit2 className='h-3 w-3' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-7 w-7 rounded text-neutral-400 hover:bg-neutral-50 hover:text-red-600 transition-colors'
                                onClick={() =>
                                  handleDelete(client.id, client.name)
                                }
                              >
                                <Trash2 className='h-3 w-3' />
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
