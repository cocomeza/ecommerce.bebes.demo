import { Package, ShoppingBag, TriangleAlert as AlertTriangle, Users } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

function StatCard({ title, value, icon, bgColor, textColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${bgColor}`}>
          <div className={textColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

interface DashboardStatsProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    lowStockProducts: number;
    totalSuppliers: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Productos"
        value={stats.totalProducts}
        icon={<Package className="h-6 w-6" />}
        bgColor="bg-blue-100"
        textColor="text-blue-600"
      />
      <StatCard
        title="Pedidos"
        value={stats.totalOrders}
        icon={<ShoppingBag className="h-6 w-6" />}
        bgColor="bg-green-100"
        textColor="text-green-600"
      />
      <StatCard
        title="Stock Bajo"
        value={stats.lowStockProducts}
        icon={<AlertTriangle className="h-6 w-6" />}
        bgColor="bg-red-100"
        textColor="text-red-600"
      />
      <StatCard
        title="Proveedores"
        value={stats.totalSuppliers}
        icon={<Users className="h-6 w-6" />}
        bgColor="bg-purple-100"
        textColor="text-purple-600"
      />
    </div>
  );
}
