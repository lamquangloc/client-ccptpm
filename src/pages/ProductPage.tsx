import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
const VISIBLE_SUGGESTIONS = 4;
const buildSvgPlaceholder = (width: number, height: number, text: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="26" font-weight="700">${text}</text>
    </svg>`
  )}`;

const FALLBACK_IMAGE = buildSvgPlaceholder(760, 760, 'PRODUCT');
const FALLBACK_CARD_IMAGE = buildSvgPlaceholder(200, 160, 'SP');

const formatVND = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

const resolveImageUrl = (image?: string) => {
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

const categoryText = (categories?: Array<ProductCategory | string>) => {
  const names = (categories || [])
    .map((item) => (typeof item === 'string' ? item : item.name || ''))
    .filter(Boolean);

  return names.join(', ');
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detailRes, listRes] = await Promise.all([
          fetch(`${API_URL}/products/${id}`),
          fetch(`${API_URL}/products`),
        ]);

        if (!detailRes.ok) {
          setProduct(null);
          return;
        }

        const detailData = await detailRes.json();
        const listData = await listRes.json();
        setProduct(detailData);
        setProducts(Array.isArray(listData) ? listData : []);
      } catch (error) {
        console.error('Lỗi tải chi tiết món ăn:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setCarouselIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const suggestions = useMemo(() => {
    if (!product) return [];

    const productCategoryIds = (product.categories || [])
      .map((item) => (typeof item === 'string' ? item : item._id || ''))
      .filter(Boolean);

    const sameCategory = products.filter((item) => {
      if (item._id === product._id) return false;
      const ids = (item.categories || [])
        .map((cat) => (typeof cat === 'string' ? cat : cat._id || ''))
        .filter(Boolean);
      return ids.some((catId) => productCategoryIds.includes(catId));
    });

    const others = products.filter(
      (item) => item._id !== product._id && !sameCategory.some((same) => same._id === item._id)
    );

    return [...sameCategory, ...others].slice(0, 12);
  }, [product, products]);

  const canSlidePrev = carouselIndex > 0;
  const canSlideNext = carouselIndex < Math.max(0, suggestions.length - VISIBLE_SUGGESTIONS);
  const visibleSuggestions = suggestions.slice(carouselIndex, carouselIndex + VISIBLE_SUGGESTIONS);

  if (loading) {
    return (
      <div className="rounded-xl bg-transparent p-6 text-center text-slate-500">
        Đang tải chi tiết món ăn...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-xl bg-transparent p-6 text-center text-slate-600">
        Không tìm thấy món ăn.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-10">
      <section className="rounded-2xl bg-transparent px-4 py-6 shadow-sm md:px-8">
        <h1 className="mb-6 text-center text-4xl font-extrabold text-slate-800">{product.name}</h1>

        <div className="flex flex-col gap-7 md:flex-row md:items-start">
          <img
            src={resolveImageUrl(product.image) || FALLBACK_IMAGE}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="h-[320px] w-full rounded-xl bg-slate-100 object-cover md:h-[380px] md:w-[380px]"
          />

          <div className="flex-1">
            <p className="text-4xl font-extrabold text-red-600">{formatVND(product.price)}</p>
            <p className="mt-4 text-[15px] leading-7 text-slate-700">{product.description}</p>
            <p className="mt-4 text-sm text-slate-500">Danh mục: {categoryText(product.categories) || 'Món chính'}</p>

            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="mt-6 rounded-md bg-red-600 px-9 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Đặt bàn
            </button>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Món Ngon Khác</h2>

        {visibleSuggestions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Chưa có món gợi ý.</p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleSuggestions.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => navigate(`/product/${item._id}`)}
                  className="rounded-2xl bg-transparent p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img
                    src={resolveImageUrl(item.image) || FALLBACK_CARD_IMAGE}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_CARD_IMAGE;
                    }}
                    className="aspect-square w-full rounded-lg bg-slate-100 object-cover"
                  />
                  <p className="mt-2 text-xs text-slate-500">{categoryText(item.categories) || 'Món ăn'}</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">{item.name}</p>
                  <p className="mt-1 text-lg font-bold text-red-600">{formatVND(item.price)}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setCarouselIndex((prev) => Math.max(0, prev - 1))}
                disabled={!canSlidePrev}
                className="h-10 w-10 rounded-full bg-slate-100 text-xl text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Trước"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setCarouselIndex((prev) => Math.min(suggestions.length - VISIBLE_SUGGESTIONS, prev + 1))}
                disabled={!canSlideNext}
                className="h-10 w-10 rounded-full bg-slate-100 text-xl text-red-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Sau"
              >
                ›
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
