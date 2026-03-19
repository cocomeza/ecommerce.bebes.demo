'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Baby, Facebook, Instagram, Heart, ShieldCheck, Truck } from 'lucide-react';

const DEVELOPER_URL = 'https://botoncreativo.onrender.com/';

// Si querés cambiar las redes, editá estas URLs.
const SOCIALS = {
  facebook: 'https://facebook.com/boton.creativo.ar',
  instagram: 'https://instagram.com/boton.creativo.ar',
} as const;

export function Footer() {
  const pathname = usePathname();

  // No mostramos el footer en el panel admin.
  if (pathname.startsWith('/admin')) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gradient-to-b from-white to-pink-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100">
                <Baby className="h-6 w-6 text-pink-500" />
              </span>
              <div>
                <p className="text-lg font-extrabold text-gray-900 leading-tight">Baby Store</p>
                <p className="text-xs text-gray-500">Ropa para bebés y niños</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 max-w-md">
              Ventas al por menor y por mayor. Coordinamos tu pedido por WhatsApp y te acompañamos en todo el proceso.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/70 border border-white/60 shadow-sm px-4 py-3 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Calidad</p>
                  <p className="text-xs text-gray-500">Materiales premium</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/70 border border-white/60 shadow-sm px-4 py-3 flex items-center gap-3">
                <Truck className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Envíos</p>
                  <p className="text-xs text-gray-500">Rápidos y seguros</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/70 border border-white/60 shadow-sm px-4 py-3 flex items-center gap-3">
                <Heart className="h-5 w-5 text-pink-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Atención</p>
                  <p className="text-xs text-gray-500">Cálida y cercana</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-900">Navegación</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-pink-600 transition-colors">
                Inicio
              </Link>
              <Link href="/products" className="text-gray-600 hover:text-pink-600 transition-colors">
                Productos
              </Link>
              <Link href="/admin/login" className="text-gray-600 hover:text-pink-600 transition-colors">
                Admin
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-900">Seguinos</p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={SOCIALS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors text-gray-700 shadow-sm"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
                <span className="text-sm font-semibold">Facebook</span>
              </a>
              <a
                href={SOCIALS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors text-gray-700 shadow-sm"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
                <span className="text-sm font-semibold">Instagram</span>
              </a>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500">
                ¿Querés tu propia tienda online?
                <br />
                <Link
                  href={DEVELOPER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-pink-600 hover:text-pink-700 underline underline-offset-2"
                >
                  Desarrollado por Botón Creativo
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/60">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center md:justify-between">
            <p className="text-xs text-gray-500">© {year} Baby Store. Todos los derechos reservados.</p>
            <p className="text-xs text-gray-500">
              Hecho con cariño para una experiencia simple y rápida.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

