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

      <section className="relative bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
              Ropa de Calidad para tu
              <span className="block bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                Bebé y Niños
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra colección de ropa cómoda y adorable. Ventas al por menor y mayor con los mejores precios.
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

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Calidad Premium</h3>
              <p className="text-gray-600">Productos de la más alta calidad para tu bebé</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Ventas por Mayor</h3>
              <p className="text-gray-600">Precios especiales para compras al por mayor</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Truck className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Envío Rápido</h3>
              <p className="text-gray-600">Entrega rápida a todo el país</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Productos Destacados</h2>
            <p className="text-gray-600">Los favoritos de nuestros clientes</p>
          </div>

          <ProductGrid products={featuredProducts} />

          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white font-semibold rounded-full transition-all"
            >
              Ver Todos los Productos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-pink-500 to-purple-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para hacer tu pedido?</h2>
          <p className="text-lg mb-8 text-pink-100">
            Contacta con nosotros por WhatsApp y realiza tu pedido hoy
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-4 bg-white text-pink-500 hover:bg-gray-100 font-semibold rounded-full shadow-lg transition-all"
          >
            Empezar a Comprar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
