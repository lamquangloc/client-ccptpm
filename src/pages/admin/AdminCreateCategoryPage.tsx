import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AdminCreateCategoryPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      if (image) formData.append('image', image);

      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Create failed');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Lỗi tạo danh mục:', error);
      alert('Tạo danh mục thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Thêm danh mục</h1>
        <button onClick={() => navigate('/admin/categories')} className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Tên danh mục</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            placeholder="Nhập tên danh mục"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Ảnh danh mục</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/categories')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
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

