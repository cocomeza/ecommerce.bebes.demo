'use client';

import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { getSuppliers } from '@/lib/api';
import type { Supplier } from '@/lib/types';
import { Plus } from 'lucide-react';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuppliers()
      .then(setSuppliers)
      .catch(() => setSuppliers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
              <p className="text-gray-600 mt-2">Gestiona tus proveedores</p>
            </div>
            <button
              type="button"
              className="flex items-center space-x-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Agregar Proveedor</span>
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
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dirección
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {supplier.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {supplier.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {supplier.email}
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                          {supplier.address}
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && suppliers.length === 0 && (
              <div className="p-8 text-gray-500">No hay proveedores.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
