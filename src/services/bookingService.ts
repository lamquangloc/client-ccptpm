const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface BookingTable {
  _id: string;
  number: number;
  status: string;
}

export interface Booking {
  _id: string;
  userId?: string;
  name: string;
  phone: string;
  date: string;   // YYYY-MM-DD từ server
  time: string;   // HH:mm
  guests: number;
  table?: BookingTable | string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  createdAt?: string;
  updatedAt?: string;
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
  createBooking: (payload: any) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAllBookings: () => request<Booking[]>('/bookings'),

  getMyBookings: () => request<Booking[]>('/bookings/my-bookings'),

  getBookingById: (id: string) => request<Booking>(`/bookings/${id}`),

  updateBooking: (id: string, payload: Partial<Booking>) =>
    request<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  cancelBooking: (id: string) =>
    request<{ message: string; booking: Booking }>(`/bookings/${id}/cancel`, {
      method: 'POST',
    }),
};
