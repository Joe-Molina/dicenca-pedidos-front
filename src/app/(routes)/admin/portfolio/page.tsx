"use client";

import React, { useState, useMemo } from "react";
import { usePortfolioQuery } from "@/app/querys/usePortfolio.query";
import { useProductQuery } from "@/app/querys/useProduct.query";
import CreatePortfolioDrawer from "../components/CreatePortfolioDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Folder,
    Package,
    TrendingUp,
    Search,
    Trash2,
    Edit2,
    Check,
    X,
    Plus,
    FolderOpen
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function AdminPortfolio() {
    const {
        query: { data: portfolios, isLoading: portfoliosLoading },
        deletePortfolioMutation,
        editPortfolioMutation,
    } = usePortfolioQuery();

    const {
        query: { data: products, isLoading: productsLoading },
    } = useProductQuery();

    // Search state
    const [searchTerm, setSearchTerm] = useState("");

    // Editing state - tracks the portfolio ID currently being edited inline
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Filters portfolios based on search query
    const filteredPortfolios = useMemo(() => {
        if (!portfolios) return [];
        return portfolios.filter((portfolio) =>
            portfolio.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [portfolios, searchTerm]);

    // Calculations for dashboard statistics
    const stats = useMemo(() => {
        const totalPortfolios = portfolios?.length || 0;
        const totalProducts = products?.length || 0;
        const avgProducts = totalPortfolios > 0 ? (totalProducts / totalPortfolios).toFixed(1) : "0.0";

        return {
            totalPortfolios,
            totalProducts,
            avgProducts,
        };
    }, [portfolios, products]);

    // Handlers
    const handleStartEdit = (id: number, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const handleSaveEdit = async (id: number) => {
        if (!editName.trim()) {
            toast.error("El nombre del portafolio no puede estar vacío");
            return;
        }

        setIsSaving(true);
        try {
            await editPortfolioMutation.mutateAsync(
                { id, name: editName },
                {
                    onSuccess: () => {
                        toast.success("Portafolio actualizado exitosamente", {
                            description: new Date().toLocaleString(),
                        });
                        setEditingId(null);
                        setEditName("");
                    },
                    onError: (err) => {
                        toast.error("Error al actualizar portafolio", {
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
        if (confirm(`¿Estás seguro de que deseas eliminar el portafolio "${name}"?`)) {
            deletePortfolioMutation.mutateAsync(id, {
                onSuccess: () => {
                    toast.success("Portafolio eliminado exitosamente", {
                        description: new Date().toLocaleString(),
                    });
                },
                onError: (err) => {
                    toast.error("Error al eliminar el portafolio", {
                        description: err.message,
                    });
                },
            });
        }
    };

    const isLoading = portfoliosLoading || productsLoading;

    return (
        <div className="flex min-h-screen w-full flex-col gap-6 bg-neutral-50/50 p-4 md:p-8">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                        Portafolios
                    </h1>
                    <p className="text-sm font-medium text-neutral-500">
                        Administra tus portafolios de productos, catálogos y clasificaciones.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <CreatePortfolioDrawer />
                </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Total Portfolios Card */}
                <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-blue-500/5 blur-xl"></div>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Folder className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                Total Portafolios
                            </p>
                            <h3 className="text-2xl font-bold text-neutral-800">
                                {isLoading ? (
                                    <span className="inline-block h-6 w-8 animate-pulse rounded bg-neutral-200" />
                                ) : (
                                    stats.totalPortfolios
                                )}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Total Products Card */}
                <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-blue-500/5 blur-xl"></div>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                Productos Asignados
                            </p>
                            <h3 className="text-2xl font-bold text-neutral-800">
                                {isLoading ? (
                                    <span className="inline-block h-6 w-8 animate-pulse rounded bg-neutral-200" />
                                ) : (
                                    stats.totalProducts
                                )}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Avg Products per Portfolio */}
                <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl"></div>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                Promedio Productos
                            </p>
                            <h3 className="text-2xl font-bold text-neutral-800">
                                {isLoading ? (
                                    <span className="inline-block h-6 w-8 animate-pulse rounded bg-neutral-200" />
                                ) : (
                                    `${stats.avgProducts} / p`
                                )}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Bar (Search + Info) */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        type="text"
                        placeholder="Buscar portafolios por nombre..."
                        className="pl-9 pr-4 py-2 border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
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
                <div className="text-xs text-neutral-500 font-medium px-1">
                    {!isLoading && (
                        <span>
                            Mostrando <strong>{filteredPortfolios.length}</strong> de{" "}
                            <strong>{portfolios?.length || 0}</strong> portafolios
                        </span>
                    )}
                </div>
            </div>

            {/* Portfolios Main Area */}
            {isLoading ? (
                // Premium Skeleton Grid Loader
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-neutral-100" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-neutral-100" />
                                    <div className="h-3 w-1/2 rounded bg-neutral-100" />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                                <div className="h-8 w-8 rounded-lg bg-neutral-100" />
                                <div className="h-8 w-8 rounded-lg bg-neutral-100" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPortfolios.length === 0 ? (
                // Elegant empty state
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center shadow-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 shadow-inner">
                        <FolderOpen className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-neutral-800">
                        No se encontraron portafolios
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500 max-w-sm">
                        {searchTerm
                            ? "Prueba a cambiar los términos de búsqueda o a limpiar el filtro actual."
                            : "Crea tu primer portafolio utilizando el botón superior para empezar a catalogar tus productos."}
                    </p>
                    {searchTerm && (
                        <Button
                            variant="outline"
                            onClick={() => setSearchTerm("")}
                            className="mt-4 rounded-xl"
                        >
                            Limpiar Búsqueda
                        </Button>
                    )}
                </div>
            ) : (
                // Portfolios Grid
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPortfolios.map((portfolio) => {
                        const isEditing = editingId === portfolio.id;
                        const portfolioProductsCount = products
                            ? products.filter((p) => p.portafolioId === portfolio.id).length
                            : 0;

                        return (
                            <div
                                key={portfolio.id}
                                className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/20 hover:shadow-lg"
                            >
                                {/* Subtle Background Glow Accent on Card Hover */}
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-blue-500/0 blur-xl transition-all duration-500 group-hover:bg-blue-500/5"></div>

                                <div className="flex items-start gap-4">
                                    {/* Folder Icon Container */}
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                                        <Folder className="h-6 w-6" />
                                    </div>

                                    {/* Title & Metadata Area */}
                                    <div className="min-w-0 flex-1">
                                        {isEditing ? (
                                            // Inline Editing State
                                            <div className="flex flex-col gap-2">
                                                <Input
                                                    type="text"
                                                    className="h-9 w-full border-blue-500 focus:ring-blue-500 text-sm font-semibold rounded-lg"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    disabled={isSaving}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleSaveEdit(portfolio.id);
                                                        if (e.key === "Escape") handleCancelEdit();
                                                    }}
                                                />
                                                <span className="text-[10px] text-neutral-400 font-medium">
                                                    Presiona Enter para guardar, Esc para cancelar
                                                </span>
                                            </div>
                                        ) : (
                                            // Static Display State
                                            <>
                                                <h4 className="truncate text-lg font-bold text-neutral-800 transition-colors duration-300 group-hover:text-blue-600">
                                                    {portfolio.name}
                                                </h4>
                                                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                                                    <Package className="h-3.5 w-3.5 text-neutral-400" />
                                                    <span>
                                                        {portfolioProductsCount === 1
                                                            ? "1 producto asociado"
                                                            : `${portfolioProductsCount} productos asociados`}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Card Action Buttons footer */}
                                <div className="mt-6 flex justify-end gap-1.5 border-t border-neutral-50 pt-4">
                                    {isEditing ? (
                                        // Editing Actions
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 rounded-lg px-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                onClick={() => handleSaveEdit(portfolio.id)}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? (
                                                    <Spinner className="mr-1 h-3 w-3" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                                <span className="ml-1 text-xs font-semibold">Guardar</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 rounded-lg px-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                                                onClick={handleCancelEdit}
                                                disabled={isSaving}
                                            >
                                                <X className="h-4 w-4" />
                                                <span className="ml-1 text-xs font-semibold">Cancelar</span>
                                            </Button>
                                        </>
                                    ) : (
                                        // Regular Display Actions
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-blue-600"
                                                onClick={() => handleStartEdit(portfolio.id, portfolio.name)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-red-600"
                                                onClick={() => handleDelete(portfolio.id, portfolio.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
