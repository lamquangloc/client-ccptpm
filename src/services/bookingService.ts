const API_BASE = '/api';

export interface Booking {
  _id: string;
  restaurant: string;
  type: string;
  date: string;
  time: string;
  status: 'Sắp tới' | 'Hoàn thành' | 'Đã hủy' | string;
  guests: number;
  image?: string;
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

export const bookingService = {
  getMyBookings: () => request<Booking[]>('/bookings/my-bookings'),
  
  updateBooking: (id: string, payload: Partial<Booking>) => request<Booking>(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  cancelBooking: (id: string) => request<any>(`/bookings/${id}/cancel`, {
    method: 'POST'
  }),
};
