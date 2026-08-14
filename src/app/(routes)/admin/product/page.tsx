"use client";

import React, { useState, useMemo } from "react";
import { useProductQuery } from "@/app/querys/useProduct.query";
import { usePortfolioQuery } from "@/app/querys/usePortfolio.query";
import CreateProductDrawer from "../components/CreateProductDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Package,
    DollarSign,
    Search,
    Trash2,
    Edit2,
    Check,
    X,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    Boxes,
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
import { ProductProps } from "@/app/types/types";

export default function AdminProduct() {
    const {
        query: { data: products, isLoading: productsLoading },
        deleteProductMutation,
        editProductMutation,
    } = useProductQuery();

    const {
        query: { data: portfolios, isLoading: portfoliosLoading },
    } = usePortfolioQuery();

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPortfolioFilter, setSelectedPortfolioFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

    // Inline Editing State - tracks the product ID currently being edited inline
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        gr: 0,
        price: 0,
        stock: 0,
        portafolioId: 0,
    });
    const [isSaving, setIsSaving] = useState(false);

    // Filters products based on search input, portfolio, and stock status
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPortfolio =
                selectedPortfolioFilter === "all" || product.portafolioId === Number(selectedPortfolioFilter);
            
            const productStock = product.stock ?? 0;
            let matchesStock = true;
            if (stockFilter === "out_of_stock") {
                matchesStock = productStock === 0;
            } else if (stockFilter === "low_stock") {
                matchesStock = productStock > 0 && productStock <= 10;
            } else if (stockFilter === "in_stock") {
                matchesStock = productStock > 10;
            }

            return matchesSearch && matchesPortfolio && matchesStock;
        });
    }, [products, searchTerm, selectedPortfolioFilter, stockFilter]);

    // Calculations for inventory statistics
    const stats = useMemo(() => {
        const totalProducts = products?.length || 0;
        const totalStock = products?.reduce((acc, p) => acc + (p.stock || 0), 0) || 0;
        const outOfStockCount = products?.filter((p) => (p.stock ?? 0) === 0).length || 0;
        const lowStockCount = products?.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length || 0;
        const totalPrice = products?.reduce((acc, p) => acc + p.price, 0) || 0;
        const avgPrice = totalProducts > 0 ? (totalPrice / totalProducts).toFixed(2) : "0.00";

        return {
            totalProducts,
            totalStock,
            outOfStockCount,
            lowStockCount,
            avgPrice,
        };
    }, [products]);

    // Handlers for Inline Edit
    const handleStartEdit = (product: ProductProps) => {
        setEditingId(product.id);
        setEditForm({
            name: product.name,
            gr: product.gr,
            price: product.price,
            stock: product.stock ?? 0,
            portafolioId: product.portafolioId,
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveEdit = async (id: number) => {
        if (!editForm.name.trim()) {
            toast.error("El nombre del producto no puede estar vacío");
            return;
        }
        if (editForm.gr < 0 || editForm.price < 0) {
            toast.error("El peso y el precio deben ser mayores o iguales a 0");
            return;
        }
        if (editForm.stock < 0) {
            toast.error("La cantidad en inventario (stock) no puede ser negativa");
            return;
        }
        if (!editForm.portafolioId) {
            toast.error("Debes asociar el producto a un portafolio");
            return;
        }

        setIsSaving(true);
        try {
            await editProductMutation.mutateAsync(
                {
                    id,
                    name: editForm.name,
                    gr: Number(editForm.gr),
                    price: Number(editForm.price),
                    stock: Number(editForm.stock),
                    portafolioId: Number(editForm.portafolioId),
                },
                {
                    onSuccess: () => {
                        toast.success("Producto actualizado exitosamente", {
                            description: new Date().toLocaleString(),
                        });
                        setEditingId(null);
                    },
                    onError: (err) => {
                        toast.error("Error al actualizar el producto", {
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

    const handleDelete = (id: number, name: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar el producto "${name}"?`)) {
            deleteProductMutation.mutateAsync(id, {
                onSuccess: () => {
                    toast.success("Producto eliminado exitosamente", {
                        description: new Date().toLocaleString(),
                    });
                },
                onError: (err) => {
                    toast.error("Error al eliminar el producto", {
                        description: err.message,
                    });
                },
            });
        }
    };

    const isLoading = productsLoading || portfoliosLoading;

    return (
        <div className="flex min-h-screen w-full flex-col gap-6 bg-neutral-50/50 p-4 md:p-8">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                        Productos e Inventario
                    </h1>
                    <p className="text-sm font-medium text-neutral-500">
                        Gestiona tu catálogo, precios, bultos disponibles y alertas de inventario.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <CreateProductDrawer />
                </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Products Card */}
                <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Package className="h-5.5 w-5.5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                Total Productos
                            </p>
                            <h3 className="text-xl font-bold text-neutral-800 mt-0.5">
                                {isLoading ? (
                                    <span className="inline-block h-6 w-8 animate-pulse rounded bg-neutral-200" />
                                ) : (
                                    stats.totalProducts
                                )}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Total Stock Units Card */}
                <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Boxes className="h-5.5 w-5.5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                Bultos en Stock
                            </p>
                            <h3 className="text-xl font-bold text-neutral-800 mt-0.5">
                                {isLoading ? (
                                    <span className="inline-block h-6 w-12 animate-pulse rounded bg-neutral-200" />
                                ) : (
                                    `${stats.totalStock.toLocaleString()} bultos`
                                )}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alert Card (<= 10) */}
                <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/30 p-5 shadow-xs transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <AlertTriangle className="h-5.5 w-5.5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                Stock Bajo (≤ 10 bultos)
                            </p>
                            <h3 className="text-xl font-bold text-amber-800 mt-0.5">
                                {isLoading ? (
                                    <span className="inline-block h-6 w-8 animate-pulse rounded bg-amber-200" />
                                ) : (
                                    `${stats.lowStockCount} productos`
                                )}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Out of Stock Card (0) */}
                <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-red-50/30 p-5 shadow-xs transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <AlertCircle className="h-5.5 w-5.5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                                Productos Agotados (0)
                            </p>
                            <h3 className="text-xl font-bold text-red-700 mt-0.5">
                                {isLoading ? (
                                    <span className="inline-block h-6 w-8 animate-pulse rounded bg-red-200" />
                                ) : (
                                    `${stats.outOfStockCount} productos`
                                )}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Bar (Search + Advanced Filters) */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        type="text"
                        placeholder="Buscar productos por nombre..."
                        className="pl-9 pr-4 py-2 border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-semibold"
                        >
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Portfolio Dropdown Filter */}
                <div className="w-full md:w-56">
                    <Select
                        value={selectedPortfolioFilter}
                        onValueChange={setSelectedPortfolioFilter}
                    >
                        <SelectTrigger className="w-full border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-xs">
                            <SelectValue placeholder="Filtrar por Portafolio" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">Todos los Portafolios</SelectItem>
                                {portfolios &&
                                    portfolios.map((portfolio) => (
                                        <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                                            {portfolio.name}
                                        </SelectItem>
                                    ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {/* Stock Status Filter */}
                <div className="w-full md:w-56">
                    <Select
                        value={stockFilter}
                        onValueChange={(val: any) => setStockFilter(val)}
                    >
                        <SelectTrigger className="w-full border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-xs">
                            <SelectValue placeholder="Estado de Stock" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">Todo el Inventario</SelectItem>
                                <SelectItem value="in_stock">En Stock (&gt; 10 bultos)</SelectItem>
                                <SelectItem value="low_stock">Stock Bajo (≤ 10 bultos)</SelectItem>
                                <SelectItem value="out_of_stock">Agotados (0 bultos)</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Products Main Table */}
            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-16 w-full animate-pulse rounded-xl bg-white border border-neutral-100 p-4"
                        />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center shadow-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 shadow-inner">
                        <Package className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-neutral-800">
                        No se encontraron productos
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500 max-w-sm">
                        {searchTerm || selectedPortfolioFilter !== "all" || stockFilter !== "all"
                            ? "Prueba a cambiar los términos de búsqueda o a limpiar los filtros actuales."
                            : "Crea tu primer producto utilizando el botón superior para empezar a catalogar tu inventario."}
                    </p>
                    {(searchTerm || selectedPortfolioFilter !== "all" || stockFilter !== "all") && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedPortfolioFilter("all");
                                setStockFilter("all");
                            }}
                            className="mt-4 rounded-xl text-xs"
                        >
                            Restablecer Filtros
                        </Button>
                    )}
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-xs font-bold uppercase tracking-wider text-neutral-400">
                                    <th className="px-6 py-4">Producto</th>
                                    <th className="px-6 py-4">Portafolio</th>
                                    <th className="px-6 py-4 text-center">Stock (Bultos)</th>
                                    <th className="px-6 py-4 text-right">Peso (Gramos)</th>
                                    <th className="px-6 py-4 text-right">Precio ($)</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {filteredProducts.map((product) => {
                                    const isEditing = editingId === product.id;
                                    const portfolioName =
                                        portfolios?.find((p) => p.id === product.portafolioId)?.name || "Sin Portafolio";
                                    const productStock = product.stock ?? 0;

                                    return (
                                        <tr
                                            key={product.id}
                                            className="group transition-colors duration-200 hover:bg-neutral-50/40"
                                        >
                                            {/* Name Column */}
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <Input
                                                        type="text"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="h-9 w-full min-w-[150px] border-blue-500 focus:ring-blue-500 text-sm font-semibold rounded-lg"
                                                        disabled={isSaving}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                                                            <Package className="h-4.5 w-4.5" />
                                                        </div>
                                                        <span className="font-semibold text-neutral-800 transition-colors group-hover:text-blue-600 duration-300">
                                                            {product.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Portfolio Column */}
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <Select
                                                        value={editForm.portafolioId.toString()}
                                                        onValueChange={(val) => setEditForm({ ...editForm, portafolioId: Number(val) })}
                                                        disabled={isSaving}
                                                    >
                                                        <SelectTrigger className="h-9 w-full min-w-[130px] border-blue-500 focus:ring-blue-500 rounded-lg text-xs font-semibold">
                                                            <SelectValue placeholder="Selecciona" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {portfolios &&
                                                                portfolios.map((p) => (
                                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                                        {p.name}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                                                        {portfolioName}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Stock / Cantidad Column */}
                                            <td className="px-6 py-4 text-center">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={editForm.stock}
                                                            onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                                                            className="h-9 w-24 border-blue-500 focus:ring-blue-500 text-sm text-center font-bold rounded-lg"
                                                            disabled={isSaving}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center">
                                                        {productStock === 0 ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-700">
                                                                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                                                Agotado (0 bultos)
                                                            </span>
                                                        ) : productStock <= 10 ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                                                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                                                Poco stock ({productStock} {productStock === 1 ? "bulto" : "bultos"})
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                                {productStock} {productStock === 1 ? "bulto" : "bultos"}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Weight Column */}
                                            <td className="px-6 py-4 text-right">
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={editForm.gr}
                                                        onChange={(e) => setEditForm({ ...editForm, gr: Number(e.target.value) })}
                                                        className="h-9 w-24 ml-auto border-blue-500 focus:ring-blue-500 text-sm text-right font-semibold rounded-lg"
                                                        disabled={isSaving}
                                                    />
                                                ) : (
                                                    <span className="font-medium text-neutral-600 text-sm">
                                                        {product.gr} gr
                                                    </span>
                                                )}
                                            </td>

                                            {/* Price Column */}
                                            <td className="px-6 py-4 text-right">
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={editForm.price}
                                                        onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                                        className="h-9 w-24 ml-auto border-blue-500 focus:ring-blue-500 text-sm text-right font-semibold rounded-lg"
                                                        disabled={isSaving}
                                                    />
                                                ) : (
                                                    <span className="font-bold text-neutral-800 text-sm">
                                                        ${product.price.toFixed(2)}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions Column */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {isEditing ? (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 rounded-lg px-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                                onClick={() => handleSaveEdit(product.id)}
                                                                disabled={isSaving}
                                                            >
                                                                {isSaving ? (
                                                                    <Spinner className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <Check className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 rounded-lg px-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
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
                                                                className="h-8 w-8 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-blue-600 transition-colors"
                                                                onClick={() => handleStartEdit(product)}
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-red-600 transition-colors"
                                                                onClick={() => handleDelete(product.id, product.name)}
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
