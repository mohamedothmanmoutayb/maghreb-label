<?php
namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class WalletController extends Controller
{
    private function getUser() {
        return JWTAuth::parseToken()->authenticate();
    }

    public function balance()
    {
        $user = $this->getUser();
        $wallet = Wallet::firstOrCreate(['user_id' => $user->id], ['solde' => 0]);
        return response()->json([
            'success' => true,
            'solde' => $wallet->solde,
            'user_id' => $user->id,
        ]);
    }

    public function history()
    {
        $user = $this->getUser();
        $transactions = WalletTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $transactions]);
    }

    public function requestRecharge(Request $request)
    {
        $request->validate([
            'montant' => 'required|numeric|min:1',
            'methode' => 'nullable|string',
            'reference' => 'nullable|string',
        ]);

        $user = $this->getUser();

        $tx = WalletTransaction::create([
            'user_id' => $user->id,
            'type' => 'recharge_request',
            'montant' => $request->montant,
            'reference_commande' => $request->reference ?? 'RECH-' . time(),
            'description' => 'Demande de recharge - ' . ($request->methode ?? 'virement'),
            'statut' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Demande de recharge envoyée. En attente de validation admin.',
            'transaction_id' => $tx->id,
        ]);
    }

    // Admin: validate recharge
    public function adminValidateRecharge(Request $request, $transactionId)
    {
        $request->validate(['action' => 'required|in:approve,reject']);

        $tx = WalletTransaction::findOrFail($transactionId);

        if ($tx->statut !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Transaction déjà traitée'], 400);
        }

        if ($request->action === 'approve') {
            $wallet = Wallet::firstOrCreate(['user_id' => $tx->user_id], ['solde' => 0]);
            $wallet->increment('solde', $tx->montant);
            $tx->update(['statut' => 'completed', 'type' => 'recharge']);

            return response()->json([
                'success' => true,
                'message' => 'Recharge approuvée',
                'nouveau_solde' => $wallet->solde,
            ]);
        } else {
            $tx->update(['statut' => 'rejected']);
            return response()->json(['success' => true, 'message' => 'Recharge rejetée']);
        }
    }

    // Admin: list all pending recharges
    public function adminPendingRecharges()
    {
        $pending = WalletTransaction::with('user')
            ->where('statut', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $pending]);
    }

    // Admin: direct add funds
    public function adminAddFunds(Request $request, $userId)
    {
        $request->validate(['montant' => 'required|numeric|min:1']);

        $wallet = Wallet::firstOrCreate(['user_id' => $userId], ['solde' => 0]);
        $wallet->increment('solde', $request->montant);

        WalletTransaction::create([
            'user_id' => $userId,
            'type' => 'recharge',
            'montant' => $request->montant,
            'reference_commande' => 'ADMIN-' . time(),
            'description' => 'Recharge manuelle par admin',
            'statut' => 'completed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Fonds ajoutés',
            'nouveau_solde' => $wallet->solde,
        ]);
    }

    // Admin: get wallet of a user
    public function adminUserWallet($userId)
    {
        $wallet = Wallet::where('user_id', $userId)->first();
        $transactions = WalletTransaction::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'solde' => $wallet ? $wallet->solde : 0,
            'transactions' => $transactions,
        ]);
    }

    // Admin: list all wallets
    public function adminListWallets()
    {
        $wallets = Wallet::with('user')->orderBy('solde', 'desc')->get();
        return response()->json(['success' => true, 'data' => $wallets]);
    }
}
