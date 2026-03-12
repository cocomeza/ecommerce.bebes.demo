'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { href: '/admin/products', icon: Package, label: 'Productos' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Pedidos' },
    { href: '/admin/suppliers', icon: Users, label: 'Proveedores' },
    { href: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
          Panel de administración
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2" aria-label="Menú del panel de administración">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-pink-50 text-pink-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button type="button" className="flex items-center space-x-3 px-4 py-3 w-full text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
          <LogOut className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
