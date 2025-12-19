<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display admin dashboard
     */
    public function index()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // Today's Stats
        $todayOrders = Order::whereDate('created_at', $today)->count();
        $todayRevenue = Order::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->sum('total_amount');
        
        // Yesterday's Stats (for trends)
        $yesterdayOrders = Order::whereDate('created_at', $yesterday)->count();
        $yesterdayRevenue = Order::whereDate('created_at', $yesterday)
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        // Calculate Trends (Percentage Change)
        $ordersTrend = $this->calculateTrend($todayOrders, $yesterdayOrders);
        $revenueTrend = $this->calculateTrend($todayRevenue, $yesterdayRevenue);

        $stats = [
            'today_orders' => $todayOrders,
            'orders_trend' => $ordersTrend,
            'pending_orders' => Order::where('status', 'pending')->count(),
            'today_revenue' => $todayRevenue,
            'revenue_trend' => $revenueTrend,
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

        return response()->json(compact('stats', 'recentOrders', 'ordersByStatus'));
    }

    private function calculateTrend($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0; // 100% increase if started from 0, else 0%
        }
        
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
