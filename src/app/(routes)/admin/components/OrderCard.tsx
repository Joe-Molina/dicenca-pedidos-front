"use client";

import React, { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "@/app/components/utils/FormatPrice";
import {
  Bookmark,
  Package,
  Clock,
  X,
  Check,
  Trash2,
  Edit,
  Save,
  Plus,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useProductQuery } from "@/app/querys/useProduct.query";
import { useOrdersQuery } from "@/app/querys/useOrders.query";
import { OrderDetailsProps } from "@/app/types/types";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import api from "@/app/libs/axiosConfig";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrderCard({
  clientName,
  orderId,
  total,
  note,
  status,
  orderDetails = [],
  createdAt,
  updatedAt,
}: {
  orderId: number;
  clientName: string;
  total: number;
  note: string;
  status: boolean;
  orderDetails?: OrderDetailsProps[];
  createdAt: Date | string;
  updatedAt?: Date | string;
}) {
  const { user } = useAuthStore();
  const {
    query: { data: products },
  } = useProductQuery();
  const { editOrderMutation, deleteOrderMutation } = useOrdersQuery();

  const [isMounted, setIsMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para el Modo Edición (Solo Admin)
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNotes, setEditNotes] = useState(note);
  const [editItems, setEditItems] = useState<{ productId: number; cant: number }[]>([]);
  const [selectedAddProductId, setSelectedAddProductId] = useState("");
  const [addQuantity, setAddQuantity] = useState(1);

  // Estados para Modal de Autorización de Admin (Regla de 2 días)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Inicializar estado de edición al abrir el modal
  useEffect(() => {
    if (modalOpen) {
      setEditNotes(note);
      setEditItems(
        orderDetails.map((item) => ({
          productId: item.productId,
          cant: item.cant,
        }))
      );
      setIsEditMode(false);
    }
  }, [modalOpen, note, orderDetails]);

  // Determinar si una reversión requiere autorización de admin
  const checkReversionRequirement = () => {
    // Si la orden está pendiente (status === false), pasar a despachada no tiene límite
    if (!status) return false;

    // Si está despachada, y queremos volver a pendiente:
    const lastUpdateDate = updatedAt ? new Date(updatedAt) : new Date(createdAt);
    const differenceInMs = Date.now() - lastUpdateDate.getTime();
    const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

    // Si pasaron más de 2 días (48 horas), requiere autenticación de admin
    return differenceInDays > 2;
  };

  // Función principal para gatillar el cambio de estatus
  const handleToggleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const needsAuth = checkReversionRequirement();
    if (needsAuth) {
      // Abrimos el modal de autorización
      setAuthModalOpen(true);
      setAdminEmail("");
      setAdminPassword("");
      setAuthError("");
    } else {
      // Ejecutamos el cambio directamente
      executeToggleStatus(false); // false indica que no requirió bypass del login modal
    }
  };

  // Ejecución final del cambio de estatus en el backend
  const executeToggleStatus = async (bypassAuthReset = false) => {
    setIsUpdating(true);
    try {
      await editOrderMutation.mutateAsync(
        {
          id: orderId,
          status: !status,
        },
        {
          onSuccess: () => {
            toast.success(
              `Pedido #${orderId} marcado como ${
                !status ? "completado (despachado)" : "pendiente"
              }`
            );
            if (bypassAuthReset) {
              setAuthModalOpen(false);
            }
            setModalOpen(false); // Cerramos el modal de detalles también
          },
          onError: (err) => {
            toast.error("Error al actualizar estatus", {
              description: err.message,
            });
          },
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Función para autenticar al administrador y aprobar la reversión
  const handleAdminAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthorizing(true);

    try {
      // 1. Validamos credenciales usando el login general
      const res = await api.post("/user/login", {
        email: adminEmail,
        password: adminPassword,
      });

      // 2. Comprobamos si logueó con éxito y si tiene rol de administrador
      if (res.data.loged && res.data.user?.role === "admin") {
        toast.success(`Autorización concedida por admin: ${res.data.user.name}`);
        setIsAuthorizing(false);
        // 3. Ejecutamos el cambio de estatus de la orden
        await executeToggleStatus(true);
      } else {
        setAuthError("Credenciales incorrectas o el usuario no es un Administrador");
        setIsAuthorizing(false);
      }
    } catch (error: any) {
      console.error(error);
      setAuthError(error.response?.data?.message || "Error al conectar con el servidor de autenticación");
      setIsAuthorizing(false);
    }
  };

  // Eliminar pedido (Solo Admin)
  const handleDeleteOrder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el Pedido #${orderId}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOrderMutation.mutateAsync(orderId, {
        onSuccess: () => {
          toast.success(`Pedido #${orderId} eliminado exitosamente`);
          setModalOpen(false);
        },
        onError: (err) => {
          toast.error("Error al eliminar pedido", {
            description: err.message,
          });
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Guardar modificaciones de la orden (Solo Admin)
  const handleSaveOrderEdits = async () => {
    setIsUpdating(true);
    try {
      const payload = {
        id: orderId,
        notes: editNotes,
        details: editItems.map((item) => ({
          productId: item.productId,
          cant: item.cant,
        })),
      };

      await editOrderMutation.mutateAsync(payload, {
        onSuccess: () => {
          toast.success(`Pedido #${orderId} modificado exitosamente`);
          setIsEditMode(false);
          setModalOpen(false);
        },
        onError: (err) => {
          toast.error("Error al guardar modificaciones", {
            description: err.message,
          });
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Métodos del modo edición
  const handleAddProduct = () => {
    if (!selectedAddProductId) return;
    const pid = Number(selectedAddProductId);
    const existingIndex = editItems.findIndex((item) => item.productId === pid);

    if (existingIndex > -1) {
      const updated = [...editItems];
      updated[existingIndex].cant += addQuantity;
      setEditItems(updated);
    } else {
      setEditItems([...editItems, { productId: pid, cant: addQuantity }]);
    }
    setSelectedAddProductId("");
    setAddQuantity(1);
  };

  const handleRemoveProduct = (pid: number) => {
    setEditItems(editItems.filter((item) => item.productId !== pid));
  };

  const handleUpdateQuantity = (pid: number, qty: number) => {
    if (qty < 1) return;
    setEditItems(
      editItems.map((item) =>
        item.productId === pid ? { ...item, cant: qty } : item
      )
    );
  };

  // Cálculo del monto total temporal mientras se edita
  const currentEditTotal = useMemo(() => {
    if (!products) return 0;
    return editItems.reduce((sum, item) => {
      const prod = products.find((p) => p.id === item.productId);
      return sum + (prod?.price || 0) * item.cant;
    }, 0);
  }, [editItems, products]);

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* TARJETA DEL PEDIDO */}
      <div
        onClick={() => setModalOpen(true)}
        className="flex gap-4 items-center w-full shadow-xs hover:shadow-md p-4 bg-white rounded-2xl border border-neutral-100 hover:border-blue-100 transition-all duration-200 cursor-pointer group"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
            status
              ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
              : "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white"
          }`}
        >
          <Package className="h-5 w-5" />
        </div>

        <div className="flex flex-col w-full gap-1.5 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <p className="flex font-bold text-neutral-800 text-sm md:text-base truncate max-w-[280px]">
              Pedido #{orderId} <span className="text-neutral-400 font-medium ml-1.5 truncate max-w-[150px]">({clientName})</span>
            </p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                status
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-amber-50 text-amber-700 border border-amber-100"
              }`}
            >
              {status ? "Despachado" : "Pendiente"}
            </span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <p className="text-neutral-400 text-xs truncate flex gap-1 items-center font-medium max-w-[220px]">
              <Bookmark size={14} className="shrink-0 text-neutral-300" />
              {note || <span className="italic text-neutral-300 font-normal">Sin notas adicionales</span>}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-neutral-800 mr-2">
                {formatCurrency(total)}
              </span>
              
              {/* Botón rápido de estatus */}
              {isMounted && (
                <button
                  onClick={handleToggleStatusClick}
                  disabled={isUpdating}
                  className={`flex h-8 px-2.5 items-center gap-1 rounded-lg text-[10px] font-bold uppercase transition-all duration-150 cursor-pointer ${
                    status
                      ? "bg-neutral-100 text-neutral-600 hover:bg-amber-50 hover:text-amber-700"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                  }`}
                  title={status ? "Marcar como pendiente" : "Marcar como despachado"}
                >
                  {isUpdating ? (
                    <Spinner className="h-3 w-3" />
                  ) : status ? (
                    <>
                      <RotateCcw className="size-3" /> Reabrir
                    </>
                  ) : (
                    <>
                      <Check className="size-3" /> Despachar
                    </>
                  )}
                </button>
              )}

              {/* Botón rápido de eliminación (Solo Admin en tarjeta) */}
              {isMounted && isAdmin && (
                <button
                  onClick={handleDeleteOrder}
                  disabled={isDeleting}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar pedido"
                >
                  {isDeleting ? <Spinner className="h-3.5 w-3.5" /> : <Trash2 className="size-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE VISTA PREVIA DETALLADA / EDICIÓN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => {
              if (!isEditMode) setModalOpen(false);
            }}
          />

          <div className="bg-white rounded-3xl shadow-2xl border border-neutral-100 max-w-lg w-full z-10 overflow-hidden transform transition-all duration-300 scale-in-95 p-6 animate-in slide-in-from-bottom-4 flex flex-col max-h-[90vh]">
            
            {/* Cabecera del Modal */}
            <div className="flex justify-between items-start pb-4 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-neutral-800">
                    {isEditMode ? `Editando Pedido #${orderId}` : `Detalle del Pedido #${orderId}`}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                      status
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}
                  >
                    {status ? "Despachado" : "Pendiente"}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-medium mt-1">
                  Cliente: <strong className="text-neutral-700">{clientName}</strong>
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-50 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 my-1">
              {isEditMode ? (
                /* MODO EDICIÓN (SOLO ADMIN) */
                <div className="space-y-4">
                  {/* Edición de Notas */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-notes" className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Notas / Observación</Label>
                    <Input
                      id="edit-notes"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="border-neutral-200 rounded-xl text-sm"
                      placeholder="Agrega una nota..."
                    />
                  </div>

                  {/* Edición de Ítems */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Modificar Cantidades</Label>
                    {editItems.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic text-center py-4">No hay ítems en este pedido. Agrega uno abajo.</p>
                    ) : (
                      <div className="border border-neutral-100 rounded-2xl overflow-hidden divide-y divide-neutral-50 bg-neutral-50/10">
                        {editItems.map((item) => {
                          const prod = products?.find((p) => p.id === item.productId);
                          const prodName = prod?.name || `Producto #${item.productId}`;
                          return (
                            <div key={item.productId} className="flex justify-between items-center p-3 text-xs gap-3">
                              <span className="font-bold text-neutral-800 truncate flex-1">{prodName}</span>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  className="w-16 h-8 text-center text-xs font-bold border-neutral-200 rounded-lg p-1"
                                  value={item.cant}
                                  min={1}
                                  onChange={(e) => handleUpdateQuantity(item.productId, Number(e.target.value))}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(item.productId)}
                                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selector para Agregar Producto */}
                  <div className="p-4 border border-neutral-100 rounded-2xl bg-neutral-50/20 space-y-3">
                    <Label className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="size-4" /> Agregar Producto al Pedido
                    </Label>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Select value={selectedAddProductId} onValueChange={setSelectedAddProductId}>
                          <SelectTrigger className="border-neutral-200 rounded-xl text-xs w-full bg-white">
                            <SelectValue placeholder="Elige un producto..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {products &&
                                products.map((p) => (
                                  <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.name} ({formatCurrency(p.price)})
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        type="number"
                        placeholder="Cant"
                        className="w-14 h-9 text-center text-xs border-neutral-200 rounded-xl p-1 shrink-0"
                        value={addQuantity}
                        min={1}
                        onChange={(e) => setAddQuantity(Number(e.target.value))}
                      />
                      <Button
                        type="button"
                        onClick={handleAddProduct}
                        className="bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl h-9 px-3 shrink-0"
                      >
                        Añadir
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* MODO VISTA PREVIA */
                <>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Productos en Pedido</p>
                  {orderDetails.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic text-center py-4">No hay detalles de productos para este pedido.</p>
                  ) : (
                    <div className="divide-y divide-neutral-50 border border-neutral-100 rounded-2xl overflow-hidden bg-neutral-50/20">
                      {orderDetails.map((item) => {
                        const productObj = products?.find((p) => p.id === item.productId);
                        const prodName = productObj?.name || `Producto #${item.productId}`;
                        return (
                          <div key={item.id} className="flex justify-between items-center p-3 text-xs">
                            <div className="flex flex-col gap-1 min-w-0 pr-4">
                              <span className="font-bold text-neutral-800 truncate">{prodName}</span>
                              <span className="text-[10px] text-neutral-400 font-medium">
                                {item.cant} {item.cant === 1 ? "unidad" : "unidades"} x {formatCurrency(item.price)}
                              </span>
                            </div>
                            <span className="font-bold text-neutral-700 shrink-0">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {note && (
                    <div className="p-3.5 bg-blue-50/30 border border-blue-50 rounded-2xl flex items-start gap-2.5">
                      <Bookmark className="size-4.5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Notas del Pedido</span>
                        <span className="text-xs text-neutral-600 font-medium">{note}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Total acumulado */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-sm font-extrabold text-neutral-500">Monto Total</span>
              <span className="text-xl font-black text-neutral-800">
                {isEditMode ? formatCurrency(currentEditTotal) : formatCurrency(total)}
              </span>
            </div>

            {/* Footer con Acciones */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              {isEditMode ? (
                /* Acciones de Edición */
                <>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl text-xs font-semibold"
                    onClick={() => setIsEditMode(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    disabled={isUpdating}
                    onClick={handleSaveOrderEdits}
                    className="flex-1 rounded-xl text-xs font-bold gap-1.5 shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isUpdating ? <Spinner className="h-4 w-4" /> : <><Save className="size-4" /> Guardar Cambios</>}
                  </Button>
                </>
              ) : (
                /* Acciones de Vista Previa */
                <>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl text-xs font-semibold"
                    onClick={() => setModalOpen(false)}
                  >
                    Cerrar
                  </Button>
                  
                  {isMounted && isAdmin && (
                    <>
                      <Button
                        variant="outline"
                        className="rounded-xl text-xs font-semibold border-amber-200 hover:bg-amber-50 hover:text-amber-700 gap-1"
                        onClick={() => setIsEditMode(true)}
                      >
                        <Edit className="size-3.5" /> Editar
                      </Button>
                      <Button
                        disabled={isDeleting}
                        className="rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 gap-1.5 shadow-sm text-white"
                        onClick={handleDeleteOrder}
                      >
                        {isDeleting ? <Spinner className="h-4 w-4" /> : <><Trash2 className="size-4" /> Eliminar</>}
                      </Button>
                    </>
                  )}

                  {isMounted && (
                    <Button
                      disabled={isUpdating}
                      onClick={handleToggleStatusClick}
                      className={`flex-1 rounded-xl text-xs font-bold gap-1.5 shadow-sm text-white ${
                        status
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {isUpdating ? (
                        <Spinner className="h-4 w-4" />
                      ) : status ? (
                        <>
                          <RotateCcw className="size-4" /> Marcar Pendiente
                        </>
                      ) : (
                        <>
                          <Check className="size-4" /> Despachar Pedido
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE AUTORIZACIÓN DE ADMINISTRADOR (REGLA DE 2 DÍAS) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setAuthModalOpen(false)}
          />

          <div className="bg-white rounded-3xl shadow-2xl border border-neutral-100 max-w-sm w-full z-20 overflow-hidden p-6 animate-in scale-in-95 duration-200 flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-center items-center">
              <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <KeyRound className="size-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-800 mt-3">Autorización Requerida</h3>
              <p className="text-xs text-neutral-500 leading-normal px-2 mt-1">
                Este pedido fue completado hace más de 2 días. Para reabrirlo, se requiere la clave de un <strong>Administrador</strong>.
              </p>
            </div>

            <form onSubmit={handleAdminAuthorize} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="admin-email" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Correo del Administrador</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@dicenca.com"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="border-neutral-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="admin-pass" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Contraseña</Label>
                <Input
                  id="admin-pass"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="border-neutral-200 rounded-xl text-sm"
                />
              </div>

              {authError && (
                <p className="text-[10px] text-red-500 font-semibold text-center mt-1">{authError}</p>
              )}

              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl text-xs font-semibold"
                  onClick={() => setAuthModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isAuthorizing}
                  className="flex-1 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {isAuthorizing ? <Spinner className="h-4 w-4" /> : "Aprobar Cambio"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
