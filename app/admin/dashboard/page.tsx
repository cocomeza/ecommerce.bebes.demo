'use client';

import { useEffect, useState } from 'react';
import { DashboardStats } from '@/components/DashboardStats';
import { getProducts, getOrders, getSuppliers, getAllVariants, getStoreSettings } from '@/lib/api';
import { LOCALE } from '@/lib/constants';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';
import { AdminShell } from '@/components/admin/AdminShell';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    lowStockProducts: 0,
    totalSuppliers: 0,
  });
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getOrders>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProducts(), getOrders(), getSuppliers(), getAllVariants(), getStoreSettings()])
      .then(([products, ordersList, suppliers, variants, settings]) => {
        if (cancelled) return;
        const lowStockCount = variants.filter((v) => v.stock < settings.low_stock_threshold).length;
        setStats({
          totalProducts: products.length,
          totalOrders: ordersList.length,
          lowStockProducts: lowStockCount,
          totalSuppliers: suppliers.length,
        });
        setOrders(ordersList);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminAuthGuard>
      <AdminShell>
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inicio</h1>
              <p className="text-gray-600 mt-2">Resumen general de tu tienda</p>
            </div>

            <DashboardStats stats={stats} />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Pedidos Recientes</h2>
              </div>

              {loading ? (
                <div className="p-6 text-gray-500">Cargando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nº Pedido
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.slice(0, 10).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            #{order.order_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {order.customer_phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                            ${Number(order.total_price).toLocaleString(LOCALE)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {order.status === 'pending'
                                ? 'Pendiente'
                                : order.status === 'confirmed'
                                  ? 'Confirmado'
                                  : 'Entregado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {new Date(order.created_at).toLocaleDateString(LOCALE)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && orders.length === 0 && (
                <div className="p-6 text-gray-500">No hay pedidos aún.</div>
              )}
            </div>
          </div>
        </main>
      </AdminShell>
    </AdminAuthGuard>
  );
}
