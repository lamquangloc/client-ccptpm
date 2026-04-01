import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface ProductCategory {
  _id?: string;
  name?: string;
}

interface Product {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  price: number;
  categories?: Array<ProductCategory | string>;
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

export default function AdminProductDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const data = (await response.json()) as Product;
        setProduct(data);
      } catch (error) {
        console.error('Lỗi tải chi tiết sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-sm text-slate-600">Đang tải...</div>;
  if (!product) return <div className="text-sm text-slate-600">Không tìm thấy sản phẩm</div>;

  const imageSrc = resolveProductImageUrl(product.image);

  const categoryText = (product.categories || [])
    .map((item) => (typeof item === 'string' ? item : item.name || '-'))
    .filter(Boolean)
    .join(', ');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Chi tiết sản phẩm</h1>
        <button onClick={() => navigate('/admin/products')} className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Quay lại
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div>
            {product.image ? (
              <img src={imageSrc} alt={product.name} className="h-52 w-full rounded-lg object-cover" />
            ) : (
              <div className="flex h-52 w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">Không có ảnh</div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tên sản phẩm</p>
              <p className="mt-1 text-lg font-bold text-slate-800">{product.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Giá</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{product.price.toLocaleString('vi-VN')} VND</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Danh mục</p>
              <p className="mt-1 text-sm text-slate-700">{categoryText || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mô tả</p>
              <p className="mt-1 text-sm text-slate-700">{product.description || '-'}</p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Sửa sản phẩm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

