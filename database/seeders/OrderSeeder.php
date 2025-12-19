<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemModifier;
use App\Models\Payment;
use App\Models\Table;
use App\Models\MenuItem;
use App\Models\ModifierItem;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tables = Table::all();
        $menuItems = MenuItem::with('modifierGroups.modifierItems')->get();

        // Create 20 orders with various statuses
        $statuses = ['pending', 'processing', 'completed', 'cancelled'];
        $paymentStatuses = ['pending', 'paid', 'failed'];

        for ($i = 1; $i <= 20; $i++) {
            $table = $tables->random();
            $status = $statuses[array_rand($statuses)];
            $paymentStatus = $paymentStatuses[array_rand($paymentStatuses)];

            // Calculate realistic order times
            $createdAt = now()->subDays(rand(0, 30))->subHours(rand(0, 23));

            // Create order
            $order = Order::create([
                'table_id' => $table->id,
                'order_number' => 'ORD-' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'customer_name' => 'Customer ' . $i,
                'status' => $status === 'processing' ? 'preparing' : $status,
                'total_amount' => 0, // Will be calculated
                'payment_status' => $paymentStatus === 'paid' ? 'paid' : 'unpaid',
                'payment_method' => $paymentStatus === 'paid' ? 'online' : null,
                'notes' => rand(0, 1) ? 'Pedas sedang, tidak pakai MSG' : null,
                'completed_at' => $status === 'completed' ? $createdAt->addHours(1) : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Add 1-5 items to order
            $itemCount = rand(1, 5);
            $subtotal = 0;

            for ($j = 0; $j < $itemCount; $j++) {
                $menuItem = $menuItems->random();
                $quantity = rand(1, 3);
                $itemPrice = $menuItem->price * $quantity;

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $quantity,
                    'price' => $menuItem->price,
                    'subtotal' => $itemPrice,
                    'notes' => rand(0, 1) ? 'Tanpa es' : null,
                ]);

                // Add 0-2 modifiers per item
                $modifierCount = rand(0, 2);
                $modifierTotal = 0;

                if ($menuItem->modifierGroups->count() > 0) {
                    for ($k = 0; $k < $modifierCount; $k++) {
                        $modifierGroup = $menuItem->modifierGroups->random();
                        if ($modifierGroup->modifierItems->count() > 0) {
                            $modifierItem = $modifierGroup->modifierItems->random();

                            OrderItemModifier::create([
                                'order_item_id' => $orderItem->id,
                                'modifier_item_id' => $modifierItem->id,
                                'price' => $modifierItem->price,
                            ]);

                            $modifierTotal += $modifierItem->price;
                        }
                    }
                }

                // Update order item subtotal with modifiers
                $orderItem->update([
                    'subtotal' => ($menuItem->price + $modifierTotal) * $quantity
                ]);

                $subtotal += $orderItem->subtotal;
            }

            // Calculate tax (10%)
            $tax = $subtotal * 0.1;
            $total = $subtotal + $tax;

            // Update order total
            $order->update([
                'total_amount' => $total,
            ]);

            // Create payment
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => 'online',
                'amount' => $total,
                'payment_status' => $paymentStatus === 'paid' ? 'settlement' : ($paymentStatus === 'failed' ? 'failed' : 'pending'),
                'transaction_id' => 'TRX-' . strtoupper(uniqid()),
                'payment_type' => ['gopay', 'shopeepay', 'bca_va', 'qris'][array_rand(['gopay', 'shopeepay', 'bca_va', 'qris'])],
                'transaction_status' => $paymentStatus === 'paid' ? 'settlement' : ($paymentStatus === 'failed' ? 'failed' : 'pending'),
                'paid_at' => $paymentStatus === 'paid' ? $createdAt->addMinutes(rand(5, 30)) : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        $this->command->info('Created 20 orders with items, modifiers, and payments');
    }
}
