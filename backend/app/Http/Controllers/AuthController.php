<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'nullable|string|max:20',
            'mot_de_passe' => 'required|string|min:6',
            'role' => 'nullable|in:mediabuyer,printer',
        ]);

        $otp = rand(100000, 999999);
        $user = User::create([
            'nom' => $request->nom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'mot_de_passe' => Hash::make($request->mot_de_passe),
            'role' => $request->role ?? 'mediabuyer',
            'statut' => 'active',
            'email_verified' => false,
            'otp_code' => $otp,
            'otp_expires' => time() + 600,
        ]);

        Wallet::create(['user_id' => $user->id, 'solde' => 0]);

        return response()->json([
            'success' => true,
            'message' => 'Compte créé. Vérifiez votre email.',
            'otp' => $otp, // In prod, send via email
            'user_id' => $user->id,
        ], 201);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'otp' => 'required|string',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->otp_code !== $request->otp || time() > $user->otp_expires) {
            return response()->json(['success' => false, 'message' => 'OTP invalide ou expiré'], 400);
        }

        $user->update(['email_verified' => true, 'otp_code' => null, 'otp_expires' => null]);
        $token = JWTAuth::fromUser($user);

        return response()->json(['success' => true, 'token' => $token, 'user' => $this->userResponse($user)]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'mot_de_passe' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->mot_de_passe, $user->mot_de_passe)) {
            return response()->json(['success' => false, 'message' => 'Identifiants incorrects'], 401);
        }

        if ($user->statut !== 'active') {
            return response()->json(['success' => false, 'message' => 'Compte désactivé'], 403);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $this->userResponse($user),
        ]);
    }

    public function me(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();
        return response()->json(['success' => true, 'user' => $this->userResponse($user)]);
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['success' => true, 'message' => 'Déconnecté']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Email non trouvé'], 404);
        }

        $otp = rand(100000, 999999);
        $user->update(['otp_code' => $otp, 'otp_expires' => time() + 600]);

        return response()->json(['success' => true, 'message' => 'OTP envoyé', 'otp' => $otp]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'otp' => 'required|string',
            'nouveau_mot_de_passe' => 'required|string|min:6',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->otp_code !== $request->otp || time() > $user->otp_expires) {
            return response()->json(['success' => false, 'message' => 'OTP invalide ou expiré'], 400);
        }

        $user->update([
            'mot_de_passe' => Hash::make($request->nouveau_mot_de_passe),
            'otp_code' => null,
            'otp_expires' => null,
        ]);

        return response()->json(['success' => true, 'message' => 'Mot de passe réinitialisé']);
    }

    private function userResponse($user)
    {
        return [
            'id' => $user->id,
            'nom' => $user->nom,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'role' => $user->role,
            'statut' => $user->statut,
            'email_verified' => $user->email_verified,
        ];
    }
}
