'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

const PLACEHOLDER_IMAGE = 'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg';

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const list = images?.length ? images : [PLACEHOLDER_IMAGE];
  const current = list[Math.min(selectedImage, list.length - 1)];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
        <Image
          src={current}
          alt={name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {list.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {list.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index
                  ? 'border-pink-500 ring-2 ring-pink-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image src={image} alt={`${name} ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
