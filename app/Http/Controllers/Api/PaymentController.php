<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Handle Midtrans notification callback
     */
    public function callback(Request $request)
    {
        try {
            $notification = $request->all();

            Log::info('Midtrans callback received', $notification);

            // Convert array to object
            $notification = json_decode(json_encode($notification));

            $result = $this->midtransService->handleCallback($notification);

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Callback handled successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Callback handling failed'
            ], 400);
        } catch (\Exception $e) {
            Log::error('Payment callback error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Handle payment finish redirect from Midtrans
     */
    public function finish(Request $request)
    {
        $orderId = $request->query('order_id');
        $transactionStatus = $request->query('transaction_status');

        Log::info('Payment finish redirect', [
            'order_id' => $orderId,
            'transaction_status' => $transactionStatus
        ]);

        // Redirect ke frontend dengan status
        return redirect(config('app.frontend_url', config('app.url')) . '/payment/success?order_id=' . $orderId);
    }

    /**
     * Handle payment unfinish redirect from Midtrans
     */
    public function unfinish(Request $request)
    {
        $orderId = $request->query('order_id');

        Log::info('Payment unfinish redirect', ['order_id' => $orderId]);

        // Redirect ke frontend dengan status pending
        return redirect(config('app.frontend_url', config('app.url')) . '/payment/pending?order_id=' . $orderId);
    }

    /**
     * Handle payment error redirect from Midtrans
     */
    public function error(Request $request)
    {
        $orderId = $request->query('order_id');

        Log::error('Payment error redirect', ['order_id' => $orderId]);

        // Redirect ke frontend dengan status error
        return redirect(config('app.frontend_url', config('app.url')) . '/payment/error?order_id=' . $orderId);
    }
}
