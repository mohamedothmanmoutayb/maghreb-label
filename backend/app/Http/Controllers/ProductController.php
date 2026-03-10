<?php
namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class ProductController extends Controller
{
    private function getUser() { return JWTAuth::parseToken()->authenticate(); }

    public function index(Request $request)
    {
        $query = Product::with('category')->where('statut', 'active');
        if ($request->category_id) $query->where('category_id', $request->category_id);
        if ($request->search) $query->where('nom', 'like', '%'.$request->search.'%');
        return response()->json(['success' => true, 'data' => $query->paginate(20)]);
    }

    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $product]);
    }

    // Admin CRUD
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'prix_unitaire' => 'required|numeric|min:0',
            'delai_production' => 'nullable|integer',
            'ingredient' => 'nullable|string',
            'description' => 'nullable|string',
            'statut' => 'nullable|in:active,inactive',
        ]);

        $product = Product::create($request->only([
            'nom','category_id','prix_unitaire','delai_production',
            'ingredient','description','image','statut'
        ]));

        return response()->json(['success' => true, 'data' => $product], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->only([
            'nom','category_id','prix_unitaire','delai_production',
            'ingredient','description','image','statut'
        ]));
        return response()->json(['success' => true, 'data' => $product]);
    }

    public function destroy($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Produit supprimé']);
    }

    // Categories
    public function categories()
    {
        $categories = Category::where('is_active', true)->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function storeCategory(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $cat = Category::create([
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => true,
        ]);
        return response()->json(['success' => true, 'data' => $cat], 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $cat = Category::findOrFail($id);
        $cat->update($request->only(['name','description','is_active']));
        return response()->json(['success' => true, 'data' => $cat]);
    }

    public function destroyCategory($id)
    {
        Category::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Catégorie supprimée']);
    }

    public function allProducts()
    {
        $products = Product::with('category')->orderBy('created_at','desc')->paginate(50);
        return response()->json(['success' => true, 'data' => $products]);
    }
}
