import React, { useEffect, useState } from 'react';
import { requestApi } from '../../api';
import { FileText, Check, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const valBadge = (s: string) => {
  const map: any = { pending: 'badge-pending', approved: 'badge-confirmed', rejected: 'badge-cancelled' };
  const labels: any = { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté' };
  return <span className={map[s] || 'badge-pending'}>{labels[s] || s}</span>;
};

export default function AdminRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await requestApi.adminList();
      setRequests(res.data.data?.data || res.data.data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const validate = async (id: number, statut: string) => {
    try {
      await requestApi.adminValidate(id, { statut });
      toast.success(statut === 'approved' ? 'Label approuvé' : 'Label rejeté');
      load();
    } catch {
      toast.error('Erreur');
    }
  };

  const filtered = requests.filter(r =>
    !search || r.user?.nom?.toLowerCase().includes(search.toLowerCase()) || r.product?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <FileText size={24} className="text-blue-600" />
        Demandes de Label
      </h1>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-9" />
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Mediabuyer</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Produit</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Fichier</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Notes</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Statut</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((req: any) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{req.user?.nom}</p>
                      <p className="text-xs text-gray-400">{req.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{req.product?.nom || '-'}</td>
                    <td className="px-4 py-3 text-xs text-blue-600 max-w-xs truncate">{req.fichier_label || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{req.notes || '-'}</td>
                    <td className="px-4 py-3 text-center">{valBadge(req.statut_validation)}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-400">
                      {new Date(req.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      {req.statut_validation === 'pending' && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => validate(req.id, 'approved')}
                            className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-medium"
                          >
                            <Check size={12} />
                            Approuver
                          </button>
                          <button
                            onClick={() => validate(req.id, 'rejected')}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium"
                          >
                            <X size={12} />
                            Rejeter
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Aucune demande</div>}
          </div>
        )}
      </div>
    </div>
  );
}
