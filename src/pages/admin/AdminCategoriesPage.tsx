import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
  image?: string;
  productCount?: number;
  products?: Array<{ _id: string }>;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', '');
const ITEMS_PER_PAGE = 10;

const resolveCategoryImageUrl = (image?: string) => {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return image;

  const normalized = image.replace(/\\/g, '/');

  if (normalized.startsWith('/uploads/categories/')) return `${API_BASE}${normalized}`;
  if (normalized.startsWith('uploads/categories/')) return `${API_BASE}/${normalized}`;

  // Backward compatibility: old data may be saved as /uploads/<filename>
  if (normalized.startsWith('/uploads/') || normalized.startsWith('uploads/')) {
    const filename = normalized.split('/').pop();
    return filename ? `${API_BASE}/uploads/categories/${filename}` : '';
  }

  if (normalized.startsWith('/')) return `${API_BASE}${normalized}`;
  return `${API_BASE}/uploads/categories/${normalized}`;
};

export default function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
      alert('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn cần đăng nhập với quyền admin');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Delete failed');
      setCategories((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error('Lỗi xóa danh mục:', error);
      alert('Xóa danh mục thất bại');
    }
  };

  const renderImage = (image?: string) => {
    const src = resolveCategoryImageUrl(image);
    if (!image) {
      return <div className="h-12 w-12 rounded-lg bg-slate-200" />;
    }
    if (!src) return <div className="h-12 w-12 rounded-lg bg-slate-200" />;
    return <img src={src} alt="category" className="h-12 w-12 rounded-lg object-cover" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Quản lý danh mục</h1>
        <button
          onClick={() => navigate('/admin/categories/create')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Thêm danh mục
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm danh mục theo tên..."
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 md:max-w-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Tên danh mục</th>
                <th className="px-6 py-4">Ảnh danh mục</th>
                <th className="px-6 py-4 text-center">Số lượng SP</th>
                <th className="px-6 py-4 text-center">Chức năng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    Không tìm thấy danh mục phù hợp
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-semibold text-slate-800">{category.name}</td>
                    <td className="px-6 py-4">{renderImage(category.image)}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-700">
                      {category.productCount ?? category.products?.length ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="Sửa"
                          onClick={() => navigate(`/admin/categories/edit/${category._id}`)}
                          className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.86 3.49a2.1 2.1 0 112.97 2.97L8.5 17.8 4 19l1.2-4.5L16.86 3.49z" />
                          </svg>
                        </button>
                        <button
                          title="Xóa"
                          onClick={() => handleDelete(category._id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12m-1 0-.9 12.2A2 2 0 0114.1 21H9.9a2 2 0 01-1.99-1.8L7 7m3 0V5a1 1 0 011-1h2a1 1 0 011 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredCategories.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm">
            <p className="text-slate-500">
              Hiển thị {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredCategories.length)} trên {filteredCategories.length} danh mục
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-md px-3 py-1.5 ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

