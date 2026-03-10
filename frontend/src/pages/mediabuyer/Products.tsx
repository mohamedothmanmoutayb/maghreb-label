import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api';
import { Package, Search, Filter, ChevronRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productApi.list({ search, category_id: catFilter || undefined }),
        productApi.categories(),
      ]);
      setProducts(prodRes.data.data?.data || prodRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, catFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package size={24} className="text-blue-600" />
          Catalogue Produits
        </h1>
        <Link to="/leads/new" className="btn-primary">Passer commande</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="input-field pl-9"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">Toutes catégories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product: any) => (
            <div key={product.id} className="card hover:shadow-md transition-shadow">
              <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Package size={40} className="text-blue-300" />
              </div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-sm leading-tight">{product.nom}</h3>
                <span className="text-blue-600 font-bold text-sm whitespace-nowrap ml-2">{product.prix_unitaire} DH</span>
              </div>
              {product.category && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <Tag size={12} />
                  {product.category.name}
                </div>
              )}
              {product.delai_production && (
                <p className="text-xs text-gray-400 mb-3">Délai: {product.delai_production} jours</p>
              )}
              {product.ingredient && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.ingredient}</p>
              )}
              <Link
                to={`/leads/new?product=${product.id}`}
                className="w-full btn-primary text-sm flex items-center justify-center gap-2"
              >
                Commander
                <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
