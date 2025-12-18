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
}
