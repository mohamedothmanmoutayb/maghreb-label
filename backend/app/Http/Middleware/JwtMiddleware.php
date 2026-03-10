<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\JWTException;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 401);
            }
            if (!empty($roles) && !in_array($user->role, $roles)) {
                return response()->json(['success' => false, 'message' => 'Accès refusé'], 403);
            }
        } catch (TokenExpiredException $e) {
            return response()->json(['success' => false, 'message' => 'Token expiré'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['success' => false, 'message' => 'Token invalide'], 401);
        } catch (JWTException $e) {
            return response()->json(['success' => false, 'message' => 'Token manquant'], 401);
        }
        return $next($request);
    }
}
