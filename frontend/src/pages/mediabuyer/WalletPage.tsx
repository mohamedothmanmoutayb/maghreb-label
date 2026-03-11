import React, { useEffect, useState } from "react";
import { walletApi } from "../../api";
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [rechargeForm, setRechargeForm] = useState({
    montant: "",
    methode: "virement",
    reference: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [balRes, histRes] = await Promise.all([
        walletApi.balance(),
        walletApi.history(),
      ]);
      setBalance(balRes.data.solde);
      setTransactions(histRes.data.data?.data || histRes.data.data || []);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await walletApi.requestRecharge(rechargeForm);
      toast.success("Demande de recharge envoyée. En attente de validation.");
      setShowModal(false);
      setRechargeForm({ montant: "", methode: "virement", reference: "" });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const txIcon = (type: string) => {
    if (type === "debit")
      return <TrendingDown size={16} className="text-red-500" />;
    return <TrendingUp size={16} className="text-green-500" />;
  };

  const txColor = (type: string) =>
    type === "debit" ? "text-red-600" : "text-green-600";
  const txSign = (type: string) => (type === "debit" ? "-" : "+");

  const statusBadge = (s: string) => {
    const map: any = {
      pending: "badge-pending",
      completed: "badge-confirmed",
      rejected: "badge-cancelled",
    };
    const labels: any = {
      pending: "En attente",
      completed: "Complété",
      rejected: "Rejeté",
    };
    return <span className={map[s] || "badge-pending"}>{labels[s] || s}</span>;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet size={24} className="text-blue-600" />
          Mon Wallet
        </h1>
        <button
          onClick={() => load()}
          className="text-gray-500 hover:text-gray-700"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Solde disponible</p>
            <p className="text-4xl font-bold">{balance} DH</p>
            <p className="text-blue-200 text-sm mt-2">Portefeuille actif</p>
          </div>
          <Wallet size={48} className="text-blue-300" />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Demander une recharge
        </button>
      </div>

      {/* Transactions */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">
          Historique des transactions
        </h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Wallet size={40} className="mx-auto mb-2 opacity-40" />
            <p>Aucune transaction</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {txIcon(tx.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {tx.description || tx.type}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tx.reference_commande} •{" "}
                      {new Date(tx.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${txColor(tx.type)}`}>
                    {txSign(tx.type)}
                    {tx.montant} DH
                  </p>
                  <div>{statusBadge(tx.statut)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recharge Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Demande de recharge
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Votre demande sera validée par un admin.
              </p>
            </div>
            <form onSubmit={handleRecharge} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (DH) *
                </label>
                <input
                  type="number"
                  value={rechargeForm.montant}
                  onChange={(e) =>
                    setRechargeForm((p) => ({ ...p, montant: e.target.value }))
                  }
                  className="input-field"
                  placeholder="500"
                  min="10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Méthode
                </label>
                <select
                  value={rechargeForm.methode}
                  onChange={(e) =>
                    setRechargeForm((p) => ({ ...p, methode: e.target.value }))
                  }
                  className="input-field"
                >
                  <option value="virement">Virement bancaire</option>
                  <option value="cash">Espèces</option>
                  <option value="mobile">Paiement mobile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence
                </label>
                <input
                  value={rechargeForm.reference}
                  onChange={(e) =>
                    setRechargeForm((p) => ({
                      ...p,
                      reference: e.target.value,
                    }))
                  }
                  className="input-field"
                  placeholder="N° de virement..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {submitting && <Loader size={16} className="animate-spin" />}
                  {submitting ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
