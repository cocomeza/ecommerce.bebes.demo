'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types';
import { LOCALE } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER_IMAGE = 'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg';

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || PLACEHOLDER_IMAGE;
  return (
    <Link href={`/product/${product.id}`}>
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-800 group-hover:text-pink-500 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <p className="text-lg font-bold text-gray-900">
                ${product.retail_price.toLocaleString(LOCALE)}
              </p>
              <p className="text-xs text-gray-500">
                Por mayor: ${product.wholesale_price.toLocaleString(LOCALE)}
              </p>
            </div>

            <button className="p-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full transition-colors shadow-md hover:shadow-lg" aria-label="Ver producto">
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
