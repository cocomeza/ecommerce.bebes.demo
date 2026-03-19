'use client';

import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';

export function AdminShell({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-gray-900">Panel admin</span>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl">
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200">
              <span className="font-bold text-gray-900">Menú</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Cerrar menú"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <AdminSidebar
              className="w-full border-r-0 min-h-0 h-[calc(100vh-56px)]"
              onNavigate={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}

