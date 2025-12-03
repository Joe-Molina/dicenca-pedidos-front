import { create } from "zustand";

const navLinksStart = [
  { name: "Inicio", href: "/admin", current: true },
  { name: "crear pedido", href: "/admin/order", current: false },
  { name: "Productos", href: "/admin/product", current: false },
  { name: "Vendedores", href: "/admin/seller", current: false },
  { name: "Zonas", href: "/admin/zone", current: false },
  { name: "Clientes", href: "/admin/client", current: false },
  // { name: "Perfil", href: "#perfil", current: false },
];

const navLinks = [
  { name: "Inicio", href: "/admin", current: false },
  { name: "crear pedido", href: "/admin/orders", current: false },
  { name: "Productos", href: "/admin/product", current: false },
  { name: "Vendedores", href: "/admin/seller", current: false },
  { name: "Zonas", href: "/admin/zone", current: false },
  { name: "Clientes", href: "/admin/client", current: false },
  // { name: "Perfil", href: "#perfil", current: false },
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
