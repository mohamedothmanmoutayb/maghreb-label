import React, { useEffect, useState } from 'react';
import { productApi } from '../../api';
import { Package, Plus, Edit, Trash2, X, Loader, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProd, setEditProd] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nom: '', category_id: '', prix_unitaire: '', delai_production: '', ingredient: '', description: '', statut: 'active' });

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([productApi.adminList(), productApi.categories()]);
      setProducts(pRes.data.data?.data || pRes.data.data || []);
      setCategories(cRes.data.data || []);
    } catch {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditProd(null);
    setForm({ nom: '', category_id: '', prix_unitaire: '', delai_production: '', ingredient: '', description: '', statut: 'active' });
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditProd(p);
    setForm({ nom: p.nom, category_id: p.category_id, prix_unitaire: p.prix_unitaire, delai_production: p.delai_production || '', ingredient: p.ingredient || '', description: p.description || '', statut: p.statut });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editProd) {
        await productApi.update(editProd.id, form);
        toast.success('Produit mis à jour');
      } else {
        await productApi.create(form);
        toast.success('Produit créé');
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
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await productApi.delete(id);
      toast.success('Supprimé');
      load();
    } catch { toast.error('Erreur'); }
  };

  const filtered = products.filter(p =>
    !search || p.nom?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package size={24} className="text-blue-600" />
          Gestion des Produits
        </h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nouveau produit
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="input-field pl-9" />
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Nom</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Catégorie</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Prix</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Délai</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Statut</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                          <Package size={16} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{p.nom}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{p.ingredient}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">{p.prix_unitaire} DH</td>
                    <td className="px-4 py-3 text-center text-gray-500">{p.delai_production ? `${p.delai_production}j` : '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${p.statut === 'active' ? 'badge-confirmed' : 'badge-cancelled'}`}>
                        {p.statut === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-blue-600"><Edit size={15} /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Aucun produit</div>}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">{editProd ? 'Modifier' : 'Créer'} produit</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                  <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className="input-field" required>
                    <option value="">Sélectionner...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (DH) *</label>
                  <input type="number" step="0.01" value={form.prix_unitaire} onChange={e => setForm(p => ({ ...p, prix_unitaire: e.target.value }))} className="input-field" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Délai production (jours)</label>
                  <input type="number" value={form.delai_production} onChange={e => setForm(p => ({ ...p, delai_production: e.target.value }))} className="input-field" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))} className="input-field">
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingrédients / Composition</label>
                <textarea value={form.ingredient} onChange={e => setForm(p => ({ ...p, ingredient: e.target.value }))} className="input-field" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {submitting && <Loader size={16} className="animate-spin" />}
                  {editProd ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
