import React, { useEffect, useState } from 'react';
import { lastMileApi } from '../api';
import { Truck, Plus, Link2, X, Loader, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LastMilePage() {
  const [lastMiles, setLastMiles] = useState<any[]>([]);
  const [myIntegrations, setMyIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLM, setSelectedLM] = useState<any>(null);
  const [form, setForm] = useState({ last_mile_id: '', api_key: '', api_secret: '', auth_type: 'api_key' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [lmRes, intRes] = await Promise.all([lastMileApi.list(), lastMileApi.myIntegrations()]);
      setLastMiles(lmRes.data.data || []);
      setMyIntegrations(intRes.data.data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const isIntegrated = (lmId: number) => myIntegrations.some(i => i.last_mile_id === lmId);

  const openIntegration = (lm: any) => {
    const existing = myIntegrations.find(i => i.last_mile_id === lm.id);
    setSelectedLM(lm);
    setForm({
      last_mile_id: lm.id,
      api_key: existing?.api_key || '',
      api_secret: existing?.api_secret || '',
      auth_type: existing?.auth_type || 'api_key',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await lastMileApi.storeIntegration(form);
      toast.success('Intégration sauvegardée');
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Truck size={24} className="text-blue-600" />
        Last Mile — Livraison
      </h1>

      <p className="text-gray-600 text-sm">
        Connectez vos services de livraison pour automatiser l'expédition de vos commandes.
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lastMiles.map((lm: any) => {
            const integrated = isIntegrated(lm.id);
            return (
              <div key={lm.id} className={`card hover:shadow-md transition-shadow border-2 ${integrated ? 'border-green-200 bg-green-50/30' : 'border-transparent'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Truck size={24} className="text-blue-500" />
                  </div>
                  {integrated && (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      <Check size={12} />
                      Connecté
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{lm.name}</h3>
                {lm.description && <p className="text-sm text-gray-500 mb-4">{lm.description}</p>}
                <button
                  onClick={() => openIntegration(lm)}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                    integrated
                      ? 'bg-green-100 hover:bg-green-200 text-green-700'
                      : 'btn-primary'
                  }`}
                >
                  <Link2 size={14} />
                  {integrated ? 'Modifier intégration' : 'Connecter'}
                </button>
              </div>
            );
          })}
          {lastMiles.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Truck size={48} className="mx-auto mb-3 opacity-40" />
              <p>Aucun service de livraison disponible</p>
            </div>
          )}
        </div>
      )}

      {/* My integrations summary */}
      {myIntegrations.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Mes intégrations actives</h3>
          <div className="space-y-2">
            {myIntegrations.map((int: any) => (
              <div key={int.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Check size={16} className="text-green-600" />
                <span className="font-medium text-gray-700">{int.last_mile?.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{int.auth_type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Modal */}
      {showModal && selectedLM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Intégration</h2>
                <p className="text-sm text-gray-500">{selectedLM.name}</p>
              </div>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'authentification</label>
                <select value={form.auth_type} onChange={e => setForm(p => ({ ...p, auth_type: e.target.value }))} className="input-field">
                  <option value="api_key">API Key</option>
                  <option value="oauth">OAuth</option>
                  <option value="basic">Basic Auth</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input value={form.api_key} onChange={e => setForm(p => ({ ...p, api_key: e.target.value }))} className="input-field" placeholder="votre-api-key" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Secret (optionnel)</label>
                <input value={form.api_secret} onChange={e => setForm(p => ({ ...p, api_secret: e.target.value }))} className="input-field" placeholder="votre-api-secret" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {submitting && <Loader size={16} className="animate-spin" />}
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
