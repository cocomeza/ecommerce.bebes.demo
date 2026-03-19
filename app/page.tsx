import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Package, ShoppingBag, Truck } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ProductGrid } from '@/components/ProductGrid';
import { getProducts } from '@/lib/api';

const HERO_IMAGE = '/hero-bebe.jpg';

export default async function Home() {
  let featuredProducts: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    // Preferimos productos marcados como destacados; si no hay, mostramos los últimos.
    const featured = await getProducts({ featuredOnly: true });
    if (featured.length > 0) {
      featuredProducts = featured.slice(0, 4);
    } else {
      const all = await getProducts();
      featuredProducts = all.slice(0, 4);
    }
  } catch {
    featuredProducts = [];
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="relative bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                Ropa de Calidad
                <span className="block">
                  para <span className="text-pink-500">Bebés</span> y{' '}
                  <span className="text-blue-500">Niños</span>
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto lg:mx-0">
                Descubre nuestra colección de ropa cómoda y adorable.
                <br className="hidden sm:block" />
                Ventas al por menor y mayor con los mejores precios.
              </p>

              <div className="flex justify-center lg:justify-start">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-7 py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Ver Productos <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-white/30 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2.5rem] bg-white/50 border border-white/60 shadow-xl">
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10]">
                    <Image
                      src={HERO_IMAGE}
                      alt="Bebé"
                      fill
                      priority
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover object-[70%_50%]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-pink-600" />
              </div>
              <p className="mt-3 font-semibold text-gray-900">Calidad Premium</p>
              <p className="mt-1 text-sm text-gray-600">Productos de la más alta calidad para tu bebé</p>
            </div>

            <div className="text-center bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <p className="mt-3 font-semibold text-gray-900">Ventas por Mayor</p>
              <p className="mt-1 text-sm text-gray-600">Precios especiales para compras al por mayor</p>
            </div>

            <div className="text-center bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <p className="mt-3 font-semibold text-gray-900">Envío Rápido</p>
              <p className="mt-1 text-sm text-gray-600">Entrega rápida a todo el país</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Productos Destacados</h2>
            <p className="text-gray-600 mt-1">Los favoritos de nuestros clientes</p>
          </div>

          <ProductGrid products={featuredProducts} />

          <div className="text-center mt-10">
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-3 border-2 border-pink-300 text-pink-600 hover:bg-pink-500 hover:border-pink-500 hover:text-white font-semibold rounded-full transition-all bg-white/70"
            >
              Ver Todos los Productos <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h3 className="text-2xl sm:text-3xl font-extrabold">¿Listo para hacer tu pedido?</h3>
            <p className="mt-2 text-white/90">
              Contacta con nosotros por WhatsApp y realiza tu pedido hoy
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-pink-600 font-semibold shadow-lg hover:shadow-xl hover:bg-white/95 transition-all"
              >
                Empezar a Comprar <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
