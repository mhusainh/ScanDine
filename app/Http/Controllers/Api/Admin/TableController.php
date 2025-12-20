<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Http\Requests\Admin\Table\StoreTableRequest;
use App\Http\Requests\Admin\Table\UpdateTableRequest;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Http\Request;

class TableController extends Controller
{
    /**
     * Public list of tables with UUID (for testing)
     */
    public function publicList()
    {
        $tables = Table::select('id', 'table_number', 'uuid', 'status')
            ->orderBy('table_number')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tables
        ]);
    }

    /**
     * Display all tables
     */
    public function index(Request $request)
    {
        $query = Table::query();

        // Filter by status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        // Search by table number
        if ($request->has('search') && $request->search != '') {
            $query->where('table_number', 'like', '%' . $request->search . '%');
        }

        $tables = $query->orderBy('table_number')->get();

        return response()->json([
            'success' => true,
            'data' => $tables
        ]);
    }

    /**
     * Store new table
     */
    public function store(StoreTableRequest $request)
    {
        $table = Table::create([
            'table_number' => $request->table_number,
            'status' => 'available',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Meja berhasil ditambahkan',
            'data' => $table
        ], 201);
    }

    /**
     * Show table detail
     */
    public function show($id)
    {
        $table = Table::with(['orders' => function ($query) {
            $query->whereIn('status', ['pending', 'confirmed', 'preparing', 'served'])
                ->latest();
        }])->find($id);

        if (!$table) {
            return response()->json([
                'success' => false,
                'message' => 'Meja tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $table
        ]);
    }

    /**
     * Update table
     */
    public function update(UpdateTableRequest $request, $id)
    {
        $table = Table::find($id);

        if (!$table) {
            return response()->json([
                'success' => false,
                'message' => 'Meja tidak ditemukan'
            ], 404);
        }

        $table->update($request->only('table_number', 'status'));

        return response()->json([
            'success' => true,
            'message' => 'Meja berhasil diupdate',
            'data' => $table
        ]);
    }

    /**
     * Delete table
     */
    public function destroy($id)
    {
        $table = Table::find($id);

        if (!$table) {
            return response()->json([
                'success' => false,
                'message' => 'Meja tidak ditemukan'
            ], 404);
        }

        // Check if table has active orders
        if ($table->activeOrders()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Meja tidak dapat dihapus karena masih ada pesanan aktif'
            ], 400);
        }

        $table->delete();

        return response()->json([
            'success' => true,
            'message' => 'Meja berhasil dihapus'
        ]);
    }

    /**
     * Generate QR Code for table
     */
    public function generateQrCode($id)
    {
        $table = Table::find($id);

        if (!$table) {
            return response()->json([
                'success' => false,
                'message' => 'Meja tidak ditemukan'
            ], 404);
        }

        // Generate menu URL with table UUID
        $menuUrl = url('/menu/' . $table->uuid);

        // Generate QR Code as base64
        $qrCode = base64_encode(QrCode::format('png')->size(300)->generate($menuUrl));

        return response()->json([
            'success' => true,
            'data' => [
                'table_number' => $table->table_number,
                'uuid' => $table->uuid,
                'menu_url' => $menuUrl,
                'qr_code' => 'data:image/png;base64,' . $qrCode
            ]
        ]);
    }

    /**
     * Download QR Code
     */
    public function downloadQrCode($id)
    {
        $table = Table::find($id);

        if (!$table) {
            return response()->json([
                'success' => false,
                'message' => 'Meja tidak ditemukan'
            ], 404);
        }

        $menuUrl = url('/menu/' . $table->uuid);
        $qrCode = QrCode::format('png')->size(300)->generate($menuUrl);

        return response($qrCode, 200)
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', 'attachment; filename="table-' . $table->table_number . '-qr.png"');
    }
}
