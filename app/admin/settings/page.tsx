'use client';

import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';
import { getStoreSettings, upsertStoreSettings } from '@/lib/api';
import { LOCALE } from '@/lib/constants';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getStoreSettings()
      .then((s) => {
        if (cancelled) return;
        setWhatsappNumber(s.whatsapp_number);
        setLowStockThreshold(s.low_stock_threshold);
      })
      .catch(() => {
        // fallback local
        if (cancelled) return;
        setWhatsappNumber('');
        setLowStockThreshold(5);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertStoreSettings({
        whatsapp_number: whatsappNumber.trim(),
        low_stock_threshold: lowStockThreshold,
      });
      toast.success('Configuración guardada.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la configuración';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600 mt-2 mb-8">
              Configurá parámetros como el número de WhatsApp y el umbral para “stock bajo”.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              {loading ? (
                <div className="text-gray-500">Cargando configuración...</div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      WhatsApp del negocio
                    </label>
                    <input
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Umbral de stock bajo (en unidades)
                    </label>
                    <input
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <p className="text-xs text-gray-500">
                      Usamos este valor para marcar productos/variantes con stock bajo.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-colors"
                    >
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
