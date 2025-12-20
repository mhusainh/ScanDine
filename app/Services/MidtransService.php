<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Create Midtrans transaction and get Snap Token
     */
    public function createTransaction(Order $order)
    {
        $transactionId = 'SCANDINE-' . $order->order_number . '-' . time();

        // Prepare item details dari order items
        $itemDetails = [];
        foreach ($order->orderItems as $orderItem) {
            $itemDetails[] = [
                'id' => $orderItem->menu_item_id,
                'price' => (int) $orderItem->price,
                'quantity' => $orderItem->quantity,
                'name' => $orderItem->menuItem->name ?? 'Menu Item',
            ];

            // Tambahkan modifiers sebagai item terpisah
            foreach ($orderItem->orderItemModifiers as $modifier) {
                $itemDetails[] = [
                    'id' => 'MOD-' . $modifier->modifier_item_id,
                    'price' => (int) $modifier->price,
                    'quantity' => $modifier->quantity,
                    'name' => '+ ' . ($modifier->modifierItem->name ?? 'Add-on'),
                ];
            }
        }

        $params = [
            'transaction_details' => [
                'order_id' => $transactionId,
                'gross_amount' => (int) $order->total_amount,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name ?? 'Customer',
                'email' => config('app.default_email', 'customer@scandine.com'),
                'phone' => '0812345678',
            ],
            'item_details' => $itemDetails,
            'enabled_payments' => [
                'gopay', 'shopeepay', 'other_qris',
                'bca_va', 'bni_va', 'bri_va', 'permata_va',
                'other_va', 'alfamart', 'indomaret'
            ],
            'custom_field1' => $order->order_number,
            'custom_field2' => 'ScanDine-Order',
            'custom_field3' => $order->table->table_number ?? '',
        ];

        try {
            $snapToken = Snap::getSnapToken($params);

            // Create atau update payment
            Payment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'amount' => $order->total_amount,
                    'payment_method' => 'online',
                    'payment_status' => 'pending',
                    'transaction_id' => $transactionId,
                ]
            );

            return $snapToken;

        } catch (\Exception $e) {
            Log::error('Midtrans error: ' . $e->getMessage());
            throw new \Exception('Gagal membuat transaksi pembayaran: ' . $e->getMessage());
        }
    }

    /**
     * Handle callback notification from Midtrans
     */
    public function handleCallback($notification)
    {
        try {
            $transactionId = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status ?? '';
            $paymentType = $notification->payment_type ?? '';

            // Verify signature key
            $signatureKey = hash('sha512', 
                $notification->order_id . 
                $notification->status_code . 
                $notification->gross_amount . 
                Config::$serverKey
            );

            if ($signatureKey !== $notification->signature_key) {
                Log::error('Invalid signature key for transaction: ' . $transactionId);
                return false;
            }

            // Cari payment berdasarkan transaction ID
            $payment = Payment::where('transaction_id', $transactionId)->first();

            if (!$payment) {
                Log::warning('Payment not found for transaction ID: ' . $transactionId);
                return false;
            }

            // Update payment dengan response dari Midtrans
            $payment->update([
                'payment_type' => $paymentType,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
                'signature_key' => $notification->signature_key,
                'midtrans_response' => json_decode(json_encode($notification), true),
            ]);

            // Handle status berdasarkan transaction_status
            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'challenge') {
                    $payment->update(['payment_status' => 'pending']);
                } else if ($fraudStatus == 'accept') {
                    $this->confirmPayment($payment);
                }
            } else if ($transactionStatus == 'settlement') {
                $this->confirmPayment($payment);
            } else if ($transactionStatus == 'pending') {
                $payment->update(['payment_status' => 'pending']);
            } else if (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
                $this->failPayment($payment, $transactionStatus);
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Midtrans callback error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Confirm payment success
     */
    private function confirmPayment(Payment $payment)
    {
        $payment->update([
            'payment_status' => 'settlement',
            'paid_at' => now(),
        ]);

        // Update order status
        $payment->order->update([
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        // Update table status to occupied
        $payment->order->table->update([
            'status' => 'occupied',
        ]);

        Log::info('Payment confirmed for order: ' . $payment->order->order_number);

        // TODO: Send notification to admin/kitchen
        // TODO: Send WhatsApp notification to customer (optional)
    }

    /**
     * Handle failed payment
     */
    private function failPayment(Payment $payment, $status)
    {
        $payment->update([
            'payment_status' => $status, // expire, cancel, deny
        ]);

        // Update order status
        $payment->order->update([
            'status' => 'cancelled',
        ]);

        Log::info('Payment failed for order: ' . $payment->order->order_number . ' | Status: ' . $status);
    }

    /**
     * Check transaction status manually
     */
    public function checkTransactionStatus($transactionId)
    {
        try {
            $status = Transaction::status($transactionId);
            return $status;
        } catch (\Exception $e) {
            Log::error('Error checking transaction status: ' . $e->getMessage());
            return null;
        }
    }
}
