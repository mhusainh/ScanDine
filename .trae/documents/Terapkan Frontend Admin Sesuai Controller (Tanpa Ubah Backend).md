## Ringkasan Pemetaan Controller → Frontend

-   DashboardController: SUDAH diterapkan pada `resources/js/admin/dashboard/Index.jsx` via `GET /api/admin/dashboard`.
-   OrderController: SUDAH diterapkan pada `resources/js/admin/orders/Index.jsx` via `GET /api/admin/orders` dan `POST /api/admin/orders/:id/status`.
-   MenuItemController: SEBAGIAN diterapkan pada `resources/js/admin/menu/Index.jsx` (list, pagination, toggle availability, delete). BELUM: create/update/show detail dengan upload gambar & relasi modifier groups.
-   CategoryController: BELUM diterapkan (controller mengembalikan Blade view). Akan dibuat halaman React yang:
    -   Membaca daftar kategori dari field `categories` response `GET /api/admin/menu-items` (sudah tersedia).
    -   Aksi create/update/toggle/destroy dilakukan dengan form POST ke route Blade (tanpa mengubah controller), menggunakan `axios` + CSRF.
-   ModifierGroupController & ModifierItemController: BELUM diterapkan (Blade view). Akan dibuat halaman React yang:
    -   Menampilkan data berdasarkan `GET /api/admin/menu-items/:id` (memuat `modifierGroups.modifierItems`).
    -   Aksi CRUD dilakukan via POST ke route Blade menggunakan form data (tanpa mengubah controller).
-   TableController: BELUM diterapkan (Blade view + QR generator). Akan dibuat halaman React yang:
    -   Menyediakan tautan ke halaman Blade untuk index/create/edit.
    -   Menyediakan tombol untuk `downloadQrCode` dan `showQrCode` (dibuka di jendela/iframe baru).

## Struktur Frontend (Sesuai Permintaan)

-   `resources/js/admin/`
    -   `dashboard/Index.jsx` (SUDAH)
    -   `orders/Index.jsx` (SUDAH)
    -   `menu/Index.jsx` (SEBAGIAN, akan dilengkapi create/update/detail)
    -   `categories/Index.jsx` (BARU)
    -   `modifiers/groups/Index.jsx` (BARU)
    -   `modifiers/items/Index.jsx` (BARU)
    -   `tables/Index.jsx` (BARU)
-   `resources/js/user/` (SUDAH: `menu/`, `checkout/`, `success/`)
-   `resources/js/global_components/` (layout/header/admin layout)
-   Router: `resources/js/app.jsx` akan menambahkan rute admin untuk halaman baru tersebut.

## Implementasi Detail Per Halaman

### 1) Admin Menu (lengkapi CRUD JSON)

-   Tambah Form Modal untuk Create/Update menu item.
-   Upload gambar ke Cloudinary sesuai controller (field `image`).
-   Panggil endpoint:
    -   `POST /api/admin/menu-items` (create)
    -   `PUT /api/admin/menu-items/:id` (update)
    -   `GET /api/admin/menu-items/:id` (detail untuk menampilkan modifier groups)
-   Re-fetch list setelah operasi.

### 2) Admin Categories (menggunakan Blade routes, tanpa ubah controller)

-   List: konsumsi `GET /api/admin/menu-items` lalu tampilkan `categories`.
-   Create/Update/Toggle/Delete:
    -   Kirim form ke route Blade (misal: `/admin/categories`, `/admin/categories/:id`, `/admin/categories/:id/toggle-active`) menggunakan `axios` dengan `Content-Type: application/x-www-form-urlencoded` + `X-CSRF-TOKEN`.
    -   Deteksi sukses melalui status 2xx/redirect, lalu re-fetch list kategori.
-   Tambahkan tombol "Open Classic Admin" untuk membuka Blade UI jika diperlukan (fallback).

### 3) Admin Modifier Groups & Items (tanpa ubah controller)

-   Groups view: pilih menu item → tampilkan daftar `modifierGroups` dan masing-masing `modifierItems` dari `GET /api/admin/menu-items/:id`.
-   Aksi CRUD (create/edit/delete/toggle) dilakukan dengan POST ke route Blade yang sudah ada (`/admin/modifier-groups`, `/admin/modifier-items/...`).
-   Re-fetch detail menu item setelah operasi untuk menyegarkan tampilan React.

### 4) Admin Tables (tanpa ubah controller)

-   Index: tautan ke Blade view `/admin/tables` untuk create/edit.
-   Tambahkan aksi cepat:
    -   Download QR: panggil `GET /admin/tables/:id/download-qr-code` → unduh file PNG.
    -   Show QR: buka `GET /admin/tables/:id/show-qr-code` di modal/iframe.
-   Jika ingin daftar meja di React, konsumsi endpoint JSON (bila tersedia). Jika belum ada, tampilkan tombol menuju Blade view.

## Integrasi CSRF & Redirect

-   Pastikan `axios` dikonfigurasi:
    -   `axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'`
    -   `axios.defaults.withCredentials = true`
    -   Ambil token dari meta tag `csrf-token` di `welcome.blade.php` (akan dibaca saja, tanpa ubah controller) dan set ke header `X-CSRF-TOKEN`.
-   Untuk endpoint Blade yang merespon redirect, gunakan `axios` untuk POST lalu abaikan body; setelah sukses, lakukan re-fetch data untuk sinkron.

## Routing Tambahan di SPA

-   Tambah rute pada `/admin` untuk:
    -   `/admin/categories`
    -   `/admin/modifiers/groups`
    -   `/admin/modifiers/items`
    -   `/admin/tables`

## Validasi & Build

-   Jalankan build produksi dan verifikasi UI admin:
    -   Dashboard angka sesuai DB.
    -   Orders realtime update status.
    -   Menu CRUD lengkap (create/update/delete/toggle, detail).
    -   Categories tampil & toggle via Blade.
    -   Modifier groups/items tampil dari detail menu item; aksi CRUD via Blade.
    -   Tables link & QR berfungsi.

## Catatan

-   Tidak ada perubahan pada kode Controller; semua penyesuaian dilakukan di Frontend.
-   Untuk operasi yang belum menyediakan JSON, React akan berperan sebagai pengganti UI, sementara eksekusi tetap melalui route Blade dengan CSRF.

Silakan konfirmasi rencana ini. Setelah disetujui, saya akan langsung mengimplementasikan halaman baru, menambahkan router, form/modal, integrasi axios+CSRF, dan verifikasi end-to-end tanpa mengubah backend.
