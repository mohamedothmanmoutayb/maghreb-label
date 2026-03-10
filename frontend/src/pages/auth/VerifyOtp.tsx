import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Package, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const userId = searchParams.get('user_id');
  const demoOtp = searchParams.get('otp');

  useEffect(() => {
    if (demoOtp) setOtp(demoOtp);
  }, [demoOtp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return toast.error('User ID manquant');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ user_id: parseInt(userId), otp });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Email vérifié!');
      const user = res.data.user;
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'printer') navigate('/printer');
      else navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'OTP invalide');
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
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vérification OTP</h2>
          <p className="text-gray-600 mb-6 text-sm">Entrez le code à 6 chiffres envoyé à votre email.</p>

          {demoOtp && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <strong>Code OTP (démo):</strong> {demoOtp}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="input-field text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
              {loading && <Loader size={18} className="animate-spin" />}
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">Retour à la connexion</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
