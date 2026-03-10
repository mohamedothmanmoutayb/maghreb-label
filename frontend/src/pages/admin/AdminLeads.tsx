import React, { useEffect, useState } from 'react';
import { leadApi } from '../../api';
import { ShoppingCart, Search, Eye, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const statusBadge = (s: string) => {
  const map: any = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', shipped: 'badge-active' };
  const labels: any = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', shipped: 'Expédié' };
  return <span className={map[s] || 'badge-pending'}>{labels[s] || s}</span>;
};

const workflowBadge = (s: string) => {
  const map: any = {
    pending: 'bg-gray-100 text-gray-600',
    in_production: 'bg-orange-100 text-orange-700',
    in_printing: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  };
  const labels: any = { pending: 'En attente', in_production: 'Production', in_printing: 'Impression', completed: '✓ Terminé', cancelled: 'Annulé' };
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-600'}`}>{labels[s] || s}</span>;
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await leadApi.adminList({ search, statut: statut || undefined });
      setLeads(res.data.data?.data || res.data.data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, statut]);

  const openDetail = async (id: number) => {
    try {
      const res = await leadApi.adminShow(id);
      setSelectedLead(res.data.data);
    } catch {
      toast.error('Erreur');
    }
  };

  const updateStatus = async (id: number, type: string, status: string) => {
    setUpdating(true);
    try {
      if (type === 'lead') await leadApi.updateStatus(id, { statut: status });
      else if (type === 'production') await leadApi.updateProduction(id, status);
      else if (type === 'print') await leadApi.updatePrint(id, status);
      else if (type === 'shipping') await leadApi.updateShipping(id, { statut: status });
      toast.success('Statut mis à jour');
      if (selectedLead?.id === id) {
        const res = await leadApi.adminShow(id);
        setSelectedLead(res.data.data);
      }
      load();
    } catch {
      toast.error('Erreur de mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <ShoppingCart size={24} className="text-blue-600" />
        Gestion des Commandes
      </h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="N° commande, client..." className="input-field pl-9" />
        </div>
        <select value={statut} onChange={e => setStatut(e.target.value)} className="input-field sm:w-44">
          <option value="">Tous statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmé</option>
          <option value="shipped">Expédié</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">N° Cmd</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Mediabuyer</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Client</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Statut</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Production</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Impression</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-blue-600">{lead.n_lead}</td>
                    <td className="px-4 py-3 text-gray-700">{lead.user?.nom || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.client?.name || '-'}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{lead.total} DH</td>
                    <td className="px-4 py-3 text-center">{statusBadge(lead.statut_confirmation)}</td>
                    <td className="px-4 py-3 text-center">
                      {lead.production_status && workflowBadge(lead.production_status.statut)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {lead.print_status && workflowBadge(lead.print_status.statut)}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openDetail(lead.id)} className="text-blue-600 hover:text-blue-700">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && <div className="text-center py-12 text-gray-400">Aucune commande</div>}
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedLead.n_lead}</h2>
                <p className="text-sm text-gray-500">{new Date(selectedLead.created_at).toLocaleString('fr-FR')}</p>
              </div>
              <button onClick={() => setSelectedLead(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Mediabuyer</p>
                  <p className="font-medium text-gray-800">{selectedLead.user?.nom}</p>
                  <p className="text-xs text-gray-400">{selectedLead.user?.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Client</p>
                  <p className="font-medium text-gray-800">{selectedLead.client?.name}</p>
                  <p className="text-xs text-gray-400">{selectedLead.client?.phone} {selectedLead.client?.city && `• ${selectedLead.client.city}`}</p>
                </div>
              </div>

              {/* Products */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Produits</p>
                <div className="space-y-2">
                  {selectedLead.lead_products?.map((lp: any) => (
                    <div key={lp.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{lp.product?.nom}</span>
                      <span className="text-sm font-medium">{lp.quantity}x {lp.price} DH = {lp.quantity * lp.price} DH</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-2 text-sm font-bold text-gray-800">Total: {selectedLead.total} DH</div>
              </div>

              {/* Workflow Status Updates */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Gestion du workflow</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Statut commande</p>
                    <div className="flex flex-wrap gap-1">
                      {['pending','confirmed','cancelled','shipped'].map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selectedLead.id, 'lead', s)}
                          disabled={updating || selectedLead.statut_confirmation === s}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            selectedLead.statut_confirmation === s
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Production ({selectedLead.production_status?.statut})</p>
                    <div className="flex flex-wrap gap-1">
                      {['pending','in_production','completed','cancelled'].map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selectedLead.id, 'production', s)}
                          disabled={updating || selectedLead.production_status?.statut === s}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            selectedLead.production_status?.statut === s
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Impression ({selectedLead.print_status?.statut})</p>
                    <div className="flex flex-wrap gap-1">
                      {['pending','in_printing','completed','cancelled'].map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selectedLead.id, 'print', s)}
                          disabled={updating || selectedLead.print_status?.statut === s}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            selectedLead.print_status?.statut === s
                              ? 'bg-yellow-500 text-white border-yellow-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-yellow-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Expédition ({selectedLead.shipping_status?.statut})</p>
                    <div className="flex flex-wrap gap-1">
                      {['pending','in_transit','delivered','returned'].map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selectedLead.id, 'shipping', s)}
                          disabled={updating || selectedLead.shipping_status?.statut === s}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            selectedLead.shipping_status?.statut === s
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* History */}
              {selectedLead.lead_history?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Historique</p>
                  <div className="space-y-2">
                    {selectedLead.lead_history.map((h: any) => (
                      <div key={h.id} className="flex items-start gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-700">{h.status}</span>
                          <span className="text-gray-400 ml-2">{h.user?.nom}</span>
                          <span className="text-gray-400 ml-2">{new Date(h.created_at).toLocaleString('fr-FR')}</span>
                          {h.note && <p className="text-gray-500 mt-0.5">{h.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
