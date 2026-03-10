import React, { useEffect, useState } from 'react';
import { userApi, walletApi } from '../../api';
import { Users, Plus, Search, Edit, Trash2, Eye, Wallet, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const roleBadge = (r: string) => {
  const map: any = { admin: 'bg-red-100 text-red-700', mediabuyer: 'bg-blue-100 text-blue-700', printer: 'bg-purple-100 text-purple-700' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[r] || 'bg-gray-100 text-gray-600'}`}>{r}</span>;
};
const statusBadge = (s: string) => {
  const map: any = { active: 'badge-confirmed', inactive: 'badge-cancelled', pending: 'badge-pending' };
  const labels: any = { active: 'Actif', inactive: 'Inactif', pending: 'En attente' };
  return <span className={map[s] || 'badge-pending'}>{labels[s] || s}</span>;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [walletModal, setWalletModal] = useState<any>(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', mot_de_passe: '', role: 'mediabuyer', statut: 'active' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await userApi.adminList({ search, role: role || undefined });
      setUsers(res.data.data?.data || res.data.data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, role]);

  const openCreate = () => {
    setEditUser(null);
    setForm({ nom: '', email: '', telephone: '', mot_de_passe: '', role: 'mediabuyer', statut: 'active' });
    setShowModal(true);
  };

  const openEdit = (user: any) => {
    setEditUser(user);
    setForm({ nom: user.nom, email: user.email, telephone: user.telephone || '', mot_de_passe: '', role: user.role, statut: user.statut });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editUser) {
        await userApi.adminUpdate(editUser.id, form);
        toast.success('Utilisateur mis à jour');
      } else {
        await userApi.adminCreate(form);
        toast.success('Utilisateur créé');
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await userApi.adminDelete(id);
      toast.success('Supprimé');
      load();
    } catch {
      toast.error('Erreur de suppression');
    }
  };

  const handleAddFunds = async () => {
    if (!walletAmount || !walletModal) return;
    setSubmitting(true);
    try {
      const res = await walletApi.adminAddFunds(walletModal.id, parseFloat(walletAmount));
      toast.success(`Fonds ajoutés. Nouveau solde: ${res.data.nouveau_solde} DH`);
      setWalletModal(null);
      setWalletAmount('');
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
          <Users size={24} className="text-blue-600" />
          Utilisateurs
        </h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nouvel utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-9" />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)} className="input-field sm:w-40">
          <option value="">Tous rôles</option>
          <option value="admin">Admin</option>
          <option value="mediabuyer">MediaBuyer</option>
          <option value="printer">Printer</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Nom</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Rôle</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Solde</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Statut</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                          {user.nom?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.nom}</p>
                          <p className="text-xs text-gray-400">{user.telephone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3 text-right font-medium text-blue-600">
                      {user.wallet ? `${user.wallet.solde} DH` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">{statusBadge(user.statut)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(user)} className="text-gray-500 hover:text-blue-600" title="Modifier">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => { setWalletModal(user); setWalletAmount(''); }} className="text-gray-500 hover:text-green-600" title="Wallet">
                          <Wallet size={15} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="text-gray-500 hover:text-red-600" title="Supprimer">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-400">Aucun utilisateur</div>
            )}
          </div>
        )}
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">{editUser ? 'Modifier' : 'Créer'} utilisateur</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe {editUser ? '(laisser vide)' : '*'}</label>
                  <input type="password" value={form.mot_de_passe} onChange={e => setForm(p => ({ ...p, mot_de_passe: e.target.value }))} className="input-field" required={!editUser} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="input-field">
                    <option value="mediabuyer">MediaBuyer</option>
                    <option value="printer">Printer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))} className="input-field">
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {submitting && <Loader size={16} className="animate-spin" />}
                  {editUser ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {walletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Recharger wallet</h2>
              <button onClick={() => setWalletModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">{walletModal.nom}</p>
                <p className="text-xs text-gray-500">Solde actuel: {walletModal.wallet?.solde || 0} DH</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant à ajouter (DH) *</label>
                <input
                  type="number"
                  value={walletAmount}
                  onChange={e => setWalletAmount(e.target.value)}
                  className="input-field"
                  placeholder="500"
                  min="1"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setWalletModal(null)} className="flex-1 btn-secondary">Annuler</button>
                <button onClick={handleAddFunds} disabled={submitting} className="flex-1 btn-success flex items-center justify-center gap-2">
                  {submitting && <Loader size={16} className="animate-spin" />}
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
