# Dokumentasi Sistem Notifikasi (Toast)

Sistem notifikasi ini dirancang untuk menggantikan `alert()` native browser dengan tampilan yang konsisten dengan desain coffee shop, responsif, dan mudah digunakan.

## Fitur

-   **4 Tipe Notifikasi**: Success, Error, Warning, Info.
-   **Auto-close**: Notifikasi otomatis menghilang setelah durasi tertentu (default 5 detik).
-   **Stacking**: Menampilkan multiple notifikasi secara bertumpuk.
-   **Responsif**: Tampilan menyesuaikan perangkat mobile dan desktop.
-   **Desain Kustom**: Menggunakan tema warna coffee shop.

## Cara Penggunaan

### 1. Import Hook

Import `useToast` dari context di dalam komponen Anda.

```javascript
import { useToast } from "../../contexts/ToastContext";
```

### 2. Gunakan Hook

Destructure fungsi yang dibutuhkan dari hook.

```javascript
const MyComponent = () => {
    const { success, error, warning, info, addToast } = useToast();

    // ...
};
```

### 3. Tampilkan Notifikasi

#### Shortcut Functions (Recommended)

Cara termudah untuk menampilkan notifikasi standar.

```javascript
// Success
success("Data berhasil disimpan", "Berhasil");

// Error
error("Gagal menyimpan data", "Error");

// Warning
warning("Mohon lengkapi data", "Perhatian");

// Info
info("Ada pembaruan sistem", "Info");
```

Parameter: `(message, title)`

-   `message` (required): Pesan utama notifikasi.
-   `title` (optional): Judul notifikasi.

#### Advanced Usage (Custom Duration/Type)

Jika Anda butuh kontrol lebih, gunakan `addToast`.

```javascript
addToast({
    type: "success", // success, error, warning, info
    title: "Custom Title",
    message: "Custom message with long duration",
    duration: 10000, // 10 detik
});
```

## Contoh Implementasi (Refactoring `alert`)

**Sebelum:**

```javascript
try {
    await saveData();
} catch (err) {
    alert("Gagal menyimpan data");
}
```

**Sesudah:**

```javascript
const { error, success } = useToast();

try {
    await saveData();
    success("Data berhasil disimpan");
} catch (err) {
    error("Gagal menyimpan data");
}
```

## Best Practices

1.  Gunakan `success` untuk konfirmasi aksi positif (simpan, update, hapus).
2.  Gunakan `error` untuk kegagalan API atau error sistem.
3.  Gunakan `warning` untuk validasi form atau input user yang salah.
4.  Hindari menggunakan `alert()` native browser.
