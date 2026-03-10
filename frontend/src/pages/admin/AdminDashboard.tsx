import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leadApi } from '../../api';
import {
  LayoutDashboard, Users, ShoppingCart, Wallet, Printer, TrendingUp,
  AlertCircle, Clock, BarChart2, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const statusBadge = (s: string) => {
  const map: any = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled' };
  const labels: any = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' };
  return <span className={map[s] || 'badge-pending'}>{labels[s] || s}</span>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadApi.adminDashboard()
      .then(res => setStats(res.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  const kpis = [
    { label: 'Total Commandes', value: stats?.total_leads || 0, icon: <ShoppingCart size={20} />, color: 'bg-blue-500', sub: `${stats?.today_leads || 0} aujourd'hui` },
    { label: 'Revenus Total', value: `${(stats?.total_revenue || 0).toFixed(0)} DH`, icon: <TrendingUp size={20} />, color: 'bg-green-500', sub: 'Total cumulé' },
    { label: 'Mediabuyers', value: stats?.total_mediabuyers || 0, icon: <Users size={20} />, color: 'bg-purple-500', sub: 'Actifs' },
    { label: 'En Production', value: stats?.in_production || 0, icon: <Clock size={20} />, color: 'bg-orange-500', sub: 'En cours' },
    { label: 'À Imprimer', value: stats?.pending_prints || 0, icon: <Printer size={20} />, color: 'bg-red-500', sub: 'File attente' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <LayoutDashboard size={24} className="text-blue-600" />
        Dashboard Admin
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
              </div>
              <div className={`${kpi.color} p-2 rounded-lg text-white`}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {stats?.monthly_chart?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-4">Commandes / Mois</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthly_chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-4">Revenus / Mois (DH)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.monthly_chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top MediaBuyers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Top Mediabuyers</h3>
            <Link to="/admin/users" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          {stats?.top_mediabuyers?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun mediabuyer</p>
          ) : (
            <div className="space-y-3">
              {stats?.top_mediabuyers?.map((mb: any, i: number) => (
                <div key={mb.id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{mb.nom}</p>
                    <p className="text-xs text-gray-400">{mb.leads_count} commandes</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{(mb.leads_sum_total || 0).toFixed(0)} DH</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Commandes récentes</h3>
            <Link to="/admin/leads" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recent_leads?.slice(0, 5).map((lead: any) => (
              <div key={lead.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{lead.n_lead}</p>
                  <p className="text-xs text-gray-400">{lead.user?.nom} — {lead.client?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{lead.total} DH</p>
                  {statusBadge(lead.statut_confirmation)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Gérer Wallets', path: '/admin/wallets', icon: <Wallet size={20} />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Voir Commandes', path: '/admin/leads', icon: <ShoppingCart size={20} />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
          { label: 'Gérer Produits', path: '/admin/products', icon: <BarChart2 size={20} />, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Utilisateurs', path: '/admin/users', icon: <Users size={20} />, color: 'bg-orange-50 text-orange-700 border-orange-200' },
        ].map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className={`flex items-center gap-3 p-4 rounded-xl border ${action.color} hover:shadow-sm transition-shadow`}
          >
            {action.icon}
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
