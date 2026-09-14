import { api } from "./api";
import type { Order, OrderFormValues, OrderHistoryItem, PaginatedOrders, User } from "./types";

export async function loginRequest(email: string, password: string) {
  return api<{ user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutRequest() {
  return api<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export async function meRequest() {
  return api<{ user: User }>("/api/auth/me");
}

export type OrderQuery = {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  date?: string;
};

export async function listOrders(query: OrderQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.status) params.set("status", query.status);
  if (query.search) params.set("search", query.search);
  if (query.date) params.set("date", query.date);
  const qs = params.toString();
  return api<PaginatedOrders>(`/api/orders${qs ? `?${qs}` : ""}`);
}

export async function getOrder(id: string) {
  return api<{ data: Order }>(`/api/orders/${id}`);
}

export async function createOrder(values: OrderFormValues) {
  return api<{ data: Order }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export async function updateOrder(id: string, values: OrderFormValues) {
  return api<{ data: Order }>(`/api/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

export async function deleteOrder(id: string) {
  return api<{ ok: boolean }>(`/api/orders/${id}`, { method: "DELETE" });
}

export async function updateOrderStatus(
  id: string,
  status: string,
  failureReason?: string,
) {
  return api<{ data: Order }>(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, failureReason }),
  });
}

export async function getOrderHistory(id: string) {
  return api<{ data: OrderHistoryItem[] }>(`/api/orders/${id}/history`);
}
