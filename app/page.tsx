import Link from 'next/link';
import { ArrowRight, Package, ShoppingBag, Truck } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ProductGrid } from '@/components/ProductGrid';
import { getProducts } from '@/lib/api';

export default async function Home() {
  let featuredProducts: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    const all = await getProducts();
    featuredProducts = all.slice(0, 4);
  } catch {
    featuredProducts = [];
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="relative bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900">
              Ropa de Calidad para tu
              <span className="block bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                Bebé y Niños
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Ropa cómoda y adorable. Venta minorista y mayorista con precios especiales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Ver Productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Calidad premium</p>
                <p className="text-sm text-gray-600">Pensado para pieles sensibles</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Precios por mayor</p>
                <p className="text-sm text-gray-600">Especial para revendedores</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Envíos rápidos</p>
                <p className="text-sm text-gray-600">Coordinación por WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Productos destacados</h2>
              <p className="text-gray-600">Elegidos por nuestros clientes</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center px-5 py-2.5 border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white font-semibold rounded-full transition-all"
            >
              Ver todo <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <ProductGrid products={featuredProducts} />

          <div className="text-center mt-8 sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white font-semibold rounded-full transition-all"
            >
              Ver todos los productos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
