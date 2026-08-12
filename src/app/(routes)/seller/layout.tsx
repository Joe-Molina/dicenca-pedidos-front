"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  ArrowLeft,
  Package,
  User,
  Home,
  PlusCircle,
  ClipboardList,
} from "lucide-react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Zustand auth store
  const { user, logout } = useAuthStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Función para cerrar la sesión
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const userFullName = user ? `${user.name} ${user.lastname}` : "Vendedor";
  const userInitials = user ? `${user.name[0] || ""}${user.lastname[0] || ""}` : "VE";
  const userRole = user ? user.role : "seller";
  const userEmail = user ? user.email : "vendedor@dicenca.com";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 pb-16 md:pb-0">
      {/* CABECERA PERSISTENTE PARA VENDEDORES */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8 sticky top-0 z-20 shadow-xs">
        {/* Logo superior y Botón Atrás si aplica */}
        <div className="flex items-center gap-3">
          {isMounted && pathname !== "/seller" && (
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-600 border border-gray-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <Link href="/seller" className="flex items-center gap-2">
            <Image
              src={"/logo.jpeg"}
              alt="logo"
              width={32}
              height={32}
              className="rounded-xl border border-gray-100 p-0.5"
            />
            <span className="font-bold text-gray-900 text-sm tracking-tight hidden sm:inline">
              Dicenca Ventas
            </span>
          </Link>
        </div>

        {/* NAVEGACIÓN EN ESCRITORIO (md:flex) */}
        {isMounted && (
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-neutral-500">
            <Link
              href="/seller"
              className={`hover:text-indigo-600 transition-colors ${
                pathname === "/seller" ? "text-indigo-600 font-extrabold" : ""
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/seller/order"
              className={`hover:text-indigo-600 transition-colors ${
                pathname === "/seller/order" ? "text-indigo-600 font-extrabold" : ""
              }`}
            >
              Crear Pedido
            </Link>
            <Link
              href="/seller/history"
              className={`hover:text-indigo-600 transition-colors ${
                pathname === "/seller/history" ? "text-indigo-600 font-extrabold" : ""
              }`}
            >
              Historial
            </Link>
          </nav>
        )}

        {/* Perfil del vendedor y menú desplegable */}
        <div className="relative">
          {isMounted ? (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200 focus:outline-none cursor-pointer"
              >
                <div className="size-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shadow-sm text-xs uppercase">
                  {userInitials}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-xs font-bold text-gray-800 leading-tight">
                    {userFullName}
                  </span>
                  <span className="text-[9px] text-gray-500 font-bold capitalize mt-0.5">
                    {userRole === "seller" ? "Vendedor" : userRole}
                  </span>
                </div>
                <ChevronDown
                  className={`size-3.5 text-gray-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Tarjeta desplegable */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-20 origin-top-right animate-in fade-in-50 slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Sesión de Vendedor
                      </p>
                      <p className="text-xs font-bold text-gray-800 mt-1 truncate">
                        {userFullName}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">{userEmail}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150 cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="h-8 w-24 bg-gray-100 rounded-xl animate-pulse" />
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </main>

      {/* BARRA DE NAVEGACIÓN INFERIOR PARA MÓVILES (md:hidden) */}
      {isMounted && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around z-30 shadow-lg px-2">
          <Link
            href="/seller"
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all duration-150 ${
              pathname === "/seller" ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Home className="size-5.5" />
            <span>Inicio</span>
          </Link>
          <Link
            href="/seller/order"
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all duration-150 ${
              pathname === "/seller/order" ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <PlusCircle className="size-5.5" />
            <span>Crear Pedido</span>
          </Link>
          <Link
            href="/seller/history"
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all duration-150 ${
              pathname === "/seller/history" ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ClipboardList className="size-5.5" />
            <span>Historial</span>
          </Link>
        </div>
      )}
    </div>
  );
}
