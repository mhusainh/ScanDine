<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemModifier;
use App\Models\Payment;
use App\Models\Table;
use App\Services\MidtransService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\Checkout\StoreCheckoutRequest;

class CheckoutController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Process checkout
     */
    public function store(StoreCheckoutRequest $request)
    {
        DB::beginTransaction();

        try {
            // Get table
            $table = Table::where('uuid', $request->table_uuid)->firstOrFail();

            // Calculate total
            $totalAmount = 0;
            foreach ($request->items as $item) {
                $itemTotal = $item['price'] * $item['quantity'];

                if (isset($item['modifiers'])) {
                    foreach ($item['modifiers'] as $modifier) {
                        $itemTotal += $modifier['price'] * $modifier['quantity'];
                    }
                }

                $totalAmount += $itemTotal;
            }

            // Create order
            $order = Order::create([
                'table_id' => $table->id,
                'order_number' => Order::generateOrderNumber(),
                'customer_name' => $request->customer_name,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
            ]);

            // Create order items
            foreach ($request->items as $item) {
                $subtotal = $item['price'] * $item['quantity'];

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $subtotal,
                    'notes' => $item['notes'] ?? null,
                ]);

                // Create order item modifiers
                if (isset($item['modifiers'])) {
                    foreach ($item['modifiers'] as $modifier) {
                        OrderItemModifier::create([
                            'order_item_id' => $orderItem->id,
                            'modifier_item_id' => $modifier['modifier_item_id'],
                            'price' => $modifier['price'],
                            'quantity' => $modifier['quantity'],
                        ]);

                        $subtotal += $modifier['price'] * $modifier['quantity'];
                    }

                    // Update order item subtotal
                    $orderItem->update(['subtotal' => $subtotal]);
                }
            }

            // Handle payment
            if ($request->payment_method == 'online') {
                // Create Midtrans transaction
                $snapToken = $this->midtransService->createTransaction($order);

                DB::commit();

                // Refresh order to get latest data with relations
                $order->refresh();

                return response()->json([
                    'success' => true,
                    'message' => 'Order berhasil dibuat',
                    'order' => $order->load(['payment', 'table', 'orderItems.menuItem', 'orderItems.orderItemModifiers.modifierItem']),
                    'snap_token' => $snapToken,
                ]);
            } else {
                // Cash payment
                Payment::create([
                    'order_id' => $order->id,
                    'amount' => $totalAmount,
                    'payment_method' => 'cash',
                    'payment_status' => 'pending',
                ]);

                DB::commit();

                // Refresh order to get latest data with relations
                $order->refresh();

                return response()->json([
                    'success' => true,
                    'message' => 'Order berhasil dibuat. Silakan bayar di kasir.',
                    'order' => $order->load(['payment', 'table', 'orderItems.menuItem', 'orderItems.orderItemModifiers.modifierItem']),
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show order status
     */
    public function show($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['table', 'orderItems.menuItem', 'orderItems.orderItemModifiers.modifierItem', 'payment'])
            ->firstOrFail();

        return view('checkout.success', compact('order'));
    }
}
