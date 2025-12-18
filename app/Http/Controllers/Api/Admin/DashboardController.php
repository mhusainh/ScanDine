<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use App\Models\MenuItem;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display dashboard statistics
     */
    public function index()
    {
        // Today's orders
        $todayOrders = Order::whereDate('created_at', today())->count();
        $todayRevenue = Order::whereDate('created_at', today())
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        // This month's orders
        $monthOrders = Order::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $monthRevenue = Order::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        // Pending orders
        $pendingOrders = Order::whereIn('status', ['pending', 'confirmed', 'preparing'])
            ->count();

        // Tables status
        $availableTables = Table::where('status', 'available')->count();
        $occupiedTables = Table::where('status', 'occupied')->count();
        $totalTables = Table::count();

        // Recent orders
        $recentOrders = Order::with(['table', 'orderItems.menuItem'])
            ->latest()
            ->take(10)
            ->get();

        // Popular menu items
        $popularItems = DB::table('order_items')
            ->select('menu_item_id', DB::raw('SUM(quantity) as total_quantity'))
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('menu_item_id')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get();

        $popularMenuItems = MenuItem::whereIn('id', $popularItems->pluck('menu_item_id'))
            ->get()
            ->map(function($item) use ($popularItems) {
                $stat = $popularItems->firstWhere('menu_item_id', $item->id);
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'total_sold' => $stat->total_quantity ?? 0,
                    'image' => $item->url_file
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'today' => [
                    'orders' => $todayOrders,
                    'revenue' => $todayRevenue
                ],
                'month' => [
                    'orders' => $monthOrders,
                    'revenue' => $monthRevenue
                ],
                'pending_orders' => $pendingOrders,
                'tables' => [
                    'available' => $availableTables,
                    'occupied' => $occupiedTables,
                    'total' => $totalTables
                ],
                'recent_orders' => $recentOrders,
                'popular_menu_items' => $popularMenuItems
            ]
        ]);
    }
}
