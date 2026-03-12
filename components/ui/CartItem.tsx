'use client';

import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '@/lib/types';
import { updateCartItemQuantity, removeFromCart } from '@/lib/cart';
import { LOCALE } from '@/lib/constants';

interface CartItemProps {
  item: CartItem;
  onUpdate: () => void;
}

export function CartItemComponent({ item, onUpdate }: CartItemProps) {
  const handleQuantityChange = (newQuantity: number) => {
    updateCartItemQuantity(item.product.id, item.variant.id, newQuantity);
    onUpdate();
  };

  const handleRemove = () => {
    removeFromCart(item.product.id, item.variant.id);
    onUpdate();
  };

  const subtotal = item.product.retail_price * item.quantity;
  const imageUrl = item.product.images?.[0] || 'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg';

  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 space-y-2">
        <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
          {item.product.name}
        </h4>

        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">
            Talla: {item.variant.size}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded">
            Color: {item.variant.color}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="p-1 hover:bg-white rounded transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-2 font-semibold text-sm">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.variant.stock}
              className="p-1 hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Quitar del carrito"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="font-bold text-pink-500">${subtotal.toLocaleString(LOCALE)}</p>
      </div>
    </div>
  );
}
