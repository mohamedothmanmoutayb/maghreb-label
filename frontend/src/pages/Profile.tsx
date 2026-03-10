import React, { useEffect, useState } from 'react';
import { userApi, walletApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Shield, Wallet, Loader, Edit2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nom: '', telephone: '', mot_de_passe: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    userApi.profile().then(res => {
      setProfile(res.data.user);
      setForm({ nom: res.data.user.nom, telephone: res.data.user.telephone || '', mot_de_passe: '' });
    }).catch(() => toast.error('Erreur')).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userApi.updateProfile(form);
      toast.success('Profil mis à jour');
      setEditing(false);
      const res = await userApi.profile();
      setProfile(res.data.user);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  const roleLabel = { admin: 'Administrateur', mediabuyer: 'Media Buyer', printer: 'Imprimeur' }[profile?.role] || profile?.role;
  const roleColor = { admin: 'bg-red-100 text-red-700', mediabuyer: 'bg-blue-100 text-blue-700', printer: 'bg-purple-100 text-purple-700' }[profile?.role] || 'bg-gray-100 text-gray-700';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <User size={24} className="text-blue-600" />
        Mon Profil
      </h1>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{profile?.nom?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{profile?.nom}</h2>
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${roleColor}`}>{roleLabel}</span>
            </div>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <Edit2 size={14} />
              Modifier
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} className="input-field" placeholder="+212600000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
              <input type="password" value={form.mot_de_passe} onChange={e => setForm(p => ({ ...p, mot_de_passe: e.target.value }))} className="input-field" placeholder="••••••••" minLength={6} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)} className="flex-1 btn-secondary">Annuler</button>
              <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {submitting && <Loader size={16} className="animate-spin" />}
                <Save size={16} />
                Sauvegarder
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{profile?.email}</p>
              </div>
              {profile?.email_verified && (
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Vérifié</span>
              )}
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="font-medium text-gray-800">{profile?.telephone || 'Non renseigné'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Rôle</p>
                <p className="font-medium text-gray-800">{roleLabel}</p>
              </div>
            </div>
            {profile?.solde !== undefined && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Wallet size={18} className="text-blue-500" />
                <div>
                  <p className="text-xs text-blue-500">Solde Wallet</p>
                  <p className="font-bold text-blue-700 text-lg">{parseFloat(profile.solde || 0).toFixed(2)} DH</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
