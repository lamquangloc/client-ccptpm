import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AdminCreateProductPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleToggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
      selectedCategories.forEach((id) => formData.append('categories', id));
      if (image) formData.append('image', image);

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Create failed');
      navigate('/admin/products');
    } catch (error) {
      console.error('Lỗi tạo sản phẩm:', error);
      alert('Tạo sản phẩm thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Thêm sản phẩm</h1>
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
          <label className="mb-2 block text-sm font-semibold text-slate-700">Ảnh sản phẩm</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
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
            {submitting ? 'Đang tạo...' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
}

