<?php
namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadProduct;
use App\Models\LeadHistory;
use App\Models\Client;
use App\Models\Product;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\ProductionStatus;
use App\Models\PrintStatus;
use App\Models\ShippingStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

class LeadController extends Controller
{
    private function getUser() { return JWTAuth::parseToken()->authenticate(); }

    public function index(Request $request)
    {
        $user = $this->getUser();
        $query = Lead::with(['client','leadProducts.product','productionStatus','printStatus','shippingStatus'])
            ->where('user_id', $user->id);

        if ($request->statut) $query->where('statut_confirmation', $request->statut);
        if ($request->search) $query->where('n_lead', 'like', '%'.$request->search.'%');

        return response()->json(['success' => true, 'data' => $query->orderBy('created_at','desc')->paginate(20)]);
    }

    public function show($id)
    {
        $user = $this->getUser();
        $lead = Lead::with([
            'client','leadProducts.product','leadHistory.user',
            'productionStatus','printStatus','shippingStatus'
        ])->where('user_id', $user->id)->findOrFail($id);

        return response()->json(['success' => true, 'data' => $lead]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'client_name' => 'required|string',
            'client_phone' => 'required|string',
            'client_city' => 'nullable|string',
            'client_address' => 'nullable|string',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        $user = $this->getUser();

        DB::beginTransaction();
        try {
            // Calculate total
            $total = 0;
            $productDetails = [];
            foreach ($request->products as $item) {
                $product = Product::findOrFail($item['product_id']);
                $lineTotal = $product->prix_unitaire * $item['quantity'];
                $total += $lineTotal;
                $productDetails[] = ['product' => $product, 'quantity' => $item['quantity'], 'price' => $product->prix_unitaire];
            }

            // Wallet check
            $wallet = Wallet::where('user_id', $user->id)->first();
            if (!$wallet || $wallet->solde < $total) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Solde insuffisant. Votre solde: ' . ($wallet->solde ?? 0) . ' DH, Total commande: ' . $total . ' DH',
                    'solde_actuel' => $wallet->solde ?? 0,
                    'total_requis' => $total,
                ], 400);
            }

            // Debit wallet
            $wallet->decrement('solde', $total);
            WalletTransaction::create([
                'user_id' => $user->id,
                'type' => 'debit',
                'montant' => $total,
                'reference_commande' => 'PENDING',
                'description' => 'Débit commande',
                'statut' => 'completed',
            ]);

            // Create or find client
            $client = Client::firstOrCreate(
                ['user_id' => $user->id, 'phone' => $request->client_phone],
                [
                    'name' => $request->client_name,
                    'city' => $request->client_city,
                    'address' => $request->client_address,
                ]
            );

            // Generate lead number
            $nLead = 'ML-' . date('Ymd') . '-' . rand(1000, 9999);

            // Create lead
            $lead = Lead::create([
                'user_id' => $user->id,
                'client_id' => $client->id,
                'n_lead' => $nLead,
                'quantite_total' => array_sum(array_column($request->products, 'quantity')),
                'total' => $total,
                'statut_confirmation' => 'pending',
                'status_shipping' => 'pending',
                'notes' => $request->notes,
            ]);

            // Update transaction reference
            WalletTransaction::where('user_id', $user->id)
                ->where('reference_commande', 'PENDING')
                ->latest()
                ->first()
                ->update(['reference_commande' => $nLead]);

            // Create lead products
            foreach ($productDetails as $pd) {
                LeadProduct::create([
                    'lead_id' => $lead->id,
                    'product_id' => $pd['product']->id,
                    'quantity' => $pd['quantity'],
                    'price' => $pd['price'],
                ]);
            }

            // Trigger production & print tasks
            ProductionStatus::create(['lead_id' => $lead->id, 'statut' => 'pending']);
            PrintStatus::create(['lead_id' => $lead->id, 'statut' => 'pending']);
            ShippingStatus::create(['lead_id' => $lead->id, 'statut' => 'pending']);

            // Lead history
            LeadHistory::create([
                'lead_id' => $lead->id,
                'user_id' => $user->id,
                'status' => 'created',
                'note' => 'Commande créée et portefeuille débité',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Commande créée avec succès',
                'lead_id' => $lead->id,
                'n_lead' => $nLead,
                'total' => $total,
                'solde_restant' => $wallet->fresh()->solde,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Admin: all leads
    public function adminIndex(Request $request)
    {
        $query = Lead::with(['user','client','leadProducts.product','productionStatus','printStatus','shippingStatus']);
        if ($request->statut) $query->where('statut_confirmation', $request->statut);
        if ($request->user_id) $query->where('user_id', $request->user_id);
        if ($request->search) $query->where('n_lead', 'like', '%'.$request->search.'%');
        return response()->json(['success' => true, 'data' => $query->orderBy('created_at','desc')->paginate(25)]);
    }

    public function adminShow($id)
    {
        $lead = Lead::with([
            'user','client','leadProducts.product',
            'leadHistory.user','productionStatus','printStatus','shippingStatus'
        ])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $lead]);
    }

