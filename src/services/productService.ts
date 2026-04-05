const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface IProduct {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category?: any;
  description?: string;
  status: 'available' | 'unavailable';
}

export const productService = {
  getAll: async (): Promise<IProduct[]> => {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi tải sản phẩm');
    return data;
  }
};
