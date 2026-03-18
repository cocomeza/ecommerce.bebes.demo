'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AdminSidebar } from '@/components/AdminSidebar';
import {
  createProduct,
  createProductVariant,
  deleteProduct,
  deleteProductVariant,
  getAllVariants,
  getProducts,
  getStoreSettings,
  updateProduct,
  updateProductVariant,
} from '@/lib/api';
import type { Product, ProductVariant } from '@/lib/types';
import { LOCALE } from '@/lib/constants';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  type ProductFormState = {
    id?: string;
    name: string;
    description: string;
    category: string;
    retail_price: number;
    wholesale_price: number;
    imagesText: string; // lista separada por comas
  };

  type VariantFormState = {
    id?: string;
    size: string;
    color: string;
    stock: number;
  };

  const emptyProductForm: ProductFormState = {
    name: '',
    description: '',
    category: '',
    retail_price: 0,
    wholesale_price: 0,
    imagesText: '',
  };

  const emptyVariantForm: VariantFormState = {
    size: '',
    color: '',
    stock: 0,
  };

  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  const [newVariantForm, setNewVariantForm] = useState<VariantFormState>(emptyVariantForm);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingVariantForm, setEditingVariantForm] = useState<VariantFormState>(emptyVariantForm);

  const reload = async () => {
    const [p, v] = await Promise.all([getProducts(), getAllVariants()]);
    setProducts(p);
    setVariants(v);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([reload(), getStoreSettings()])
      .then(([, settings]) => {
        setLowStockThreshold(settings.low_stock_threshold);
      })
      .catch(() => {
        setProducts([]);
        setVariants([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getProductStock = (productId: string) => {
    return variants.filter((v) => v.product_id === productId).reduce((sum, v) => sum + v.stock, 0);
  };

  const isLowStock = (productId: string) => getProductStock(productId) < lowStockThreshold;

  const selectedProduct =
    selectedProductId ? products.find((p) => p.id === selectedProductId) ?? null : null;

  const selectedVariants = selectedProductId
    ? variants.filter((v) => v.product_id === selectedProductId)
    : [];

  const handleStartCreate = () => {
    setMode('create');
    setSelectedProductId(null);
    setProductForm(emptyProductForm);
    setNewVariantForm(emptyVariantForm);
    setEditingVariantId(null);
    setEditingVariantForm(emptyVariantForm);
  };

  const handleStartEdit = (product: Product) => {
    setMode('edit');
    setSelectedProductId(product.id);
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      retail_price: Number(product.retail_price) || 0,
      wholesale_price: Number(product.wholesale_price) || 0,
      imagesText: (product.images || []).join(', '),
    });
    setEditingVariantId(null);
    setEditingVariantForm(emptyVariantForm);
  };

  const handleSaveProduct = async () => {
    const images = productForm.imagesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (mode === 'create') {
        const created = await createProduct({
          name: productForm.name,
          description: productForm.description,
          category: productForm.category,
          retail_price: productForm.retail_price,
          wholesale_price: productForm.wholesale_price,
          images,
        });
        toast.success('Producto creado.');
        setMode('edit');
        setSelectedProductId(created.id);
        setProductForm((prev) => ({ ...prev, id: created.id }));
      } else {
        if (!productForm.id) throw new Error('Falta id del producto');
        await updateProduct(productForm.id, {
          name: productForm.name,
          description: productForm.description,
          category: productForm.category,
          retail_price: productForm.retail_price,
          wholesale_price: productForm.wholesale_price,
          images,
        });
        toast.success('Producto actualizado.');
      }

      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el producto';
      toast.error(message);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProductId) return;
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await deleteProduct(selectedProductId);
      toast.success('Producto eliminado.');
      handleStartCreate();
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el producto';
      toast.error(message);
    }
  };

  const handleDeleteProductById = async (productId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await deleteProduct(productId);
      toast.success('Producto eliminado.');
      handleStartCreate();
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el producto';
      toast.error(message);
    }
  };

  const handleAddVariant = async () => {
    if (!selectedProductId) return;
    try {
      await createProductVariant({
        product_id: selectedProductId,
        size: newVariantForm.size,
        color: newVariantForm.color,
        stock: newVariantForm.stock,
      });
      toast.success('Variante agregada.');
      setNewVariantForm(emptyVariantForm);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar la variante';
      toast.error(message);
    }
  };

  const handleStartEditVariant = (variant: ProductVariant) => {
    setEditingVariantId(variant.id);
    setEditingVariantForm({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    });
  };

  const handleCancelEditVariant = () => {
    setEditingVariantId(null);
    setEditingVariantForm(emptyVariantForm);
  };

  const handleSaveVariant = async () => {
    if (!editingVariantId) return;
    try {
      await updateProductVariant(editingVariantId, {
        size: editingVariantForm.size,
        color: editingVariantForm.color,
        stock: editingVariantForm.stock,
      });
      toast.success('Variante actualizada.');
      handleCancelEditVariant();
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la variante';
      toast.error(message);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta variante?')) return;
    try {
      await deleteProductVariant(variantId);
      toast.success('Variante eliminada.');
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la variante';
      toast.error(message);
    }
  };

  return (
    <AdminAuthGuard>
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
                onClick={handleStartCreate}
                className="flex items-center space-x-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Nuevo producto</span>
              </button>
          </div>

            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-gray-500">Cargando...</div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                  {/* Lista */}
                  <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-gray-100">
                    {products.length === 0 ? (
                      <div className="p-8 text-gray-500">
                        No hay productos todavía. Creá el primero.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
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
                              const isSelected = selectedProductId === product.id && mode === 'edit';

                              return (
                                <tr
                                  key={product.id}
                                  className={`hover:bg-gray-50 ${isSelected ? 'bg-pink-50' : ''}`}
                                >
                                  <td
                                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                    onClick={() => handleStartEdit(product)}
                                  >
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
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={lowStock ? 'text-red-600 font-semibold' : 'font-semibold'}>
                                      {stock}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEdit(product)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteProductById(product.id)}
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

                  {/* Editor */}
                  <div className="lg:col-span-3 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        {mode === 'create' ? 'Crear producto' : 'Editar producto'}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Nombre</label>
                        <input
                          value={productForm.name}
                          onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Categoría</label>
                        <input
                          value={productForm.category}
                          onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Descripción</label>
                        <textarea
                          value={productForm.description}
                          onChange={(e) =>
                            setProductForm((p) => ({ ...p, description: e.target.value }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[96px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Precio al público
                        </label>
                        <input
                          type="number"
                          value={productForm.retail_price}
                          onChange={(e) =>
                            setProductForm((p) => ({ ...p, retail_price: Number(e.target.value) }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Precio por mayor
                        </label>
                        <input
                          type="number"
                          value={productForm.wholesale_price}
                          onChange={(e) =>
                            setProductForm((p) => ({ ...p, wholesale_price: Number(e.target.value) }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                          Imágenes (URLs separadas por coma)
                        </label>
                        <input
                          value={productForm.imagesText}
                          onChange={(e) =>
                            setProductForm((p) => ({ ...p, imagesText: e.target.value }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                          placeholder="https://... , https://..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        type="button"
                        onClick={handleSaveProduct}
                        className="flex items-center justify-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md transition-colors"
                      >
                        {mode === 'create' ? 'Guardar producto' : 'Actualizar producto'}
                      </button>

                      {mode === 'edit' && (
                        <button
                          type="button"
                          onClick={handleDeleteProduct}
                          className="flex items-center justify-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors"
                        >
                          Eliminar producto
                        </button>
                      )}
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Variantes (talla / color)</h3>

                      {selectedProductId ? (
                        <>
                          {/* Agregar variante */}
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Talla</label>
                                <input
                                  value={newVariantForm.size}
                                  onChange={(e) =>
                                    setNewVariantForm((v) => ({ ...v, size: e.target.value }))
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Color</label>
                                <input
                                  value={newVariantForm.color}
                                  onChange={(e) =>
                                    setNewVariantForm((v) => ({ ...v, color: e.target.value }))
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Stock</label>
                                <input
                                  type="number"
                                  value={newVariantForm.stock}
                                  onChange={(e) =>
                                    setNewVariantForm((v) => ({ ...v, stock: Number(e.target.value) }))
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                />
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={handleAddVariant}
                                  className="w-full flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-colors"
                                >
                                  <Plus className="h-5 w-5 mr-2" />
                                  Agregar
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Lista de variantes */}
                          {selectedVariants.length === 0 ? (
                            <div className="text-gray-500">Este producto aún no tiene variantes.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Talla
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Color
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Stock
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Acciones
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {selectedVariants.map((variant) => (
                                    <tr key={variant.id} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 whitespace-nowrap">{variant.size}</td>
                                      <td className="px-3 py-2 whitespace-nowrap">{variant.color}</td>
                                      <td className="px-3 py-2 whitespace-nowrap font-semibold">
                                        {variant.stock}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                          {editingVariantId === variant.id ? (
                                            <>
                                              <button
                                                type="button"
                                                onClick={handleSaveVariant}
                                                className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold rounded-lg"
                                              >
                                                Guardar
                                              </button>
                                              <button
                                                type="button"
                                                onClick={handleCancelEditVariant}
                                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg"
                                              >
                                                Cancelar
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <button
                                                type="button"
                                                onClick={() => handleStartEditVariant(variant)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar variante"
                                              >
                                                <Pencil className="h-4 w-4" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteVariant(variant.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar variante"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Editor de variante */}
                          {editingVariantId && (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mt-4">
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Editar variante
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-700">Talla</label>
                                  <input
                                    value={editingVariantForm.size}
                                    onChange={(e) =>
                                      setEditingVariantForm((v) => ({ ...v, size: e.target.value }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-700">Color</label>
                                  <input
                                    value={editingVariantForm.color}
                                    onChange={(e) =>
                                      setEditingVariantForm((v) => ({ ...v, color: e.target.value }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-700">Stock</label>
                                  <input
                                    type="number"
                                    value={editingVariantForm.stock}
                                    onChange={(e) =>
                                      setEditingVariantForm((v) => ({
                                        ...v,
                                        stock: Number(e.target.value),
                                      }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={handleSaveVariant}
                                    className="w-full flex items-center justify-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md transition-colors"
                                  >
                                    Guardar cambios
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-500">
                          Guardá primero el producto para poder agregar variantes.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
