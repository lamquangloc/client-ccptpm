const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt?: string;
}

export interface GetUsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
  }

  return data as T;
}

export const userService = {
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    let query = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.role) searchParams.append('role', params.role);
      const queryString = searchParams.toString();
      if (queryString) {
        query = `?${queryString}`;
      }
    }
    return request<GetUsersResponse>(`/users${query}`);
  },

  getUserById: (id: string) => request<User>(`/users/${id}`),

  createUser: (payload: any) => request<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  updateUser: (id: string, payload: any) => request<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  deleteUser: (id: string) => request<{ message: string }>(`/users/${id}`, {
    method: 'DELETE'
  }),
};
