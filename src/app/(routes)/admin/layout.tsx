"use client";
import { useNavStore } from "@/app/store/navLinksStatus";
import { useAuthStore } from "@/app/store/useAuthStore";
import {
  ArrowLeft,
  Menu,
  X,
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Package,
  Users,
  MapPin,
  UserCheck,
  ChevronDown,
  LogOut,
  Home,
  ClipboardList, // Importamos ClipboardList para el historial
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Zustand stores
  const { links, setCurrent } = useNavStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Función para alternar el menú móvil
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Iconos para la barra lateral
  const getLinkIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "inicio":
        return <LayoutDashboard className='size-5 shrink-0' />;
      case "crear pedido":
        return <PlusCircle className='size-5 shrink-0' />;
      case "historial":
        return <ClipboardList className='size-5 shrink-0' />; // Ícono para el historial
      case "portafolios":
        return <Briefcase className='size-5 shrink-0' />;
      case "productos":
        return <Package className='size-5 shrink-0' />;
      case "usuarios":
        return <Users className='size-5 shrink-0' />; // Ícono para la gestión de usuarios
      case "zonas":
        return <MapPin className='size-5 shrink-0' />;
      case "clientes":
        return <UserCheck className='size-5 shrink-0' />;
      default:
        return <Home className='size-5 shrink-0' />;
    }
  };

  // Datos de usuario seguros con fallback
  const userFullName = user ? `${user.name} ${user.lastname}` : "Administrador";
  const userInitials = user ? `${user.name[0] || ""}${user.lastname[0] || ""}` : "AD";
  const userRole = user ? user.role : "admin";
  const userEmail = user ? user.email : "admin@dicenca.com";

  return (
    <div className='min-h-screen flex bg-gray-50 text-gray-800'>
      {/* 1. SIDEBAR PARA ESCRITORIO (md y superior) */}
      <aside className='hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200 z-30 shadow-sm'>
        {/* Logo superior */}
        <div className='flex items-center gap-3 px-6 h-16 border-b border-gray-100 shrink-0'>
          <Image
            src={"/logo.jpeg"}
            alt='logo'
            width={36}
            height={36}
            className='rounded-xl border border-gray-100 p-0.5 shadow-sm'
          />
          <span className='font-bold text-gray-900 text-base tracking-tight'>
            Dicenca Pedidos
          </span>
        </div>

        {/* Links de navegación */}
        <nav className='flex-grow px-4 py-6 space-y-1.5 overflow-y-auto'>
          {links.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setCurrent(index)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-sm ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200/50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {getLinkIcon(item.name)}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 2. CONTENEDOR PRINCIPAL */}
      <div className='flex flex-col flex-grow md:pl-64 min-h-screen w-full'>
        {/* HEADER DE ESCRITORIO (md y superior) */}
        <header className='hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-8 sticky top-0 z-20'>
          {/* Título de la sección o ruta actual */}
          <div>
            <h1 className='text-lg font-bold text-gray-800 capitalize'>
              {pathname === "/admin"
                ? "Inicio"
                : pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Inicio"}
            </h1>
          </div>

          {/* Menú de perfil del usuario */}
          <div className='relative'>
            {isMounted ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className='flex items-center gap-2.5 p-1.5 px-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-50 cursor-pointer'
                >
                  <div className='size-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm text-xs uppercase'>
                    {userInitials}
                  </div>
                  <div className='hidden sm:flex flex-col items-start text-left'>
                    <span className='text-xs font-bold text-gray-800 leading-tight'>
                      {userFullName}
                    </span>
                    <span className='text-[10px] text-gray-500 font-bold capitalize mt-0.5'>
                      {userRole}
                    </span>
                  </div>
                  <ChevronDown
                    className={`size-3.5 text-gray-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Card */}
                {dropdownOpen && (
                  <>
                    {/* Backdrop transparente para cerrar al hacer clic fuera */}
                    <div
                      className='fixed inset-0 z-10 cursor-default'
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className='absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-20 transition-all duration-200 origin-top-right animate-in fade-in-50 slide-in-from-top-2'>
                      <div className='px-4 py-3 border-b border-gray-100'>
                        <p className='text-[9px] font-bold text-gray-400 uppercase tracking-wider'>
                          Sesión iniciada
                        </p>
                        <p className='text-sm font-bold text-gray-800 mt-1 truncate'>
                          {userFullName}
                        </p>
                        <p className='text-xs text-gray-500 mt-0.5 truncate'>
                          {userEmail}
                        </p>
                      </div>
                      <div className='p-1.5'>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className='w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150 cursor-pointer'
                        >
                          <LogOut className='size-4' />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className='h-8 w-28 bg-gray-100 rounded-xl animate-pulse' />
            )}
          </div>
        </header>

        {/* 3. MENÚ MÓVIL (Por debajo de md) */}
        <nav className='bg-white shadow-sm md:hidden sticky top-0 z-20 border-b border-gray-100'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6'>
            <div className='flex justify-between items-center h-16'>
              {/* Logo/Marca y Botón Atrás */}
              <div className='flex items-center gap-2'>
                {isMounted && pathname !== "/admin" && (
                  <button
                    onClick={() => router.back()}
                    className='p-1.5 hover:bg-gray-50 rounded-lg text-gray-600 border border-gray-100 transition-colors'
                  >
                    <ArrowLeft className='size-5' />
                  </button>
                )}
                <Image
                  src={"/logo.jpeg"}
                  alt='logo'
                  width={38}
                  height={38}
                  className='rounded-xl border border-gray-100 p-0.5'
                />
                <span className='font-bold text-gray-900 text-sm tracking-tight'>
                  Dicenca
                </span>
              </div>

              {/* Botón Hamburguesa */}
              <button
                type='button'
                onClick={toggleMenu}
                className='inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-150'
                aria-controls='mobile-menu-content'
                aria-expanded={isOpen}
              >
                <span className='sr-only'>Abrir menú principal</span>
                {isOpen ? <X className='size-5' /> : <Menu className='size-5' />}
              </button>
            </div>
          </div>

          {/* Contenido del menú móvil */}
          <div
            className={`${
              isOpen ? "block" : "hidden"
            } border-t border-gray-100 bg-white shadow-inner`}
            id='mobile-menu-content'
          >
            <div className='px-4 pt-3 pb-4 space-y-1.5'>
              {/* Mapeo de Enlaces */}
              {links.map((item, index) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    } flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      setCurrent(index);
                      toggleMenu();
                    }}
                  >
                    {getLinkIcon(item.name)}
                    {item.name}
                  </Link>
                );
              })}

              {/* Información de usuario y Botón de Cerrar Sesión */}
              <div className='border-t border-gray-100 mt-4 pt-4 px-2'>
                {isMounted && user && (
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='size-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs uppercase'>
                      {userInitials}
                    </div>
                    <div>
                      <p className='text-xs font-bold text-gray-800 leading-tight'>
                        {userFullName}
                      </p>
                      <p className='text-[10px] text-gray-500 font-medium truncate mt-0.5'>
                        {userEmail}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className='w-full flex items-center gap-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 text-left'
                >
                  <LogOut className='size-4' />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* 4. CONTENIDO DE LA PÁGINA */}
        <main className='flex-grow p-4 md:p-6 bg-gray-50 overflow-y-auto'>
          {children}
        </main>
      </div>
    </div>
  );
}