    // Update lead status
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['statut' => 'required|string']);
        $lead = Lead::findOrFail($id);
        $lead->update(['statut_confirmation' => $request->statut]);

        LeadHistory::create([
            'lead_id' => $lead->id,
            'user_id' => JWTAuth::parseToken()->authenticate()->id,
            'status' => $request->statut,
            'note' => $request->note ?? 'Statut mis à jour',
        ]);

        return response()->json(['success' => true, 'message' => 'Statut mis à jour']);
    }

    // Update production status
    public function updateProductionStatus(Request $request, $id)
    {
        $request->validate(['statut' => 'required|in:pending,in_production,completed,cancelled']);
        $ps = ProductionStatus::where('lead_id', $id)->firstOrFail();
        $ps->update(['statut' => $request->statut]);
        return response()->json(['success' => true]);
    }

    // Update print status
    public function updatePrintStatus(Request $request, $id)
    {
        $request->validate(['statut' => 'required|in:pending,in_printing,completed,cancelled']);
        $ps = PrintStatus::where('lead_id', $id)->firstOrFail();
        $ps->update(['statut' => $request->statut]);
        return response()->json(['success' => true]);
    }

    // Update shipping status
    public function updateShippingStatus(Request $request, $id)
    {
        $request->validate(['statut' => 'required|string']);
        $ss = ShippingStatus::where('lead_id', $id)->firstOrFail();
        $ss->update([
            'statut' => $request->statut,
            'tracking_number' => $request->tracking_number ?? $ss->tracking_number,
        ]);
        return response()->json(['success' => true]);
    }

    // Printer: ready to print
    public function printerQueue()
    {
        $leads = Lead::with(['user','client','leadProducts.product','printStatus'])
            ->whereHas('printStatus', fn($q) => $q->where('statut','pending')->orWhere('statut','in_printing'))
            ->orderBy('created_at','desc')
            ->paginate(25);
        return response()->json(['success' => true, 'data' => $leads]);
    }

    // Dashboard stats for MediaBuyer
    public function dashboardStats()
    {
        $user = $this->getUser();
        $wallet = Wallet::where('user_id', $user->id)->first();

        $totalLeads = Lead::where('user_id', $user->id)->count();
        $pendingLeads = Lead::where('user_id', $user->id)->where('statut_confirmation','pending')->count();
        $confirmedLeads = Lead::where('user_id', $user->id)->where('statut_confirmation','confirmed')->count();
        $revenue = Lead::where('user_id', $user->id)->sum('total');

        $recentLeads = Lead::with(['client','leadProducts.product'])
            ->where('user_id', $user->id)
            ->orderBy('created_at','desc')
            ->limit(5)
            ->get();

        // Monthly data for chart
        $monthly = Lead::where('user_id', $user->id)
            ->selectRaw('strftime("%Y-%m", created_at) as month, COUNT(*) as count, SUM(total) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();

        return response()->json([
            'success' => true,
            'solde' => $wallet->solde ?? 0,
            'total_leads' => $totalLeads,
            'pending_leads' => $pendingLeads,
            'confirmed_leads' => $confirmedLeads,
            'revenue' => $revenue,
            'recent_leads' => $recentLeads,
            'monthly_chart' => $monthly,
        ]);
    }

    // Admin dashboard stats
    public function adminDashboardStats()
    {
        $totalLeads = Lead::count();
        $todayLeads = Lead::whereDate('created_at', today())->count();
        $totalRevenue = Lead::sum('total');
        $totalMediabuyers = \App\Models\User::where('role','mediabuyer')->count();
        $pendingPrints = PrintStatus::where('statut','pending')->count();
        $inProduction = ProductionStatus::where('statut','in_production')->count();

        $topMediabuyers = \App\Models\User::where('role','mediabuyer')
            ->withCount('leads')
            ->withSum('leads','total')
            ->orderBy('leads_count','desc')
            ->limit(5)
            ->get();

        $recentLeads = Lead::with(['user','client'])
            ->orderBy('created_at','desc')
            ->limit(10)
            ->get();

        $monthly = Lead::selectRaw('strftime("%Y-%m", created_at) as month, COUNT(*) as count, SUM(total) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();

        return response()->json([
            'success' => true,
            'total_leads' => $totalLeads,
            'today_leads' => $todayLeads,
            'total_revenue' => $totalRevenue,
            'total_mediabuyers' => $totalMediabuyers,
            'pending_prints' => $pendingPrints,
            'in_production' => $inProduction,
            'top_mediabuyers' => $topMediabuyers,
            'recent_leads' => $recentLeads,
            'monthly_chart' => $monthly,
        ]);
    }
}
