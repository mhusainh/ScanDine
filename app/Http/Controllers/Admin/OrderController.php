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

        // Filter by status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->has('payment_status') && $request->payment_status != '') {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by date
        if ($request->has('date') && $request->date != '') {
            $query->whereDate('created_at', $request->date);
        }

        $orders = $query->latest()->paginate(20);

        return view('admin.orders.index', compact('orders'));
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

        return view('admin.orders.show', compact('order'));
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,served,completed,cancelled'
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

        return back()->with('success', 'Status order berhasil diupdate.');
    }

    /**
     * Confirm payment for cash orders
     */
    public function confirmPayment($id)
    {
        $order = Order::with('payment')->findOrFail($id);

        if ($order->payment_method == 'cash' && $order->payment_status == 'unpaid') {
            $order->update([
                'payment_status' => 'paid',
                'status' => 'confirmed'
            ]);

            $order->payment->update([
                'payment_status' => 'settlement',
                'paid_at' => now()
            ]);

            // Update table status to occupied if not already
            if ($order->table->status !== 'occupied') {
                $order->table->update(['status' => 'occupied']);
            }

            return back()->with('success', 'Pembayaran cash berhasil dikonfirmasi.');
        }

        return back()->with('error', 'Order ini tidak dapat dikonfirmasi pembayarannya.');
    }
}
