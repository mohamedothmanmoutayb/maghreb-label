import React, { useEffect, useState } from 'react';
import { walletApi } from '../../api';
import { Wallet, Search, Plus, Check, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminWallets() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending'>('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [wRes, pRes] = await Promise.all([walletApi.adminList(), walletApi.adminPending()]);
      setWallets(wRes.data.data || []);
      setPending(pRes.data.data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const validateRecharge = async (id: number, action: string) => {
    try {
      await walletApi.adminValidateRecharge(id, action);
      toast.success(action === 'approve' ? 'Recharge approuvée!' : 'Recharge rejetée');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const filtered = wallets.filter(w =>
    !search || w.user?.nom?.toLowerCase().includes(search.toLowerCase()) || w.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Wallet size={24} className="text-blue-600" />
        Gestion des Wallets
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{wallets.length}</p>
          <p className="text-sm text-gray-500 mt-1">Wallets actifs</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">
            {wallets.reduce((sum, w) => sum + parseFloat(w.solde || 0), 0).toFixed(0)} DH
          </p>
          <p className="text-sm text-gray-500 mt-1">Total soldes</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-500">{pending.length}</p>
          <p className="text-sm text-gray-500 mt-1">Recharges en attente</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
        >
          Tous les wallets ({wallets.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${tab === 'pending' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border'}`}
        >
          Recharges en attente
          {pending.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {pending.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'all' && (
        <>
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
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Utilisateur</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Rôle</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">Solde</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((w: any) => (
                      <tr key={w.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                              {w.user?.nom?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">{w.user?.nom}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{w.user?.email}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{w.user?.role}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-lg text-blue-600">{parseFloat(w.solde || 0).toFixed(2)} DH</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Aucun wallet</div>}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'pending' && (
        <div className="card overflow-hidden p-0">
          {pending.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wallet size={40} className="mx-auto mb-2 opacity-40" />
              <p>Aucune demande en attente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Utilisateur</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Montant</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Description</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pending.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{tx.user?.nom}</p>
                          <p className="text-xs text-gray-400">{tx.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-600 text-base">{tx.montant} DH</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{tx.description}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => validateRecharge(tx.id, 'approve')}
                            className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Check size={14} />
                            Approuver
                          </button>
                          <button
                            onClick={() => validateRecharge(tx.id, 'reject')}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            <X size={14} />
                            Rejeter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
