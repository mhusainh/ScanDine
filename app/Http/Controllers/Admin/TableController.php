<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Http\Requests\Admin\Table\StoreTableRequest;
use App\Http\Requests\Admin\Table\UpdateTableRequest;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TableController extends Controller
{
    /**
     * Display all tables
     */
    public function index()
    {
        $tables = Table::withCount('activeOrders')->paginate(20);
        return view('admin.tables.index', compact('tables'));
    }

    /**
     * Show create form
     */
    public function create()
    {
        return view('admin.tables.create');
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

        return redirect()->route('admin.tables.index')
            ->with('success', 'Meja berhasil ditambahkan.');
    }

    /**
     * Show edit form
     */
    public function edit($id)
    {
        $table = Table::findOrFail($id);
        return view('admin.tables.edit', compact('table'));
    }

    /**
     * Update table
     */
    public function update(UpdateTableRequest $request, $id)
    {
        $table = Table::findOrFail($id);

        $table->update($request->only('table_number', 'status'));

        return redirect()->route('admin.tables.index')
            ->with('success', 'Meja berhasil diupdate.');
    }

    /**
     * Delete table
     */
    public function destroy($id)
    {
        $table = Table::findOrFail($id);

        // Check if table has active orders
        if ($table->activeOrders()->exists()) {
            return back()->with('error', 'Meja tidak dapat dihapus karena masih ada pesanan aktif.');
        }

        $table->delete();

        return redirect()->route('admin.tables.index')
            ->with('success', 'Meja berhasil dihapus.');
    }

    /**
     * Generate and download QR code
     */
    public function downloadQrCode($id)
    {
        $table = Table::findOrFail($id);

        $url = route('menu.index', ['table' => $table->uuid]);

        $qrCode = QrCode::size(300)
            ->format('png')
            ->generate($url);

        return response($qrCode)
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', 'attachment; filename="qr-table-' . $table->table_number . '.png"');
    }

    /**
     * Show QR code
     */
    public function showQrCode($id)
    {
        $table = Table::findOrFail($id);
        return view('admin.tables.qrcode', compact('table'));
    }
}
