import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

interface ProductCategory {
  _id?: string;
  name?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  categories?: Array<ProductCategory | string>;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', '');

const buildSvgPlaceholder = (width: number, height: number, text: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14" font-weight="700">${text}</text>
    </svg>`
  )}`;

const FALLBACK_CATEGORY_IMAGE = buildSvgPlaceholder(64, 64, 'DM');
const FALLBACK_PRODUCT_IMAGE = buildSvgPlaceholder(90, 90, 'SP');

const formatVND = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

const resolveProductImageUrl = (image?: string) => {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return image;

  const normalized = image.replace(/\\/g, '/');

  if (normalized.startsWith('/uploads/products/')) return `${API_BASE}${normalized}`;
  if (normalized.startsWith('uploads/products/')) return `${API_BASE}/${normalized}`;

  // Backward compatibility: old data may be saved as /uploads/<filename>
  if (normalized.startsWith('/uploads/') || normalized.startsWith('uploads/')) {
    const filename = normalized.split('/').pop();
    return filename ? `${API_BASE}/uploads/products/${filename}` : '';
  }

  if (normalized.startsWith('/')) return `${API_BASE}${normalized}`;
  return `${API_BASE}/uploads/products/${normalized}`;
};

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

const resolveCategoryIdFromProduct = (product: Product): string[] => {
  return (product.categories || [])
    .map((item) => (typeof item === 'string' ? item : item._id || ''))
    .filter(Boolean);
};

export default function MenuPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoryRes, productRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/products`),
        ]);

        const categoryData = await categoryRes.json();
        const productData = await productRes.json();

        const nextCategories = Array.isArray(categoryData) ? categoryData : [];
        setCategories(nextCategories);
        setProducts(Array.isArray(productData) ? productData : []);

        if (nextCategories.length > 0) {
          setSelectedCategoryId(nextCategories[0]._id);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const byCategory =
        selectedCategoryId === 'all' || resolveCategoryIdFromProduct(product).includes(selectedCategoryId);

      return byCategory;
    });
  }, [products, selectedCategoryId]);

  const activeCategory = categories.find((item) => item._id === selectedCategoryId);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <section className="rounded-2xl bg-transparent px-4 py-5 shadow-sm md:px-6">
        <div className="flex flex-wrap justify-center gap-4 pb-2">
          {categories.map((category) => {
            const isActive = selectedCategoryId === category._id;
            return (
              <button
                key={category._id}
                type="button"
                onClick={() => setSelectedCategoryId(category._id)}
                className="group relative min-w-[82px] shrink-0"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={resolveCategoryImageUrl(category.image) || FALLBACK_CATEGORY_IMAGE}
                    alt={category.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
                    }}
                    className="h-14 w-14 rounded-full bg-white object-cover"
                  />
                  <span
                    className={`mt-2 text-xs font-bold uppercase tracking-wide ${
                      isActive ? 'text-red-600' : 'text-slate-700 group-hover:text-red-600'
                    }`}
                  >
                    {category.name}
                  </span>
                </div>
                {isActive && <span className="mx-auto mt-1 block h-0.5 w-9 rounded-full bg-red-600" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-b-2 border-red-200 pb-4 text-center">
        <p className="text-2xl font-bold text-slate-800">Các {activeCategory?.name || 'món ăn'}</p>
        <div className="mt-1 flex items-center justify-center gap-3">
          <span className="h-0.5 w-8 bg-red-500" />
          <p className="text-3xl font-extrabold uppercase tracking-wide text-red-600">
            {activeCategory?.name || 'Menu'}
          </p>
          <span className="h-0.5 w-8 bg-red-500" />
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {activeCategory?.description || 'Món ăn tươi ngon, đậm đà hương vị truyền thống.'}
        </p>
      </section>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-transparent p-6 text-center text-slate-500">
          Đang tải menu...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-transparent p-6 text-center text-slate-500">
          Không có món ăn phù hợp.
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {filteredProducts.map((product) => (
            <article
              key={product._id}
              className="rounded-xl bg-transparent p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex gap-3">
                <img
                  src={resolveProductImageUrl(product.image) || FALLBACK_PRODUCT_IMAGE}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                  }}
                  className="h-[92px] w-[92px] rounded-lg bg-slate-100 object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-base font-bold text-slate-800">{product.name}</h3>
                    <p className="shrink-0 text-sm font-bold text-red-600">{formatVND(product.price)}</p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/product/${product._id}`)}
                className="mt-3 w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Xem món ăn
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
