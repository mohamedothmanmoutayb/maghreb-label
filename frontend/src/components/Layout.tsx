import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Wallet, ShoppingCart, Package, Truck, User,
  LogOut, Menu, X, ChevronDown, Bell, Settings, Users,
  BarChart2, FileText, Printer, Home
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  // MediaBuyer
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['mediabuyer'] },
  { label: 'Produits', path: '/products', icon: <Package size={18} />, roles: ['mediabuyer'] },
  { label: 'Commandes', path: '/leads', icon: <ShoppingCart size={18} />, roles: ['mediabuyer'] },
  { label: 'Wallet', path: '/wallet', icon: <Wallet size={18} />, roles: ['mediabuyer'] },
  { label: 'Last Mile', path: '/last-mile', icon: <Truck size={18} />, roles: ['mediabuyer'] },
  { label: 'Demandes Label', path: '/requests', icon: <FileText size={18} />, roles: ['mediabuyer'] },
  // Admin
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} />, roles: ['admin'] },
  { label: 'Mediabuyers', path: '/admin/users', icon: <Users size={18} />, roles: ['admin'] },
  { label: 'Wallets', path: '/admin/wallets', icon: <Wallet size={18} />, roles: ['admin'] },
  { label: 'Produits', path: '/admin/products', icon: <Package size={18} />, roles: ['admin'] },
  { label: 'Commandes', path: '/admin/leads', icon: <ShoppingCart size={18} />, roles: ['admin'] },
  { label: 'Demandes Label', path: '/admin/requests', icon: <FileText size={18} />, roles: ['admin'] },
  { label: 'Last Mile', path: '/admin/last-miles', icon: <Truck size={18} />, roles: ['admin'] },
  // Printer
  { label: 'Dashboard', path: '/printer', icon: <LayoutDashboard size={18} />, roles: ['printer'] },
  { label: 'File d\'impression', path: '/printer/queue', icon: <Printer size={18} />, roles: ['printer'] },
  // Common
  { label: 'Profil', path: '/profile', icon: <User size={18} /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role || '')
  );

  const roleLabel = { admin: 'Administrateur', mediabuyer: 'Media Buyer', printer: 'Imprimeur' }[user?.role || ''] || user?.role;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">MaghrebLabel</div>
              <div className="text-gray-400 text-xs">{roleLabel}</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'active' : ''}`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.nom?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.nom}</div>
              <div className="text-gray-400 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.nom}</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {user?.nom?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
