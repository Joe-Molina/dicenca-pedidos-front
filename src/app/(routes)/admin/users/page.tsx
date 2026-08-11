"use client";

import React, { useState, useMemo } from "react";
import CreateUserDrawer from "../components/CreateUserDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUsersQuery } from "@/app/querys/useUsers.query";
import {
  Users,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  User,
  Shield,
  UserCheck,
  Filter,
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

export default function AdminUsers() {
  // Query hook para cargar y administrar todos los usuarios
  const {
    query: { data: users, isLoading },
    deleteUserMutation,
    editUserMutation,
  } = useUsersQuery();

  // Estados locales para la barra de búsqueda y filtros de rol
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "seller">("all");

  // Estados locales para edición en línea (inline editing)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    lastname: "",
    email: "",
    username: "",
    role: "seller" as "admin" | "seller",
    password: "", // Opcional
  });
  const [isSaving, setIsSaving] = useState(false);

  // Filtrado de usuarios en memoria
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      // 1. Filtro por Rol
      if (roleFilter !== "all" && u.role !== roleFilter) return false;

      // 2. Filtro por Buscador (Nombre, Apellido, Usuario o Correo)
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(query) ||
        u.lastname.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [users, searchTerm, roleFilter]);

  // Estadísticas del panel de usuarios
  const stats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, sellers: 0 };
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      sellers: users.filter((u) => u.role === "seller").length,
    };
  }, [users]);

  // Comenzar edición en línea
  const handleStartEdit = (user: any) => {
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      username: user.username,
      role: user.role,
      password: "", // Contraseña vacía por seguridad
    });
  };

  // Cancelar edición en línea
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Guardar edición en línea
  const handleSaveEdit = async (id: number) => {
    if (!editForm.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!editForm.lastname.trim()) {
      toast.error("El apellido es obligatorio");
      return;
    }
    if (!editForm.email.trim()) {
      toast.error("El correo electrónico es obligatorio");
      return;
    }
    if (!editForm.username.trim()) {
      toast.error("El usuario de login es obligatorio");
      return;
    }

    setIsSaving(true);
    try {
      const updatedData: any = {
        id,
        name: editForm.name.trim(),
        lastname: editForm.lastname.trim(),
        email: editForm.email.trim(),
        username: editForm.username.trim(),
        role: editForm.role,
      };

      // Si especificó contraseña, la adjuntamos
      if (editForm.password.trim() !== "") {
        updatedData.password = editForm.password;
      }

      await editUserMutation.mutateAsync(updatedData, {
        onSuccess: () => {
          toast.success("Usuario actualizado correctamente");
          setEditingId(null);
        },
        onError: (err) => {
          toast.error("Error al actualizar usuario", {
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

  // Eliminar usuario definitivamente
  const handleDelete = (id: number, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario "${name}"?`)) {
      deleteUserMutation.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Usuario eliminado exitosamente");
        },
        onError: (err) => {
          toast.error("Error al eliminar usuario", {
            description: err.message,
          });
        },
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 bg-neutral-50/50 p-4 md:p-8">
      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            Gestión de Usuarios
          </h1>
          <p className="text-sm font-medium text-neutral-500">
            Administra los roles, cuentas de login, correos y contraseñas de todos los accesos del sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateUserDrawer />
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Usuarios */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-blue-500/5 blur-xl"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Usuarios</p>
              <h3 className="text-2xl font-bold text-neutral-800">
                {isLoading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-neutral-200" /> : stats.total}
              </h3>
            </div>
          </div>
        </div>

        {/* Administradores */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-purple-500/5 blur-xl"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Administradores (Admins)</p>
              <h3 className="text-2xl font-bold text-neutral-800">
                {isLoading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-neutral-200" /> : stats.admins}
              </h3>
            </div>
          </div>
        </div>

        {/* Vendedores */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Vendedores (Sellers)</p>
              <h3 className="text-2xl font-bold text-neutral-800">
                {isLoading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-neutral-200" /> : stats.sellers}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtro de Rol */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center rounded-2xl border border-neutral-100 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, apellido, usuario o correo..."
            className="pl-9 pr-4 py-2 border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Selector de Rol */}
        <div className="w-full md:w-48 shrink-0">
          <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
            <SelectTrigger className="border-neutral-200 rounded-xl text-xs w-full bg-white shadow-xs">
              <SelectValue placeholder="Filtrar por rol..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Roles</SelectItem>
              <SelectItem value="admin">Administradores (Admin)</SelectItem>
              <SelectItem value="seller">Vendedores (Seller)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-neutral-500 font-semibold px-2 shrink-0">
          {!isLoading && (
            <span>
              Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users?.length || 0}</strong> usuarios
            </span>
          )}
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-white border border-neutral-100 p-4" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 shadow-inner">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-neutral-800">No se encontraron usuarios</h3>
          <p className="mt-1 text-sm text-neutral-500 max-w-sm">
            Prueba a limpiar los filtros actuales o a redefinir el texto de la barra de búsqueda.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Login</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Contraseña</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filteredUsers.map((item) => {
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id} className="group transition-colors duration-200 hover:bg-neutral-50/30">
                      
                      {/* Columna: Nombre y Apellido */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value={editForm.name}
                              placeholder="Nombre"
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="h-8 text-xs border-blue-500 rounded-lg"
                              disabled={isSaving}
                            />
                            <Input
                              type="text"
                              value={editForm.lastname}
                              placeholder="Apellido"
                              onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                              className="h-8 text-xs border-blue-500 rounded-lg"
                              disabled={isSaving}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                              <User className="h-4.5 w-4.5" />
                            </div>
                            <span className="font-bold text-neutral-800 transition-colors group-hover:text-blue-600">
                              {item.name} {item.lastname}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Columna: Correo */}
                      <td className="px-6 py-4 text-sm font-semibold">
                        {isEditing ? (
                          <Input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="h-8 text-xs border-blue-500 rounded-lg w-full"
                            disabled={isSaving}
                          />
                        ) : (
                          <span className="text-neutral-600">{item.email}</span>
                        )}
                      </td>

                      {/* Columna: Usuario Login */}
                      <td className="px-6 py-4 text-sm font-semibold">
                        {isEditing ? (
                          <Input
                            type="text"
                            value={editForm.username}
                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                            className="h-8 text-xs border-blue-500 rounded-lg w-full"
                            disabled={isSaving}
                          />
                        ) : (
                          <span className="text-neutral-600">{item.username}</span>
                        )}
                      </td>

                      {/* Columna: Rol */}
                      <td className="px-6 py-4 text-xs font-bold uppercase">
                        {isEditing ? (
                          <Select
                            value={editForm.role}
                            onValueChange={(val: any) => setEditForm({ ...editForm, role: val })}
                          >
                            <SelectTrigger className="h-8 text-xs border-blue-500 rounded-lg bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="seller">Seller</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] border font-black ${
                              item.role === "admin"
                                ? "bg-purple-50 text-purple-700 border-purple-100"
                                : "bg-blue-50 text-blue-700 border-blue-100"
                            }`}
                          >
                            {item.role === "admin" ? "Admin" : "Vendedor"}
                          </span>
                        )}
                      </td>

                      {/* Columna: Contraseña */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <Input
                            type="password"
                            placeholder="Cambiar (opcional)"
                            value={editForm.password}
                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                            className="h-8 text-xs border-blue-500 rounded-lg w-full"
                            disabled={isSaving}
                          />
                        ) : (
                          <span className="text-xs text-neutral-300 italic font-mono select-none">••••••••••••</span>
                        )}
                      </td>

                      {/* Columna: Acciones */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-lg px-2 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleSaveEdit(item.id)}
                                disabled={isSaving}
                              >
                                {isSaving ? <Spinner className="h-3.5 w-3.5" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-lg px-2 text-neutral-500 hover:bg-neutral-100"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-blue-600 transition-colors cursor-pointer"
                                onClick={() => handleStartEdit(item)}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-red-600 transition-colors cursor-pointer"
                                onClick={() => handleDelete(item.id, `${item.name} ${item.lastname}`)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
