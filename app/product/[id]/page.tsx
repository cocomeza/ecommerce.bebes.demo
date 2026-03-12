'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { ProductGallery } from '@/components/ui/ProductGallery';
import { getProductById, getProductVariants } from '@/lib/api';
import { addToCart } from '@/lib/cart';
import type { Product, ProductVariant } from '@/lib/types';
import { LOCALE } from '@/lib/constants';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([getProductById(id), getProductVariants(id)])
      .then(([p, v]) => {
        if (cancelled) return;
        setProduct(p ?? null);
        setVariants(v ?? []);
        if (v?.length) setSelectedVariant(v[0]);
      })
      .catch(() => {
        if (!cancelled) setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const maxQty = selectedVariant ? Math.max(1, selectedVariant.stock) : 1;
  const effectiveQty = Math.min(quantity, maxQty);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addToCart({ product, variant: selectedVariant, quantity: effectiveQty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse bg-white rounded-2xl h-96" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Producto no encontrado.</p>
          <Link href="/products" className="text-pink-500 hover:underline mt-2 inline-block">
            Ver todos los productos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/products"
          className="inline-flex items-center text-gray-600 hover:text-pink-500 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a productos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <p className="text-sm text-gray-500 mb-4">Categoría: {product.category}</p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-2xl font-bold text-gray-900">
                ${product.retail_price.toLocaleString(LOCALE)}
              </span>
              <span className="text-gray-500">Por mayor: ${product.wholesale_price.toLocaleString(LOCALE)}</span>
            </div>

            {variants.length > 0 && (
              <div className="space-y-3 mb-6">
                <p className="font-medium text-gray-800">Variante</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock <= 0}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        selectedVariant?.id === v.id
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : v.stock <= 0
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 hover:border-pink-300 text-gray-700'
                      }`}
                    >
                      {v.size} / {v.color}
                      {v.stock <= 0 ? ' (sin stock)' : ` (${v.stock})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                >
                  −
                </button>
                <span className="px-4 py-2 border-x border-gray-300 font-medium">{effectiveQty}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock < 1}
                className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {added ? 'Añadido al carrito' : 'Añadir al carrito'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
