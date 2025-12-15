<?php

namespace App\Http\Controllers;

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
                return response()->json(['message' => 'Callback handled successfully']);
            }

            return response()->json(['message' => 'Callback handling failed'], 400);

        } catch (\Exception $e) {
            Log::error('Payment callback error: ' . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    /**
     * Payment finish page
     */
    public function finish(Request $request)
    {
        $orderId = $request->query('order_id');
        
        return view('payment.finish', [
            'message' => 'Pembayaran berhasil! Terima kasih.',
            'order_id' => $orderId
        ]);
    }

    /**
     * Payment unfinish page
     */
    public function unfinish(Request $request)
    {
        return view('payment.unfinish', [
            'message' => 'Pembayaran belum selesai. Silakan selesaikan pembayaran Anda.'
        ]);
    }

    /**
     * Payment error page
     */
    public function error(Request $request)
    {
        return view('payment.error', [
            'message' => 'Terjadi kesalahan dalam proses pembayaran.'
        ]);
    }
}
