import React, { useEffect, useState } from 'react';
import { leadApi } from '../../api';
import { Printer, Play, CheckCircle, Clock, Package, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const printBadge = (s: string) => {
  const map: any = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_printing: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
  };
  const labels: any = { pending: 'En attente', in_printing: 'En impression', completed: 'Terminé' };
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-600'}`}>{labels[s] || s}</span>;
};

export default function PrinterDashboard() {
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

  const updatePrint = async (leadId: number, statut: string) => {
    setUpdating(leadId);
    try {
      await leadApi.printerUpdatePrint(leadId, statut);
      toast.success(statut === 'in_printing' ? 'Impression démarrée' : 'Impression terminée');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setUpdating(null);
    }
  };

  const pending = leads.filter(l => l.print_status?.statut === 'pending');
  const inPrinting = leads.filter(l => l.print_status?.statut === 'in_printing');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Printer size={24} className="text-blue-600" />
          Dashboard Imprimeur
        </h1>
        <button onClick={load} className="text-gray-500 hover:text-gray-700">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full mb-2">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{pending.length}</p>
          <p className="text-sm text-gray-500 mt-1">En attente</p>
        </div>
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mb-2">
            <Printer size={20} className="text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{inPrinting.length}</p>
          <p className="text-sm text-gray-500 mt-1">En impression</p>
        </div>
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
            <Package size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{leads.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total file</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : leads.length === 0 ? (
        <div className="card text-center py-16">
          <Printer size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg text-gray-500">File d'impression vide</p>
          <p className="text-sm text-gray-400 mt-1">Toutes les commandes ont été traitées</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* In Printing section */}
          {inPrinting.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Printer size={14} />
                En cours d'impression ({inPrinting.length})
              </h2>
              <div className="space-y-3">
                {inPrinting.map(lead => (
                  <PrintCard
                    key={lead.id}
                    lead={lead}
                    updating={updating}
                    onUpdate={updatePrint}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending section */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-yellow-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock size={14} />
                En attente ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(lead => (
                  <PrintCard
                    key={lead.id}
                    lead={lead}
                    updating={updating}
                    onUpdate={updatePrint}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PrintCard({ lead, updating, onUpdate }: { lead: any; updating: number | null; onUpdate: (id: number, s: string) => void }) {
  const isInPrinting = lead.print_status?.statut === 'in_printing';
  const isUpdating = updating === lead.id;

  return (
    <div className={`card border-l-4 ${isInPrinting ? 'border-l-orange-400' : 'border-l-yellow-400'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-blue-600">{lead.n_lead}</span>
            {printBadge(lead.print_status?.statut)}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <span className="text-xs text-gray-400">Mediabuyer</span>
              <p className="font-medium">{lead.user?.nom}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Client</span>
              <p className="font-medium">{lead.client?.name}</p>
              <p className="text-xs text-gray-400">{lead.client?.phone}</p>
            </div>
          </div>

          {/* Products */}
          <div className="mt-3">
            <span className="text-xs text-gray-400">Produits</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {lead.lead_products?.map((lp: any) => (
                <span key={lp.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {lp.product?.nom} × {lp.quantity}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-400">
            Créé le {new Date(lead.created_at).toLocaleString('fr-FR')}
          </div>
        </div>

        <div className="ml-4 flex flex-col gap-2">
          {!isInPrinting ? (
            <button
              onClick={() => onUpdate(lead.id, 'in_printing')}
              disabled={isUpdating}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Play size={14} />
              )}
              Démarrer
            </button>
          ) : (
            <button
              onClick={() => onUpdate(lead.id, 'completed')}
              disabled={isUpdating}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <CheckCircle size={14} />
              )}
              Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
