import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leadApi } from '../../api';
import { LayoutDashboard, ShoppingCart, Wallet, TrendingUp, Package, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const statusBadge = (s: string) => {
  const map: any = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    cancelled: 'badge-cancelled',
    shipped: 'badge-active',
  };
  const labels: any = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', shipped: 'Expédié' };
  return <span className={map[s] || 'badge-pending'}>{labels[s] || s}</span>;
};

export default function MBDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadApi.dashboard()
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
    { label: 'Solde Wallet', value: `${stats?.solde?.toFixed(2) || '0.00'} DH`, icon: <Wallet size={20} />, color: 'bg-blue-500', change: 'Disponible' },
    { label: 'Total Commandes', value: stats?.total_leads || 0, icon: <ShoppingCart size={20} />, color: 'bg-purple-500', change: 'Toutes' },
    { label: 'En Attente', value: stats?.pending_leads || 0, icon: <Clock size={20} />, color: 'bg-yellow-500', change: 'En cours' },
    { label: 'Confirmées', value: stats?.confirmed_leads || 0, icon: <CheckCircle size={20} />, color: 'bg-green-500', change: '' },
    { label: 'Revenus', value: `${stats?.revenue?.toFixed(2) || '0.00'} DH`, icon: <TrendingUp size={20} />, color: 'bg-indigo-500', change: 'Total' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <LayoutDashboard size={24} className="text-blue-600" />
          Dashboard
        </h1>
        <Link to="/leads/new" className="btn-primary flex items-center gap-2">
          <ShoppingCart size={16} />
          Nouvelle commande
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.change}</p>
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
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Leads */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Commandes récentes</h3>
          <Link to="/leads" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        {stats?.recent_leads?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ShoppingCart size={40} className="mx-auto mb-2 opacity-40" />
            <p>Aucune commande pour l'instant</p>
            <Link to="/leads/new" className="btn-primary mt-3 inline-block text-sm">Créer ma première commande</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">N° Commande</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Client</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Total</th>
                  <th className="text-center py-2 text-gray-500 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_leads?.map((lead: any) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2">
                      <Link to={`/leads/${lead.id}`} className="text-blue-600 font-medium hover:underline">
                        {lead.n_lead}
                      </Link>
                    </td>
                    <td className="py-2 text-gray-600">{lead.client?.name || '-'}</td>
                    <td className="py-2 text-right font-medium">{lead.total} DH</td>
                    <td className="py-2 text-center">{statusBadge(lead.statut_confirmation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
