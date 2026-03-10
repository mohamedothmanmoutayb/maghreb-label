import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { lastMileApi } from './api';
import { Truck, Plus, Edit, Trash2, X, Loader } from 'lucide-react';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';

// MediaBuyer pages
import MBDashboard from './pages/mediabuyer/Dashboard';
import WalletPage from './pages/mediabuyer/WalletPage';
import Products from './pages/mediabuyer/Products';
import Leads from './pages/mediabuyer/Leads';
import NewLead from './pages/mediabuyer/NewLead';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminWallets from './pages/admin/AdminWallets';
import AdminProducts from './pages/admin/AdminProducts';
import AdminLeads from './pages/admin/AdminLeads';
import AdminRequests from './pages/admin/AdminRequests';

// Printer pages
import PrinterDashboard from './pages/printer/PrinterDashboard';

// Shared pages
import Profile from './pages/Profile';
import LastMilePage from './pages/LastMilePage';
import RequestsPage from './pages/RequestsPage';

// ─── AdminLastMiles ─────────────────────────────────────────────────────────
function AdminLastMiles() {
  const [lastMiles, setLastMiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editLM, setEditLM] = React.useState<any>(null);
  const [form, setForm] = React.useState({ name: '', description: '', logo: '' });
  const [submitting, setSubmitting] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await lastMileApi.adminList();
      setLastMiles(res.data.data || []);
    } catch { toast.error('Erreur'); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editLM) { await lastMileApi.adminUpdate(editLM.id, form); toast.success('Mis à jour'); }
      else { await lastMileApi.adminCreate(form); toast.success('Créé'); }
      setShowModal(false); load();
    } catch { toast.error('Erreur'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer?')) return;
    try { await lastMileApi.adminDelete(id); toast.success('Supprimé'); load(); }
    catch { toast.error('Erreur'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Truck size={24} className="text-blue-600" />Last Mile
        </h1>
        <button
          onClick={() => { setEditLM(null); setForm({ name: '', description: '', logo: '' }); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />Nouveau
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : lastMiles.map((lm: any) => (
          <div key={lm.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck size={20} className="text-blue-500" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditLM(lm); setForm({ name: lm.name, description: lm.description || '', logo: lm.logo || '' }); setShowModal(true); }} className="text-gray-400 hover:text-blue-600"><Edit size={15} /></button>
                <button onClick={() => handleDelete(lm.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
            </div>
            <h3 className="font-bold text-gray-800">{lm.name}</h3>
            {lm.description && <p className="text-sm text-gray-500 mt-1">{lm.description}</p>}
            <span className={`inline-flex mt-2 px-2 py-0.5 rounded text-xs font-medium ${lm.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {lm.is_active ? 'Actif' : 'Inactif'}
            </span>
          </div>
        ))}
        {!loading && lastMiles.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">Aucun service de livraison</div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">{editLM ? 'Modifier' : 'Ajouter'} Last Mile</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field" rows={2} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {submitting && <Loader size={16} className="animate-spin" />}
                  {editLM ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Route guards ──────────────────────────────────────────────────────────
interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && user && !roles.includes(user.role)) {
    const redirectMap: Record<string, string> = { admin: '/admin', mediabuyer: '/dashboard', printer: '/printer' };
    return <Navigate to={redirectMap[user.role] || '/login'} replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const redirectMap: Record<string, string> = { admin: '/admin', mediabuyer: '/dashboard', printer: '/printer' };
    return <Navigate to={redirectMap[user.role] || '/dashboard'} replace />;
  }

  return <>{children}</>;
}

// ─── AppRoutes ─────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />

      {/* MediaBuyer */}
      <Route path="/dashboard" element={<ProtectedRoute roles={['mediabuyer']}><MBDashboard /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute roles={['mediabuyer']}><WalletPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute roles={['mediabuyer']}><Products /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute roles={['mediabuyer']}><Leads /></ProtectedRoute>} />
      <Route path="/leads/new" element={<ProtectedRoute roles={['mediabuyer']}><NewLead /></ProtectedRoute>} />
      <Route path="/last-mile" element={<ProtectedRoute roles={['mediabuyer']}><LastMilePage /></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute roles={['mediabuyer']}><RequestsPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/wallets" element={<ProtectedRoute roles={['admin']}><AdminWallets /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute roles={['admin']}><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/leads" element={<ProtectedRoute roles={['admin']}><AdminLeads /></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute roles={['admin']}><AdminRequests /></ProtectedRoute>} />
      <Route path="/admin/last-miles" element={<ProtectedRoute roles={['admin']}><AdminLastMiles /></ProtectedRoute>} />

      {/* Printer */}
      <Route path="/printer" element={<ProtectedRoute roles={['printer', 'admin']}><PrinterDashboard /></ProtectedRoute>} />
      <Route path="/printer/queue" element={<ProtectedRoute roles={['printer', 'admin']}><PrinterDashboard /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-200">404</h1>
            <p className="text-gray-500 mt-2">Page non trouvée</p>
            <a href="/login" className="btn-primary inline-block mt-4">Retour à l'accueil</a>
          </div>
        </div>
      } />
    </Routes>
  );
}

// ─── App root ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
            success: { style: { background: '#10b981' } },
            error: { style: { background: '#ef4444' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
