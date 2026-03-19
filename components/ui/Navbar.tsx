'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X, Search, Baby } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCartItemCount } from '@/lib/cart';
import { CartDrawer } from './CartDrawer';

export function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartItemCount());
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Baby className="h-8 w-8 text-pink-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
                Baby Store
              </span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  aria-label="Buscar productos"
                />
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-pink-500 transition-colors">
                Inicio
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-pink-500 transition-colors">
                Productos
              </Link>
              <Link
                href="/admin/login"
                className="text-gray-700 hover:text-pink-500 transition-colors"
              >
                Admin
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingCart className="h-6 w-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
                  aria-label="Buscar productos"
                />
              </div>
              <Link
                href="/"
                className="block py-2 text-gray-700 hover:text-pink-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/products"
                className="block py-2 text-gray-700 hover:text-pink-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Productos
              </Link>
              <Link
                href="/admin/login"
                className="block py-2 text-gray-700 hover:text-pink-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 py-2 text-gray-700"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Carrito ({cartCount})</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
