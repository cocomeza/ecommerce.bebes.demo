'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AdminSidebar } from '@/components/AdminSidebar';
import { getProducts, getAllVariants } from '@/lib/api';
import type { Product } from '@/lib/types';
import { LOW_STOCK_THRESHOLD, LOCALE } from '@/lib/constants';
import { Plus, AlertTriangle } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Awaited<ReturnType<typeof getAllVariants>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getAllVariants()])
      .then(([p, v]) => {
        setProducts(p);
        setVariants(v);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const getProductStock = (productId: string) => {
    return variants.filter((v) => v.product_id === productId).reduce((sum, v) => sum + v.stock, 0);
  };

  const isLowStock = (productId: string) => getProductStock(productId) < LOW_STOCK_THRESHOLD;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
              <p className="text-gray-600 mt-2">Gestiona tu catálogo de productos</p>
            </div>
            <button
              type="button"
              className="flex items-center space-x-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Agregar Producto</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-gray-500">Cargando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio al público
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio por mayor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => {
                      const stock = getProductStock(product.id);
                      const lowStock = isLowStock(product.id);
                      const imageUrl = product.images?.[0];

                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {imageUrl ? (
                                  <Image
                                    src={imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="text-gray-400 text-xs flex items-center justify-center h-full w-full">
                                    —
                                  </span>
                                )}
                              </div>
                              <div className="font-medium text-gray-900 min-w-0 truncate max-w-[200px]">
                                {product.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                            ${Number(product.retail_price).toLocaleString(LOCALE)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-pink-500">
                            ${Number(product.wholesale_price).toLocaleString(LOCALE)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`font-semibold ${
                                  lowStock ? 'text-red-600' : 'text-gray-900'
                                }`}
                              >
                                {stock}
                              </span>
                              {lowStock && (
                                <span className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Bajo
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && products.length === 0 && (
              <div className="p-8 text-gray-500">No hay productos. Agrega el primero desde Supabase o implementa el formulario de alta.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
