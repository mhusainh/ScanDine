<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display all orders
     */
    public function index(Request $request)
    {
        $query = Order::with(['table', 'orderItems.menuItem', 'payment']);

        // Filter by status (default: show active orders for KDS)
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        } else {
            // Default KDS view: pending, cooking, ready
            $query->whereIn('status', ['pending', 'cooking', 'ready', 'confirmed']);
        }

        $orders = $query->orderBy('created_at', 'asc')->get();

        // Transform for frontend if needed, but standard JSON is usually fine
        return response()->json($orders);
    }

    /**
     * Show order detail
     */
    public function show($id)
    {
        $order = Order::with([
            'table',
            'orderItems.menuItem',
            'orderItems.orderItemModifiers.modifierItem',
            'payment'
        ])->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,cooking,ready,served,completed,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        // If completed, set completed_at and table to available
        if ($request->status == 'completed') {
            $order->update(['completed_at' => now()]);
            
            // Check if table has other active orders
            $hasActiveOrders = $order->table->activeOrders()->exists();
            if (!$hasActiveOrders) {
                $order->table->update(['status' => 'available']);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Status updated',
            'order' => $order
        ]);
    }
}
