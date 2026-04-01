import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categories?: Array<{ _id: string; name?: string } | string>;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', '');

const resolveProductImageUrl = (image?: string) => {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return image;

  const normalized = image.replace(/\\/g, '/');
  if (normalized.startsWith('/uploads/products/')) return `${API_BASE}${normalized}`;
  if (normalized.startsWith('uploads/products/')) return `${API_BASE}/${normalized}`;

  if (normalized.startsWith('/uploads/') || normalized.startsWith('uploads/')) {
    const filename = normalized.split('/').pop();
    return filename ? `${API_BASE}/uploads/products/${filename}` : '';
  }

  if (normalized.startsWith('/')) return `${API_BASE}${normalized}`;
  return `${API_BASE}/uploads/products/${normalized}`;
};

export default function AdminEditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          fetch(`${API_URL}/products/${id}`),
          fetch(`${API_URL}/categories`),
        ]);
        const productData = (await productRes.json()) as Product;
        const categoryData = await categoryRes.json();

        setName(productData.name || '');
        setPrice(productData.price || 0);
        setDescription(productData.description || '');
        setCurrentImage(productData.image || '');
        const categoryIds = (productData.categories || []).map((item) =>
          typeof item === 'string' ? item : item._id
        );
        setSelectedCategories(categoryIds);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (error) {
        console.error('Lỗi tải dữ liệu sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((item) => item !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn cần đăng nhập với quyền admin');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', String(price));
      formData.append('description', description);
      selectedCategories.forEach((item) => formData.append('categories', item));
      if (image) formData.append('image', image);

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Update failed');
      navigate('/admin/products');
    } catch (error) {
      console.error('Lỗi cập nhật sản phẩm:', error);
      alert('Cập nhật sản phẩm thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-sm text-slate-600">Đang tải...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Sửa sản phẩm</h1>
        <button onClick={() => navigate('/admin/products')} className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Tên sản phẩm</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Giá</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Mô tả</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Cập nhật ảnh</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          {currentImage && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Ảnh hiện tại</p>
              <img
                src={resolveProductImageUrl(currentImage)}
                alt="Ảnh sản phẩm hiện tại"
                className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Danh mục</label>
          <div className="grid gap-2 md:grid-cols-2">
            {categories.map((category) => (
              <label key={category._id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => handleToggleCategory(category._id)}
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/products')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Hủy
          </button>
          <button disabled={submitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}

