const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'confirm' | 'cancel' | 'complete';

export interface IOrderProduct {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

export interface IOrder {
  _id: string;
  customerName?: string;
  guests?: number;
  user?: { _id: string; name: string; email: string };
  table: { _id: string; number: number; status: string };
  products: IOrderProduct[];
  phone?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  table: string;
  products: { product: string; quantity: number }[];
  customerName?: string;
  phone?: string;
  guests?: number;
  status?: OrderStatus;
}

export interface UpdateOrderPayload {
  table?: string;
  products?: { product: string; quantity: number }[];
  customerName?: string;
  phone?: string;
  guests?: number;
  status?: OrderStatus;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Đã xảy ra lỗi.');
  return data as T;
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const orderService = {
  getAll: (token: string) =>
    request<IOrder[]>('/orders', { headers: authHeader(token) }),

  getById: (token: string, id: string) =>
    request<IOrder>(`/orders/${id}`, { headers: authHeader(token) }),

  create: (token: string, payload: CreateOrderPayload) =>
    request<IOrder>('/orders', {
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify(payload),
    }),

  update: (token: string, id: string, payload: UpdateOrderPayload) =>
    request<IOrder>(`/orders/${id}`, {
      method: 'PUT',
      headers: authHeader(token),
      body: JSON.stringify(payload),
    }),

  updateStatus: (token: string, id: string, status: OrderStatus) =>
    request<IOrder>(`/orders/${id}/status`, {
      method: 'PUT',
      headers: authHeader(token),
      body: JSON.stringify({ status }),
    }),

  pay: (token: string, id: string, amountPaid: number) =>
    request<{ message: string; order: IOrder; change: number }>(`/orders/${id}/pay`, {
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify({ amountPaid }),
    }),

  delete: (token: string, id: string) =>
    request<{ message: string }>(`/orders/${id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    }),
};
