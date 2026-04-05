const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface ITable {
  _id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTablePayload {
  number: number;
  capacity: number;
}

export interface UpdateTablePayload {
  number?: number;
  capacity?: number;
  status?: TableStatus;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,                          // spread first (method, body, etc.)
    headers: {
      'Content-Type': 'application/json', // always include
      ...(options.headers || {}),         // then merge Authorization on top
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
  }

  return data as T;
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const tableService = {
  /** Lấy tất cả bàn (public) */
  getAll: () => request<ITable[]>('/tables'),

  /** Lấy bàn theo ID (public) */
  getById: (id: string) => request<ITable>(`/tables/${id}`),

  /** Tạo bàn mới (admin) */
  create: (token: string, payload: CreateTablePayload) =>
    request<ITable>('/tables', {
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify(payload),
    }),

  /** Cập nhật bàn (admin) */
  update: (token: string, id: string, payload: UpdateTablePayload) =>
    request<ITable>(`/tables/${id}`, {
      method: 'PUT',
      headers: authHeader(token),
      body: JSON.stringify(payload),
    }),

  /** Xoá bàn (admin) */
  delete: (token: string, id: string) =>
    request<{ message: string }>(`/tables/${id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    }),
};
