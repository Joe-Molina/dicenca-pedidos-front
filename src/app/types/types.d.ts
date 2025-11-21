export interface PortFolioProps {
  id: number;
  name: string;
}

export interface ZoneProps {
  id: number;
  names: string;
  vendedorId: number;
}

export interface ClientProps {
  id: number;
  address: string;
  rif: string;
  contact: number;
  cod_sunagro: number;
  zoneId: number;
}

export interface ProductProps {
  id: number;
  name: string;
  gr: number;
  price: number;
  portafolioId: number;
}

export interface SellerProps {
  id: number;
  name: string;
  contact: number;
}
export interface OrderProps {
  id: number;
  clientId: number;
  createdAt: Date;
  notes: string;
  details: OrderDetailsProps[];
}

export interface OrderDetailsProps {
  id: number;
  price: number;
  cant: number;
  total: number;
  orderId: number;
  productId: number;
}

export interface CreateOrderProps {
  clientId: number;
  notes: string;
  details: Omit<OrderDetailsProps[], "id", "orderId" | "gr" | "total">;
}
