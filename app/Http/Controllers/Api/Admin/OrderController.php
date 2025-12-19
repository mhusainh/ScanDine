<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
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
            if ($request->status === 'history') {
                $query->whereIn('status', ['served', 'completed', 'cancelled']);
            } else {
                $query->where('status', $request->status);
            }
        }

        // Filter by payment status
        if ($request->has('payment_status') && $request->payment_status != '') {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by date
        if ($request->has('date') && $request->date != '') {
            $query->whereDate('created_at', $request->date);
        }

        // Search by order number, customer name, table uuid, or menu name
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                // Search order number
                $q->where('order_number', 'ILIKE', '%' . $search . '%')
                    // Search customer name
                    ->orWhere('customer_name', 'ILIKE', '%' . $search . '%')
                    // Search table uuid or table number
                    ->orWhereHas('table', function ($tableQuery) use ($search) {
                        $tableQuery->where('uuid', 'ILIKE', '%' . $search . '%')
                            ->orWhere('table_number', 'ILIKE', '%' . $search . '%');
                    })
                    // Search menu item name
                    ->orWhereHas('orderItems.menuItem', function ($menuQuery) use ($search) {
                        $menuQuery->where('name', 'ILIKE', '%' . $search . '%');
                    });
            });
        }

        // Filter by total amount range (min and max)
        if ($request->has('min_total') && $request->min_total != '') {
            $query->where('total_amount', '>=', $request->min_total);
        }

        if ($request->has('max_total') && $request->max_total != '') {
            $query->where('total_amount', '<=', $request->max_total);
        }

        $perPage = $request->input('per_page', 20);
        $orders = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
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
        ])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,served,completed,cancelled'
        ]);

        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        $order->update(['status' => $request->status]);

        // If completed, set completed_at and table to available
        if ($request->status == 'completed') {
            $order->update(['completed_at' => now()]);

            // Check if table has other active orders
            $hasActiveOrders = $order->table->activeOrders()->where('id', '!=', $order->id)->exists();
            if (!$hasActiveOrders) {
                $order->table->update(['status' => 'available']);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Status order berhasil diupdate',
            'data' => $order->fresh(['table', 'payment'])
        ]);
    }

    /**
     * Confirm payment for cash orders
     */
    public function confirmPayment($id)
    {
        $order = Order::with(['payment', 'table'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

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

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran cash berhasil dikonfirmasi',
                'data' => $order->fresh(['payment', 'table'])
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Order ini tidak dapat dikonfirmasi pembayarannya'
        ], 400);
    }
}
