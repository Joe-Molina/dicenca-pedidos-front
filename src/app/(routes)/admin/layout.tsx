"use client";
import { useNavStore } from "@/app/store/navLinksStatus";
// import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Array de enlaces (configurable)
  const { links, setCurrent } = useNavStore();

  // Función para alternar el estado (se llama al hacer clic en la hamburguesa)
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className='h-full w-full'>
      <nav className='bg-white shadow-sm md:hidden'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <div className='flex justify-between items-center h-16'>
            {/* Logo/Marca */}
            <div className='flex gap-2'>
              {links[0].current == false && (
                <button onClick={() => router.back()}>
                  <ArrowLeft />
                </button>
              )}
              <Image
                src={"/logo.jpeg"}
                alt='logo'
                width={100}
                height={100}
                className='rounded-2xl border p-1'
              />
            </div>

            {/* Botón Hamburguesa */}
            <button
              type='button'
              onClick={toggleMenu} // ⬅️ Llama al toggle de React
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition duration-150 ease-in-out'
              aria-controls='mobile-menu-content'
              aria-expanded={isOpen}
            >
              <span className='sr-only'>Abrir menú principal</span>

              {/* Icono de hamburguesa o de cerrar, según el estado */}
              {isOpen ? (
                // Icono de Cerrar (X)
                <X />
              ) : (
                // Icono de Hamburguesa
                <Menu />
              )}
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL MENÚ MÓVIL (Se muestra/oculta con el estado 'isOpen') */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } transition-all duration-300 ease-in-out`}
          id='mobile-menu-content'
        >
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
            {/* Mapeo de Enlaces */}
            {links.map((item, index) => (
              // Si usa Next.js, reemplace <a> con <Link href={item.href}>...</Link>
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-indigo-500 hover:text-white"
                } 
                                block px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out`}
                aria-current={item.current ? "page" : undefined}
                onClick={() => {
                  // Opcional: cerrar el menú al hacer clic en un enlace
                  setCurrent(index);
                  toggleMenu();
                }}
              >
                {item.name}
              </Link>
            ))}

            {/* Botón de Cerrar Sesión */}
            <div className='border-t border-gray-200 mt-4 pt-4'>
              <Link
                href='#'
                className='text-red-600 hover:bg-red-50 hover:text-red-700 block px-3 py-2 rounded-md text-base font-medium'
              >
                Cerrar Sesión
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Aquí se inyecta la página específica (ej: page.tsx de /dashboard/settings) */}
      <section className='p-1 '>{children}</section>
    </div>
  );
}
