'use client';

import { useState } from 'react';

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  search: string;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    minPrice: 0,
    maxPrice: 100000,
    search: '',
  });

  const categories: { value: string; label: string }[] = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'Bodysuits', label: 'Bodies' },
    { value: 'Sleepwear', label: 'Pijamas' },
    { value: 'Dresses', label: 'Vestidos' },
    { value: 'T-Shirts', label: 'Remeras' },
    { value: 'Sweaters', label: 'Buzos' },
    { value: 'Pants', label: 'Pantalones' },
    { value: 'Rompers', label: 'Enterizos' },
    { value: 'Hoodies', label: 'Buzos con capucha' },
  ];

  const updateFilter = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-800">Filtros</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            aria-label="Categoría"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rango de precio
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
              className="w-full accent-pink-500"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>$0</span>
              <span>${filters.maxPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const resetFilters: FilterState = {
              category: 'all',
              minPrice: 0,
              maxPrice: 100000,
              search: '',
            };
            setFilters(resetFilters);
            onFilterChange(resetFilters);
          }}
          className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
