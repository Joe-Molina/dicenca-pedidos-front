export interface PortFolioProps {
  id: number;
  name: string;
}

export interface ZoneProps {
  id: number;
  names: string;
  userId: number;
}

export interface UserProps {
  id: number;
  username: string;
  password: string;
  name: string;
  lastname: string;
  email: string;
  role: "seller" | "admin";
  status?: boolean;
}

export interface ClientProps {
  id: number;
  address: string;
  rif: string;
  contact: string | number;
  cod_sunagro: number;
  zoneId: number;
  name: string;
  company_name: string;
}

export interface ProductProps {
  id: number;
  name: string;
  gr: number;
  price: number;
  stock: number;
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
  updatedAt?: Date; // Campo para rastrear la última actualización de estado
  notes: string;
  status: boolean;
  orderDetails: OrderDetailsProps[];
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

export interface TypeInvoiceProps {
  id: number;
  name: "Factura" | "Nota de entrega" | "Ambas";
  description: string;
}
interface UserPayload {
  id: number;
  username: string;
  password: string;
  name: string;
  lastname: string;
  email: string;
  role: "admin" | "seller";
}

export interface AuditLogProps {
  id: string;
  createdAt: string;
  userId: number | null;
  user?: {
    id: number;
    name: string;
    lastname: string;
    username: string;
    email: string;
    role: string;
  } | null;
  action: string;
  entity: string;
  entityId: string;
  oldData: string | null;
  newData: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AuditStatsProps {
  totalLogs: number;
  todayLogs: number;
  createLogs: number;
  updateLogs: number;
  deleteLogs: number;
  loginLogs: number;
  recentLogs: AuditLogProps[];
}

export interface AuditFilters {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entity?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
}

