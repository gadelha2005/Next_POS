// src/components/admin/AdminLayout.jsx
import { Link, useLocation} from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";

export default function AdminLayout({ children, user, onLogout }) {
  const location = useLocation();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleLogout = () => {
    onLogout();
    setShowConfirmLogout(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0b1834] text-gray-200 flex flex-col min-h-screen fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 p-6 border-b border-gray-700">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">NextPOS</h2>
            <p className="text-xs text-gray-400">Administrador</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <p className="text-sm font-medium">Olá, {user?.nome}</p>
          <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            to="/admin/dashboard"
            icon={<Home size={18} />}
            label="Dashboard"
            active={location.pathname === "/admin/dashboard"}
          />
          <SidebarItem
            to="/admin/vendas"
            icon={<ShoppingCart size={18} />}
            label="Vendas"
            active={location.pathname === "/admin/vendas"}
          />
          <SidebarItem
            to="/admin/produtos"
            icon={<Package size={18} />}
            label="Produtos"
            active={location.pathname === "/admin/produtos"}
          />
          <SidebarItem
            to="/admin/clientes"
            icon={<Users size={18} />}
            label="Clientes"
            active={location.pathname === "/admin/clientes"}
          />
          <SidebarItem
            to="/admin/relatorios"
            icon={<BarChart2 size={18} />}
            label="Relatórios"
            active={location.pathname === "/admin/relatorios"}
          />
          <SidebarItem
            to="/admin/configuracoes"
            icon={<Settings size={18} />}
            label="Configurações"
            active={location.pathname === "/admin/configuracoes"}
          />
        </nav>

        {/* Logout Button */}
        <button 
          onClick={() => setShowConfirmLogout(true)}
          className="flex items-center gap-2 text-red-500 p-4 border-t border-gray-700 hover:bg-gray-800 transition"
        >
          <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {children}
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Confirmar Saída</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja sair do sistema?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${
        active ? "bg-blue-600 text-white" : "hover:bg-gray-800"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}