"use client";

import React, { useState, useMemo } from "react";
import CreateSellerDrawer from "../components/CreateSellerDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSellersQuery } from "@/app/querys/useSellers.query";
import {
  Users,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  User,
  ShieldAlert,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function AdminSellers() {
  const {
    query: { data: sellers, isLoading },
    deleteSellerMutation,
    editSellerMutation,
  } = useSellersQuery();

  // Estado para la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el modo de edición en línea
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    password: "", // Contraseña vacía por defecto (no se cambia a menos que se escriba)
  });
  const [isSaving, setIsSaving] = useState(false);

  // Filtrado de vendedores según el término de búsqueda
  const filteredSellers = useMemo(() => {
    if (!sellers) return [];
    return sellers.filter((seller) => {
      const matchesSearch =
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.username.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [sellers, searchTerm]);

  // Cálculo de estadísticas
  const stats = useMemo(() => {
    return {
      totalSellers: sellers?.length || 0,
    };
  }, [sellers]);

  // Iniciar la edición de un vendedor
  const handleStartEdit = (seller: any) => {
    setEditingId(seller.id);
    setEditForm({
      name: seller.name,
      username: seller.username,
      password: "", // Limpio por seguridad
    });
  };

  // Cancelar la edición
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Guardar los cambios editados del vendedor
  const handleSaveEdit = async (id: number) => {
    if (!editForm.name.trim()) {
      toast.error("El nombre del vendedor no puede estar vacío");
      return;
    }
    if (!editForm.username.trim()) {
      toast.error("El nombre de usuario del vendedor no puede estar vacío");
      return;
    }

    setIsSaving(true);
    try {
      const updatedData: any = {
        id,
        name: editForm.name.trim(),
        username: editForm.username.trim(),
      };

      // Solo añadimos la contraseña si fue proporcionada
      if (editForm.password.trim() !== "") {
        updatedData.password = editForm.password;
      }

      await editSellerMutation.mutateAsync(updatedData, {
        onSuccess: () => {
          toast.success("Vendedor actualizado exitosamente", {
            description: new Date().toLocaleString(),
          });
          setEditingId(null);
        },
        onError: (err) => {
          toast.error("Error al actualizar el vendedor", {
            description: err.message,
          });
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar un vendedor de forma definitiva
  const handleDelete = (id: number, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al vendedor "${name}"?`)) {
      deleteSellerMutation.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Vendedor eliminado exitosamente", {
            description: new Date().toLocaleString(),
          });
        },
        onError: (err) => {
          toast.error("Error al eliminar el vendedor", {
            description: err.message,
          });
        },
      });
    }
  };

  return (
    <div className='flex min-h-screen w-full flex-col gap-6 bg-neutral-50/50 p-4 md:p-8'>
      {/* Cabecera de la página */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent'>
            Vendedores
          </h1>
          <p className='text-sm font-medium text-neutral-500'>
            Administra los accesos, nombres y credenciales de los vendedores de la aplicación.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <CreateSellerDrawer />
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <div className='relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md'>
          <div className='absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-blue-500/5 blur-xl'></div>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600'>
              <Users className='h-6 w-6' />
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-neutral-400'>
                Vendedores Registrados
              </p>
              <h3 className='text-2xl font-bold text-neutral-800'>
                {isLoading ? (
                  <span className='inline-block h-6 w-8 animate-pulse rounded bg-neutral-200' />
                ) : (
                  stats.totalSellers
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
            placeholder='Buscar vendedores por nombre o usuario...'
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
              Mostrando <strong>{filteredSellers.length}</strong> de{" "}
              <strong>{sellers?.length || 0}</strong> vendedores
            </span>
          )}
        </div>
      </div>

      {/* Vista principal (Tabla de vendedores) */}
      {isLoading ? (
        // Cargadores esqueletos de alta fidelidad
        <div className='flex flex-col gap-3'>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className='h-16 w-full animate-pulse rounded-xl bg-white border border-neutral-100 p-4'
            />
          ))}
        </div>
      ) : filteredSellers.length === 0 ? (
        // Estado vacío elegante
        <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center shadow-sm'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 shadow-inner'>
            <Users className='h-8 w-8' />
          </div>
          <h3 className='mt-4 text-lg font-bold text-neutral-800'>
            No se encontraron vendedores
          </h3>
          <p className='mt-1 text-sm text-neutral-500 max-w-sm'>
            {searchTerm
              ? "Prueba a cambiar los términos de búsqueda o a limpiar los filtros actuales."
              : "Crea tu primer vendedor utilizando el botón superior para empezar a asignar zonas."}
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
                  <th className='px-6 py-4'>Nombre del Vendedor</th>
                  <th className='px-6 py-4'>Nombre de Usuario (Login)</th>
                  <th className='px-6 py-4'>Contraseña</th>
                  <th className='px-6 py-4 text-center'>Acciones</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-neutral-50'>
                {filteredSellers.map((seller) => {
                  const isEditing = editingId === seller.id;

                  return (
                    <tr
                      key={seller.id}
                      className='group transition-colors duration-200 hover:bg-neutral-50/40'
                    >
                      {/* Columna de Nombre */}
                      <td className='px-6 py-4'>
                        {isEditing ? (
                          <Input
                            type='text'
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className='h-9 w-full min-w-[150px] border-blue-500 focus:ring-blue-500 text-sm font-semibold rounded-lg'
                            disabled={isSaving}
                          />
                        ) : (
                          <div className='flex items-center gap-3'>
                            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300'>
                              <User className='h-4.5 w-4.5' />
                            </div>
                            <span className='font-semibold text-neutral-800 transition-colors group-hover:text-blue-600 duration-300'>
                              {seller.name}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Columna de Nombre de Usuario */}
                      <td className='px-6 py-4'>
                        {isEditing ? (
                          <Input
                            type='text'
                            value={editForm.username}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                username: e.target.value,
                              })
                            }
                            className='h-9 w-full min-w-[120px] border-blue-500 focus:ring-blue-500 text-sm rounded-lg'
                            disabled={isSaving}
                          />
                        ) : (
                          <span className='font-medium text-neutral-600 text-sm'>
                            {seller.username}
                          </span>
                        )}
                      </td>

                      {/* Columna de Contraseña */}
                      <td className='px-6 py-4'>
                        {isEditing ? (
                          <Input
                            type='password'
                            placeholder='Nueva contraseña (opcional)'
                            value={editForm.password}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                password: e.target.value,
                              })
                            }
                            className='h-9 w-full min-w-[180px] border-blue-500 focus:ring-blue-500 text-xs rounded-lg'
                            disabled={isSaving}
                          />
                        ) : (
                          <span className='text-xs text-neutral-400 italic font-mono select-none'>
                            ••••••••••••
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
                                onClick={() => handleSaveEdit(seller.id)}
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
                                onClick={() => handleStartEdit(seller)}
                              >
                                <Edit2 className='h-3.5 w-3.5' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-red-600 transition-colors'
                                onClick={() =>
                                  handleDelete(seller.id, seller.name)
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
