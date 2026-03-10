<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserController extends Controller
{
    private function getUser() { return JWTAuth::parseToken()->authenticate(); }

    public function profile()
    {
        $user = $this->getUser();
        $wallet = Wallet::where('user_id', $user->id)->first();
        return response()->json([
            'success' => true,
            'user' => array_merge($user->toArray(), ['solde' => $wallet->solde ?? 0])
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $this->getUser();
        $request->validate([
            'nom' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
        ]);
        $user->update($request->only(['nom','telephone']));
        if ($request->mot_de_passe) {
            $user->update(['mot_de_passe' => Hash::make($request->mot_de_passe)]);
        }
        return response()->json(['success' => true, 'user' => $user]);
    }

    // Admin: list all users
    public function adminIndex(Request $request)
    {
        $query = User::with('wallet');
        if ($request->role) $query->where('role', $request->role);
        if ($request->statut) $query->where('statut', $request->statut);
        if ($request->search) $query->where(function($q) use ($request) {
            $q->where('nom', 'like', '%'.$request->search.'%')
              ->orWhere('email', 'like', '%'.$request->search.'%');
        });
        return response()->json(['success' => true, 'data' => $query->orderBy('created_at','desc')->paginate(25)]);
    }

    public function adminShow($id)
    {
        $user = User::with(['wallet','leads'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $user]);
    }

    public function adminCreate(Request $request)
    {
        $request->validate([
            'nom' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'mot_de_passe' => 'required|string|min:6',
            'role' => 'required|in:admin,mediabuyer,printer',
            'telephone' => 'nullable|string',
        ]);
        $user = User::create([
            'nom' => $request->nom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'mot_de_passe' => Hash::make($request->mot_de_passe),
            'role' => $request->role,
            'statut' => 'active',
            'email_verified' => true,
        ]);
        Wallet::create(['user_id' => $user->id, 'solde' => 0]);
        return response()->json(['success' => true, 'data' => $user], 201);
    }

    public function adminUpdate(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update($request->only(['nom','telephone','statut','role']));
        if ($request->mot_de_passe) {
            $user->update(['mot_de_passe' => Hash::make($request->mot_de_passe)]);
        }
        return response()->json(['success' => true, 'data' => $user]);
    }

    public function adminDelete($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Utilisateur supprimé']);
    }
}
