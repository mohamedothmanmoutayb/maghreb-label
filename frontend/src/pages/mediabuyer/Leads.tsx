import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leadApi } from '../../api';
import { ShoppingCart, Search, Filter, Eye, Package, Clock, CheckCircle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const statusBadge = (s: string) => {
  const map: any = {
    pending: 'badge-pending', confirmed: 'badge-confirmed',
    cancelled: 'badge-cancelled', shipped: 'badge-active',
  };
  const labels: any = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', shipped: 'Expédié' };
  return <span className={map[s] || 'badge-pending'}>{labels[s] || s}</span>;
};

const prodStatusBadge = (s: string) => {
  const map: any = {
    pending: 'bg-gray-100 text-gray-600',
    in_production: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  };
  const labels: any = { pending: 'En attente', in_production: 'En prod.', completed: 'Terminé', cancelled: 'Annulé' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-600'}`}>{labels[s] || s}</span>;
};

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await leadApi.list({ search, statut: statut || undefined, page });
      const data = res.data.data;
      setLeads(data?.data || data || []);
      setPagination(data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, statut]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart size={24} className="text-blue-600" />
          Mes Commandes
        </h1>
        <Link to="/leads/new" className="btn-primary flex items-center gap-2">
          <ShoppingCart size={16} />
          Nouvelle commande
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par N° commande..."
            className="input-field pl-9"
          />
        </div>
        <select value={statut} onChange={e => setStatut(e.target.value)} className="input-field sm:w-44">
          <option value="">Tous statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmé</option>
          <option value="shipped">Expédié</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart size={48} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg mb-3">Aucune commande trouvée</p>
            <Link to="/leads/new" className="btn-primary inline-block">Créer une commande</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">N° Commande</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Client</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Produits</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Statut</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Production</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-blue-600">{lead.n_lead}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <div>{lead.client?.name || '-'}</div>
                      <div className="text-xs text-gray-400">{lead.client?.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {lead.lead_products?.slice(0, 2).map((lp: any) => (
                          <span key={lp.id} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                            {lp.product?.nom?.split(' ').slice(0, 2).join(' ')} x{lp.quantity}
                          </span>
                        ))}
                        {lead.lead_products?.length > 2 && (
                          <span className="text-xs text-gray-400">+{lead.lead_products.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{lead.total} DH</td>
                    <td className="px-4 py-3 text-center">{statusBadge(lead.statut_confirmation)}</td>
                    <td className="px-4 py-3 text-center">
                      {lead.production_status && prodStatusBadge(lead.production_status.statut)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/leads/${lead.id}`} className="text-blue-600 hover:text-blue-700">
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              {pagination.from}–{pagination.to} sur {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => load(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="btn-secondary text-sm px-3 py-1 disabled:opacity-50"
              >
                ←
              </button>
              <button
                onClick={() => load(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="btn-secondary text-sm px-3 py-1 disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
