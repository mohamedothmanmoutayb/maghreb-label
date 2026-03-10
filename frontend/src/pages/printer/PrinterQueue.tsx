import React, { useEffect, useState } from 'react';
import { leadApi } from '../../api';
import { Printer, Play, CheckCircle, RefreshCw, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const printBadge = (s: string) => {
  const map: any = { pending: 'bg-yellow-100 text-yellow-700', in_printing: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700' };
  const labels: any = { pending: 'En attente', in_printing: 'En impression', completed: 'Terminé' };
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-600'}`}>{labels[s] || s}</span>;
};

export default function PrinterQueue() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await leadApi.printerQueue();
      setLeads(res.data.data?.data || res.data.data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updatePrint = async (leadId: number, status: string) => {
    setUpdating(leadId);
    try {
      await leadApi.printerUpdatePrint(leadId, status);
      toast.success(`Statut mis à jour: ${status}`);
      load();
    } catch {
      toast.error('Erreur');
    } finally {
      setUpdating(null);
    }
  };

  const pending = leads.filter(l => l.print_status?.statut === 'pending');
  const printing = leads.filter(l => l.print_status?.statut === 'in_printing');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Printer size={24} className="text-blue-600" />
          File d'impression
        </h1>
        <button onClick={load} className="text-gray-500 hover:text-gray-700">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-yellow-500">{pending.length}</p>
          <p className="text-sm text-gray-500 mt-1">En attente</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{printing.length}</p>
          <p className="text-sm text-gray-500 mt-1">En impression</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-400">{leads.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total file</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Printer size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg">File d'impression vide</p>
          <p className="text-sm mt-1">Aucune commande à imprimer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead: any) => (
            <div key={lead.id} className="card flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-600">{lead.n_lead}</span>
                  {printBadge(lead.print_status?.statut)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Client: {lead.client?.name} ({lead.client?.phone})</span>
                  <span>MB: {lead.user?.nom}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {lead.lead_products?.map((lp: any) => (
                    <span key={lp.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <Package size={10} />
                      {lp.product?.nom} x{lp.quantity}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-bold text-gray-800">{lead.total} DH</span>
                {lead.print_status?.statut === 'pending' && (
                  <button
                    onClick={() => updatePrint(lead.id, 'in_printing')}
                    disabled={updating === lead.id}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    <Play size={14} />
                    Démarrer
                  </button>
                )}
                {lead.print_status?.statut === 'in_printing' && (
                  <button
                    onClick={() => updatePrint(lead.id, 'completed')}
                    disabled={updating === lead.id}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    <CheckCircle size={14} />
                    Terminé
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
