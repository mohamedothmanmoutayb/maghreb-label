<?php
namespace App\Http\Controllers;

use App\Models\RequestLabel;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class RequestLabelController extends Controller
{
    private function getUser() { return JWTAuth::parseToken()->authenticate(); }

    public function index()
    {
        $user = $this->getUser();
        $requests = RequestLabel::with('product')->where('user_id', $user->id)->orderBy('created_at','desc')->get();
        return response()->json(['success' => true, 'data' => $requests]);
    }

    public function store(Request $request)
    {
        $user = $this->getUser();
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'fichier_label' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $req = RequestLabel::create([
            'user_id' => $user->id,
            'product_id' => $request->product_id,
            'fichier_label' => $request->fichier_label,
            'notes' => $request->notes,
            'statut_validation' => 'pending',
        ]);
        return response()->json(['success' => true, 'data' => $req], 201);
    }

    public function adminIndex()
    {
        $requests = RequestLabel::with(['user','product'])->orderBy('created_at','desc')->paginate(25);
        return response()->json(['success' => true, 'data' => $requests]);
    }

    public function adminValidate(Request $request, $id)
    {
        $request->validate(['statut' => 'required|in:approved,rejected']);
        $req = RequestLabel::findOrFail($id);
        $req->update(['statut_validation' => $request->statut, 'notes' => $request->notes]);
        return response()->json(['success' => true, 'message' => 'Validation mise à jour']);
    }
}
