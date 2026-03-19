'use client';

import { useEffect, useState } from 'react';
import { getOrdersWithItems, updateOrderStatus } from '@/lib/api';
import type { Order, OrderItem } from '@/lib/types';
import { LOCALE } from '@/lib/constants';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    getOrdersWithItems()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o))
      );
      toast.success('Estado actualizado.');
    } catch {
      // Keep previous state
      toast.error('No se pudo actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminAuthGuard>
      <AdminShell>
        <main className="flex-1 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-600 mt-2">Gestiona los pedidos de tus clientes</p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detalles
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
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
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer disabled:opacity-50 ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="delivered">Entregado</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {new Date(order.created_at).toLocaleDateString(LOCALE)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label="Ver detalles del pedido"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && orders.length === 0 && (
              <div className="p-8 text-gray-500">No hay pedidos.</div>
            )}
          </div>
        </div>
        </main>

        {/* Modal: detalle del pedido */}
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Pedido #{selectedOrder.order_number}
                  </h2>
                  <p className="text-gray-600">Cliente: {selectedOrder.customer_phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-semibold"
                >
                  Cerrar
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-pink-600 font-bold">
                    ${Number(selectedOrder.total_price).toLocaleString(LOCALE)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600 font-medium">Estado</span>
                  <span className="text-gray-900 font-semibold">{selectedOrder.status}</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Ítems</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.items.map((it: OrderItem) => (
                      <div
                        key={it.id}
                        className="flex items-start justify-between gap-4 bg-white border border-gray-100 rounded-lg p-3"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {it.product?.name ?? it.product_id}
                          </div>
                          <div className="text-sm text-gray-600">
                            Talla: {it.variant?.size ?? '—'} / Color:{' '}
                            {it.variant?.color ?? '—'}
                          </div>
                          <div className="text-sm text-gray-600">
                            Cantidad: {it.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            ${(Number(it.price) * it.quantity).toLocaleString(LOCALE)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Precio unitario: ${Number(it.price).toLocaleString(LOCALE)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No hay ítems para este pedido.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </AdminAuthGuard>
  );
}
