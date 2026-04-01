import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
  image?: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', '');

const resolveCategoryImageUrl = (image?: string) => {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return image;

  const normalized = image.replace(/\\/g, '/');
  if (normalized.startsWith('/uploads/categories/')) return `${API_BASE}${normalized}`;
  if (normalized.startsWith('uploads/categories/')) return `${API_BASE}/${normalized}`;

  if (normalized.startsWith('/uploads/') || normalized.startsWith('uploads/')) {
    const filename = normalized.split('/').pop();
    return filename ? `${API_BASE}/uploads/categories/${filename}` : '';
  }

  if (normalized.startsWith('/')) return `${API_BASE}${normalized}`;
  return `${API_BASE}/uploads/categories/${normalized}`;
};

export default function AdminEditCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`${API_URL}/categories/${id}`);
        const data = (await response.json()) as Category;
        setName(data.name || '');
        setCurrentImage(data.image || '');
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

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

      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Update failed');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Lỗi cập nhật danh mục:', error);
      alert('Cập nhật danh mục thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-sm text-slate-600">Đang tải...</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Sửa danh mục</h1>
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
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Cập nhật ảnh</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          {currentImage && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Ảnh hiện tại</p>
              <img
                src={resolveCategoryImageUrl(currentImage)}
                alt="Ảnh danh mục hiện tại"
                className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/categories')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
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

