<?php
namespace App\Http\Controllers;

use App\Models\LastMile;
use App\Models\LastMileIntegration;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class LastMileController extends Controller
{
    private function getUser() { return JWTAuth::parseToken()->authenticate(); }

    public function index()
    {
        $lastMiles = LastMile::where('is_active', true)->get();
        return response()->json(['success' => true, 'data' => $lastMiles]);
    }

    public function myIntegrations()
    {
        $user = $this->getUser();
        $integrations = LastMileIntegration::with('lastMile')->where('user_id', $user->id)->get();
        return response()->json(['success' => true, 'data' => $integrations]);
    }

    public function storeIntegration(Request $request)
    {
        $user = $this->getUser();
        $request->validate([
            'last_mile_id' => 'required|exists:last_miles,id',
            'api_key' => 'nullable|string',
            'api_secret' => 'nullable|string',
            'auth_type' => 'nullable|string',
        ]);
        $integration = LastMileIntegration::updateOrCreate(
            ['user_id' => $user->id, 'last_mile_id' => $request->last_mile_id],
            [
                'api_key' => $request->api_key,
                'api_secret' => $request->api_secret,
                'auth_type' => $request->auth_type ?? 'api_key',
                'is_active' => true,
            ]
        );
        return response()->json(['success' => true, 'data' => $integration]);
    }

    // Admin CRUD for LastMile providers
    public function adminIndex()
    {
        return response()->json(['success' => true, 'data' => LastMile::all()]);
    }

    public function adminStore(Request $request)
    {
        $request->validate(['name' => 'required|string']);
        $lm = LastMile::create([
            'name' => $request->name,
            'logo' => $request->logo,
            'description' => $request->description,
            'is_active' => true,
        ]);
        return response()->json(['success' => true, 'data' => $lm], 201);
    }

    public function adminUpdate(Request $request, $id)
    {
        $lm = LastMile::findOrFail($id);
        $lm->update($request->only(['name','logo','description','is_active']));
        return response()->json(['success' => true, 'data' => $lm]);
    }

    public function adminDelete($id)
    {
        LastMile::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Supprimé']);
    }
}
