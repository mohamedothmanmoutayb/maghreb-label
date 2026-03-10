import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import { Package, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', mot_de_passe: '', role: 'mediabuyer' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register(form);
      toast.success('Compte créé! Vérifiez votre email.');
      navigate(`/verify-otp?user_id=${res.data.user_id}&otp=${res.data.otp}`);
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg: any) => toast.error(msg));
      } else {
        toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">MaghrebLabel</h1>
          <p className="text-blue-200 mt-1">Créer votre compte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Inscription</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
              <input name="nom" value={form.nom} onChange={handleChange} className="input-field" placeholder="Mohamed Amine" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="votre@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input name="telephone" value={form.telephone} onChange={handleChange} className="input-field" placeholder="+212600000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <input name="mot_de_passe" type="password" value={form.mot_de_passe} onChange={handleChange} className="input-field" placeholder="••••••••" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de compte</label>
              <select name="role" value={form.role} onChange={handleChange} className="input-field">
                <option value="mediabuyer">Media Buyer</option>
                <option value="printer">Imprimeur</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
              {loading && <Loader size={18} className="animate-spin" />}
              {loading ? 'Inscription...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
