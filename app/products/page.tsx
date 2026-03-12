'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductFilters, type FilterState } from '@/components/ui/ProductFilters';
import { getProducts } from '@/lib/api';
import type { Product } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    minPrice: 0,
    maxPrice: 100000,
    search: '',
  });

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filters.category !== 'all' && p.category !== filters.category) return false;
      if (p.retail_price < filters.minPrice || p.retail_price > filters.maxPrice) return false;
      if (
        filters.search &&
        !p.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !p.description?.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [products, filters]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <ProductFilters onFilterChange={setFilters} />
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
              <Link
                href="/"
                className="text-pink-500 hover:text-pink-600 font-medium flex items-center gap-1"
              >
                Inicio <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 animate-pulse h-80"
                  />
                ))}
              </div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
