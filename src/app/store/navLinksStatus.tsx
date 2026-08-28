import { create } from "zustand";

const navLinksStart = [
  { name: "Inicio", href: "/admin", current: true },
  { name: "crear pedido", href: "/admin/order", current: false },
  { name: "Historial", href: "/admin/history", current: false }, // Enlace añadido para el historial
  { name: "Portafolios", href: "/admin/portfolio", current: false },
  { name: "Productos", href: "/admin/product", current: false },
  { name: "Usuarios", href: "/admin/users", current: false }, // Cambiado a Gestión de Usuarios
  { name: "Zonas", href: "/admin/zone", current: false },
  { name: "Clientes", href: "/admin/client", current: false },
  { name: "Auditoría", href: "/admin/audit", current: false },
];

const navLinks = [
  { name: "Inicio", href: "/admin", current: false },
  { name: "crear pedido", href: "/admin/order", current: false },
  { name: "Historial", href: "/admin/history", current: false }, // Enlace añadido para el historial
  { name: "Portafolios", href: "/admin/portfolio", current: false },
  { name: "Productos", href: "/admin/product", current: false },
  { name: "Usuarios", href: "/admin/users", current: false }, // Cambiado a Gestión de Usuarios
  { name: "Zonas", href: "/admin/zone", current: false },
  { name: "Clientes", href: "/admin/client", current: false },
  { name: "Auditoría", href: "/admin/audit", current: false },
];

interface LinkProps {
  name: string;
  href: string;
  current: boolean;
}

interface NavProps {
  links: LinkProps[];
  setCurrent: (index: number) => void;
}

export const useNavStore = create<NavProps>((set) => ({
  links: navLinksStart,
  setCurrent: (index: number) => {
    const updatedLinks = navLinks.map((link) => {
      link.current = false;
      return link;
    });
    updatedLinks[index].current = true;
    set({ links: updatedLinks });
  },
}));
