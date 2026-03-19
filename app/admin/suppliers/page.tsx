'use client';

import { useEffect, useState } from 'react';
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from '@/lib/api';
import type { Supplier } from '@/lib/types';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';
import { toast } from 'sonner';
import { AdminShell } from '@/components/admin/AdminShell';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  type SupplierFormState = {
    id?: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
  };

  const emptySupplierForm: SupplierFormState = {
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  };

  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierFormState>(emptySupplierForm);

  const reload = async () => {
    const s = await getSuppliers();
    setSuppliers(s);
  };

  useEffect(() => {
    setLoading(true);
    reload()
      .catch(() => setSuppliers([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedSupplier = selectedSupplierId
    ? suppliers.find((s) => s.id === selectedSupplierId) ?? null
    : null;

  const startCreate = () => {
    setMode('create');
    setSelectedSupplierId(null);
    setForm(emptySupplierForm);
  };

  const startEdit = (supplier: Supplier) => {
    setMode('edit');
    setSelectedSupplierId(supplier.id);
    setForm({
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      notes: supplier.notes,
    });
  };

  const handleSave = async () => {
    try {
      if (mode === 'create') {
        await createSupplier({
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          notes: form.notes,
        });
        toast.success('Proveedor creado.');
      } else {
        if (!form.id) throw new Error('Falta id del proveedor');
        await updateSupplier(form.id, {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          notes: form.notes,
        });
        toast.success('Proveedor actualizado.');
      }
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el proveedor';
      toast.error(message);
    }
  };

  const handleDeleteById = async (supplierId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este proveedor?')) return;
    try {
      await deleteSupplier(supplierId);
      toast.success('Proveedor eliminado.');
      startCreate();
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el proveedor';
      toast.error(message);
    }
  };

  return (
    <AdminAuthGuard>
      <AdminShell>
        <main className="flex-1 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
              <p className="text-gray-600 mt-2">Gestiona tus proveedores</p>
            </div>
            <button
              type="button"
                onClick={startCreate}
                className="flex items-center space-x-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Agregar Proveedor</span>
            </button>
          </div>

            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-gray-500">Cargando...</div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                  <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-gray-100">
                    {suppliers.length === 0 ? (
                      <div className="p-8 text-gray-500">No hay proveedores. Creá uno nuevo.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Proveedor
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {suppliers.map((supplier) => {
                              const isSelected = selectedSupplierId === supplier.id && mode === 'edit';
                              return (
                                <tr
                                  key={supplier.id}
                                  className={`hover:bg-gray-50 ${isSelected ? 'bg-pink-50' : ''}`}
                                >
                                  <td
                                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                    onClick={() => startEdit(supplier)}
                                  >
                                    <div className="font-medium text-gray-900 truncate max-w-[220px]">
                                      {supplier.name}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate max-w-[220px]">
                                      {supplier.email}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => startEdit(supplier)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteById(supplier.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar"
                                      >
                                        <Trash2 className="h-4 w-4" />
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
                  </div>

                  <div className="lg:col-span-3 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        {mode === 'create' ? 'Crear proveedor' : 'Editar proveedor'}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Nombre</label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Teléfono</label>
                        <input
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Dirección</label>
                        <input
                          value={form.address}
                          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Notas</label>
                        <textarea
                          value={form.notes}
                          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[92px]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="flex items-center justify-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md transition-colors"
                      >
                        {mode === 'create' ? 'Guardar proveedor' : 'Actualizar proveedor'}
                      </button>

                      {mode === 'edit' && selectedSupplier && (
                        <button
                          type="button"
                          onClick={() => handleDeleteById(selectedSupplier.id)}
                          className="flex items-center justify-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors"
                        >
                          Eliminar proveedor
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
        </main>
      </AdminShell>
    </AdminAuthGuard>
  );
}
