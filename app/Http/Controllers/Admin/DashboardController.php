<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display admin dashboard
     */
    public function index()
    {
        // Statistics
        $stats = [
            'today_orders' => Order::whereDate('created_at', today())->count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'today_revenue' => Order::whereDate('created_at', today())
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
            'active_tables' => Table::where('status', 'occupied')->count(),
        ];

        // Recent orders
        $recentOrders = Order::with(['table', 'payment'])
            ->latest()
            ->take(10)
            ->get();

        // Orders by status
        $ordersByStatus = Order::select('status', DB::raw('count(*) as total'))
            ->whereDate('created_at', today())
            ->groupBy('status')
            ->get();

        return view('admin.dashboard', compact('stats', 'recentOrders', 'ordersByStatus'));
    }
}
