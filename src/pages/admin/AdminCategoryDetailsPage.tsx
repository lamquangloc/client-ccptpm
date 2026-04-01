import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
  image?: string;
  productCount?: number;
  products?: Array<{ _id: string }>;
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

export default function AdminCategoryDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`${API_URL}/categories/${id}`);
        const data = (await response.json()) as Category;
        setCategory(data);
      } catch (error) {
        console.error('Lỗi tải chi tiết danh mục:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  if (loading) return <div className="text-sm text-slate-600">Đang tải...</div>;
  if (!category) return <div className="text-sm text-slate-600">Không tìm thấy danh mục</div>;

  const src = resolveCategoryImageUrl(category.image);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Chi tiết danh mục</h1>
        <button onClick={() => navigate('/admin/categories')} className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Quay lại
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div>
            {category.image ? (
              <img src={src} alt={category.name} className="h-52 w-full rounded-lg object-cover" />
            ) : (
              <div className="flex h-52 w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">Không có ảnh</div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tên danh mục</p>
              <p className="mt-1 text-lg font-bold text-slate-800">{category.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Số lượng sản phẩm</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{category.productCount ?? category.products?.length ?? 0}</p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate(`/admin/categories/edit/${category._id}`)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Sửa danh mục
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

