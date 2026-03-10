import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productApi, leadApi, walletApi } from '../../api';
import { ShoppingCart, Plus, Trash2, Loader, AlertCircle, Package, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface CartItem { product: any; quantity: number; }

export default function NewLead() {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [client, setClient] = useState({ name: '', phone: '', city: '', address: '' });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productApi.list({ per_page: 100 }),
      productApi.categories(),
      walletApi.balance(),
    ]).then(([prodRes, catRes, balRes]) => {
      const prods = prodRes.data.data?.data || prodRes.data.data || [];
      setProducts(prods);
      setCategories(catRes.data.data || []);
      setBalance(balRes.data.solde);

      const preselect = searchParams.get('product');
      if (preselect) {
        const p = prods.find((x: any) => x.id === parseInt(preselect));
        if (p) setCart([{ product: p, quantity: 1 }]);
      }
    }).catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const total = cart.reduce((sum, item) => sum + item.product.prix_unitaire * item.quantity, 0);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) removeFromCart(productId);
    else setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const handleSubmit = async () => {
    if (!client.name || !client.phone) return toast.error('Nom et téléphone client requis');
    if (cart.length === 0) return toast.error('Panier vide');
    if (balance < total) return toast.error(`Solde insuffisant: ${balance} DH < ${total} DH`);

    setSubmitting(true);
    try {
      const res = await leadApi.create({
        ...client,
        client_name: client.name,
        client_phone: client.phone,
        client_city: client.city,
        client_address: client.address,
        products: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
        notes,
      });
      toast.success(`Commande ${res.data.n_lead} créée! Solde restant: ${res.data.solde_restant} DH`);
      navigate('/leads');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart size={24} className="text-blue-600" />
          Nouvelle Commande
        </h1>
        <div className="bg-blue-50 px-3 py-1 rounded-lg text-sm">
          Solde: <strong className="text-blue-600">{balance.toFixed(2)} DH</strong>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[{ n: 1, label: 'Produits' }, { n: 2, label: 'Client' }, { n: 3, label: 'Confirmation' }].map((s, i) => (
          <React.Fragment key={s.n}>
            <button
              onClick={() => cart.length > 0 && setStep(s.n)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                step === s.n ? 'bg-blue-600 text-white' : step > s.n ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span className="font-medium">{s.n}</span>
              <span className="hidden sm:block">{s.label}</span>
            </button>
            {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: product selection / client form */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">Sélectionner les produits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((p: any) => (
                  <div
                    key={p.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      cart.find(i => i.product.id === p.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => addToCart(p)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{p.nom}</p>
                        <p className="text-xs text-gray-500">{p.category?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 text-sm">{p.prix_unitaire} DH</p>
                        {cart.find(i => i.product.id === p.id) && (
                          <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                            {cart.find(i => i.product.id === p.id)?.quantity}x
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => cart.length > 0 && setStep(2)}
                disabled={cart.length === 0}
                className="mt-4 w-full btn-primary"
              >
                Continuer →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <User size={18} />
                Informations client
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input value={client.name} onChange={e => setClient(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Ahmed Benali" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                    <input value={client.phone} onChange={e => setClient(p => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="+212600000000" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input value={client.city} onChange={e => setClient(p => ({ ...p, city: e.target.value }))} className="input-field" placeholder="Casablanca" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input value={client.address} onChange={e => setClient(p => ({ ...p, address: e.target.value }))} className="input-field" placeholder="123 Rue..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field" rows={2} placeholder="Notes optionnelles..." />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="btn-secondary">← Retour</button>
                <button onClick={() => client.name && client.phone && setStep(3)} className="btn-primary flex-1">
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">Confirmation</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Client</p>
                  <p className="text-sm text-gray-600">{client.name} — {client.phone}</p>
                  {client.city && <p className="text-xs text-gray-400">{client.city}, {client.address}</p>}
                </div>
                {balance < total && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle size={16} />
                    Solde insuffisant! Solde: {balance} DH — Requis: {total} DH
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(2)} className="btn-secondary">← Retour</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || balance < total}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader size={16} className="animate-spin" />}
                  {submitting ? 'Création...' : `Confirmer & Débiter ${total} DH`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Cart summary */}
        <div className="card h-fit sticky top-4">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <ShoppingCart size={16} />
            Panier ({cart.length})
          </h3>
          {cart.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Panier vide</p>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{item.product.nom}</p>
                    <p className="text-xs text-gray-500">{item.product.prix_unitaire} DH/u</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded border flex items-center justify-center text-sm hover:bg-gray-100">-</button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded border flex items-center justify-center text-sm hover:bg-gray-100">+</button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{(item.product.prix_unitaire * item.quantity).toFixed(2)} DH</p>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-medium">{total.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Solde dispo.</span>
                  <span className={balance >= total ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {balance.toFixed(2)} DH
                  </span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-blue-600 text-lg">{total.toFixed(2)} DH</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
