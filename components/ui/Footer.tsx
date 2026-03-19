'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Instagram } from 'lucide-react';

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
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="text-lg font-bold text-gray-900">Baby Store</p>
            <p className="text-sm text-gray-600 mt-1">
              Ropa para bebés y niños. Ventas al por menor y por mayor.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={SOCIALS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors text-gray-700"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
              <span className="text-sm font-medium">Facebook</span>
            </a>
            <a
              href={SOCIALS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors text-gray-700"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
              <span className="text-sm font-medium">Instagram</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-2 md:gap-4 md:items-center md:justify-between">
          <p className="text-xs text-gray-500">
            © {year} Baby Store. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-500">
            Desarrollado por{' '}
            <Link
              href={DEVELOPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-pink-600 hover:text-pink-700 underline underline-offset-2"
            >
              Botón Creativo
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

