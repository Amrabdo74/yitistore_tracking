export type Role = "ADMIN" | "DRIVER";

export type OrderStatus = "NEW" | "RECEIVED" | "ARRIVED" | "DELIVERED" | "FAILED";

export type Currency = "AED" | "OMR";

export type User = {
  id: string;
  email: string;
  role: Role;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  description: string;
  amount: number;
  currency: Currency;
  status: OrderStatus;
  failureReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
};

export type OrderHistoryItem = {
  id: string;
  orderId: string;
  status: OrderStatus;
  createdAt: string;
};

export type OrderStats = {
  total: number;
  new: number;
  inProgress: number;
  delivered: number;
  failed: number;
};

export type PaginatedOrders = {
  data: Order[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  stats: OrderStats;
};

export type OrderFormValues = {
  customerName: string;
  phone: string;
  address: string;
  description: string;
  amount: number;
  currency: Currency;
  notes: string;
};
