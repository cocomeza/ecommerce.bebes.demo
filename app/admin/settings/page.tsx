'use client';

import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminSettings() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-2 mb-8">
            Aquí podrás configurar nombre de tienda, número de WhatsApp, umbral de stock bajo, etc.
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-500">
            Próximamente.
          </div>
        </div>
      </main>
    </div>
  );
}
