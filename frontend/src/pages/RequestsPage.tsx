import React, { useEffect, useState } from 'react';
import { requestApi, productApi } from '../api';
import { FileText, Plus, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const valBadge = (s: string) => {
  const map: any = { pending: 'badge-pending', approved: 'badge-confirmed', rejected: 'badge-cancelled' };
  const labels: any = { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté' };
  return <span className={map[s] || 'badge-pending'}>{labels[s] || s}</span>;
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product_id: '', fichier_label: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([requestApi.list(), productApi.list({ per_page: 100 })]);
      setRequests(rRes.data.data || []);
      setProducts(pRes.data.data?.data || pRes.data.data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestApi.create(form);
      toast.success('Demande envoyée');
      setShowModal(false);
      setForm({ product_id: '', fichier_label: '', notes: '' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText size={24} className="text-blue-600" />
          Demandes de Label
        </h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nouvelle demande
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg text-gray-500">Aucune demande</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Créer ma première demande</button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Produit</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Fichier Label</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Notes</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Statut</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{req.product?.nom || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{req.fichier_label || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{req.notes || '-'}</td>
                    <td className="px-4 py-3 text-center">{valBadge(req.statut_validation)}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-400">
                      {new Date(req.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Nouvelle demande de label</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
                <select value={form.product_id} onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))} className="input-field" required>
                  <option value="">Sélectionner un produit...</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fichier / Lien Label</label>
                <input value={form.fichier_label} onChange={e => setForm(p => ({ ...p, fichier_label: e.target.value }))} className="input-field" placeholder="URL ou référence du fichier..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="input-field" rows={3} placeholder="Instructions spéciales..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {submitting && <Loader size={16} className="animate-spin" />}
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
