'use client';

import { useEffect, useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { getCart, getCartTotal, clearCart, generateWhatsAppMessage, saveOrderToDatabase } from '@/lib/cart';
import { CartItem } from '@/lib/types';
import { LOCALE } from '@/lib/constants';
import { CartItemComponent } from './CartItem';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      updateCart();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleCartUpdate = () => {
      updateCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const updateCart = () => {
    setCart(getCart());
  };

  const handleSendWhatsApp = async () => {
    if (!phone) {
      alert('Por favor ingresa un número de teléfono');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = await saveOrderToDatabase(phone);
      const url = generateWhatsAppMessage(phone, orderNumber);
      clearCart();
      onClose();
      toast.success(`Pedido #${orderNumber} guardado. Redirigiendo a WhatsApp.`);
      window.open(url, '_blank');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar el pedido. Intenta de nuevo.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = getCartTotal();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-pink-500" />
              <h2 className="text-xl font-bold text-gray-800">
                Carrito ({cart.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tu carrito está vacío</p>
              </div>
            ) : (
              cart.map((item) => (
                <CartItemComponent
                  key={`${item.product.id}-${item.variant.id}`}
                  item={item}
                  onUpdate={updateCart}
                />
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-pink-500">${total.toLocaleString(LOCALE)}</span>
              </div>

              <input
                type="tel"
                placeholder="Ej. +54 9 11 1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              />

              <button
                onClick={handleSendWhatsApp}
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                {isSubmitting ? 'Guardando pedido...' : 'Enviar pedido por WhatsApp'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
