# 🍽️ ScanDine - QR Code Cafe Ordering System

ScanDine adalah sistem pemesanan cafe berbasis QR Code yang memungkinkan pelanggan untuk scan QR code di meja, melihat menu, menambahkan item ke keranjang (cart), dan melakukan pembayaran secara online atau tunai.

## 📋 Konsep Project

### Alur Pelanggan (Customer Flow)
1. **Scan QR Code** - Pelanggan scan QR code yang ada di meja cafe
2. **Lihat Menu** - Menampilkan daftar menu berdasarkan kategori
3. **Pilih Menu & Modifier** - Klik menu untuk melihat detail dan memilih topping/modifier (tingkat kepedasan, size, extra topping, dll)
4. **Add to Cart** - Item disimpan di localStorage (client-side, tidak ada database cart)
5. **Checkout** - Pilih metode pembayaran (Online via Midtrans atau Cash)
6. **Pembayaran** - Jika online, redirect ke Midtrans Snap. Jika cash, konfirmasi ke kasir
7. **Order Confirmed** - Status meja berubah jadi occupied, order masuk ke dashboard admin

### Alur Admin (Admin Flow)
1. **Dashboard** - Melihat statistik dan ringkasan pesanan
2. **Manage Orders** - Melihat dan update status order (pending → confirmed → preparing → served → completed)
3. **Manage Tables** - CRUD meja cafe & generate QR code untuk setiap meja
4. **Manage Menu** - CRUD kategori, menu items dengan upload gambar ke Cloudinary
5. **Manage Modifiers** - CRUD modifier groups dan modifier items (topping, size, dll)
6. **Payment Confirmation** - Konfirmasi pembayaran cash manual

## 🛠️ Tech Stack

- **Backend Framework**: Laravel 11.x
- **Database**: PostgreSQL (Online/Cloud Database)
- **Payment Gateway**: Midtrans Snap
- **Image Storage**: Cloudinary CDN
- **QR Code Generator**: SimpleSoftwareIO Simple QR Code
- **Frontend**: Blade Templates + JavaScript (Cart di localStorage)

## 📦 Requirements

Sebelum memulai, pastikan Anda sudah menginstall:

### 1. PHP 8.2 atau lebih tinggi
Download: [https://www.php.net/downloads](https://www.php.net/downloads)
- **Windows**: Download dari [windows.php.net](https://windows.php.net/download/)
- Pastikan extension berikut aktif di `php.ini`:
  ```ini
  extension=pdo_pgsql
  extension=pgsql
  extension=gd
  extension=curl
  extension=mbstring
  extension=openssl
  ```

### 2. Composer (PHP Dependency Manager)
Download: [https://getcomposer.org/download/](https://getcomposer.org/download/)
- **Windows**: Download `Composer-Setup.exe` dan install

Cek instalasi:
```bash
php --version
composer --version
```

### 3. PostgreSQL Online Database
**Rekomendasi Provider (Gratis):**
- [Neon.tech](https://neon.tech) - Free 0.5 GB
- [Supabase](https://supabase.com) - Free 500 MB
- [ElephantSQL](https://www.elephantsql.com) - Free 20 MB
- [Aiven](https://aiven.io) - Free Trial

Siapkan credentials:
- Host/Hostname
- Port (default: 5432)
- Database Name
- Username
- Password

### 4. Akun External Services

#### Midtrans Account (Payment Gateway)
1. Daftar di [https://dashboard.midtrans.com/register](https://dashboard.midtrans.com/register)
2. Login dan pilih mode **Sandbox** untuk testing
3. Catat credentials:
   - **Server Key** (Settings → Access Keys)
   - **Client Key** (Settings → Access Keys)

#### Cloudinary Account (Image Storage)
1. Daftar di [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Login ke Dashboard
3. Catat credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## 🚀 Installation Guide

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/ScanDine.git
cd ScanDine
```

### Step 2: Install Dependencies

```bash
composer install
```

### Step 3: Setup Environment

1. Copy file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

2. Generate application key:
```bash
php artisan key:generate
```

3. Edit file `.env` dan sesuaikan konfigurasi:

```env
APP_NAME=ScanDine
APP_ENV=local
APP_KEY=base64:... # sudah generate otomatis
APP_DEBUG=true
APP_URL=http://localhost:8000

# PostgreSQL Database Configuration
DB_CONNECTION=pgsql
DB_HOST=your-postgres-host.com
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

# Midtrans Configuration
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

### Step 4: Run Database Migration

```bash
php artisan migrate
```

Jika ingin reset database dan migrate ulang:
```bash
php artisan migrate:fresh
```

### Step 5: (Optional) Seed Database dengan Data Dummy

```bash
php artisan db:seed
```

### Step 6: Create Storage Link

```bash
php artisan storage:link
```

### Step 7: Run Development Server

```bash
php artisan serve
```

Akses aplikasi di browser: [http://localhost:8000](http://localhost:8000)

## 📱 Testing Payment (Sandbox Mode)

Gunakan credit card test dari Midtrans untuk testing pembayaran online:

- **Card Number**: 4811 1111 1111 1114
- **Exp Date**: 01/25 (atau bulan/tahun di masa depan)
- **CVV**: 123
- **OTP**: 112233

Lebih lengkap: [Midtrans Testing Payment](https://docs.midtrans.com/docs/testing-payment-on-sandbox)

## 🗂️ Project Structure

```
ScanDine/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/           # Admin Controllers
│   │   │   ├── AuthController.php
│   │   │   ├── CheckoutController.php
│   │   │   ├── MenuController.php
│   │   │   └── PaymentController.php
│   │   └── Requests/            # Form Request Validation
│   ├── Models/                  # Eloquent Models
│   └── Services/
│       └── MidtransService.php  # Payment Service
├── database/
│   └── migrations/              # Database Schema
├── resources/
│   └── views/                   # Blade Templates
├── routes/
│   ├── web.php                  # Web Routes
│   └── api.php                  # API Routes
├── .env.example                 # Environment Template
├── DATABASE_RELATIONS.md        # Database Documentation
├── FLOWCHART.md                 # System Flowcharts
└── README.md
```

## 🔐 Default Admin Credentials

Jika sudah run seeder, gunakan credentials berikut untuk login admin:

- **Email**: admin@scandine.com
- **Password**: password

## 📊 Database Schema

Project ini menggunakan 11 tabel utama:
- `restaurants` - Data cafe/restoran
- `tables` - Meja dengan QR code
- `categories` - Kategori menu
- `menu_items` - Item menu dengan gambar di Cloudinary
- `modifier_groups` - Group modifier (Tingkat Kepedasan, Size, dll)
- `modifier_items` - Item modifier (Tidak Pedas, Pedas, dll)
- `menu_modifier_groups` - Pivot table menu & modifier
- `orders` - Data pesanan
- `order_items` - Detail item pesanan
- `order_item_modifiers` - Modifier yang dipilih per item
- `payments` - Data pembayaran dengan Midtrans tracking

Detail lengkap: lihat [DATABASE_RELATIONS.md](DATABASE_RELATIONS.md)

## 🔄 System Flowcharts

Diagram lengkap alur sistem tersedia di [FLOWCHART.md](FLOWCHART.md):
- Customer Order Flow
- Backend Order Processing
- Midtrans Payment Callback
- Admin Order Management
- QR Code Generation Flow
- Cart Management Flow (localStorage)
- Table Status Update Flow
- Error Handling Flow

## 🐛 Troubleshooting

### Error: "could not find driver"
Install PHP PostgreSQL extension:
```bash
# Ubuntu/Debian
sudo apt-get install php8.2-pgsql

# Windows: Edit php.ini, uncomment:
extension=pdo_pgsql
extension=pgsql
```

### Error: "Class 'Cloudinary' not found"
Install Cloudinary package:
```bash
composer require cloudinary-labs/cloudinary-laravel
```

### Error: "SimpleSoftwareIO\QrCode not found"
Install QR Code package:
```bash
composer require simplesoftwareio/simple-qrcode
```

### Error: Midtrans "Access Denied"
Pastikan:
1. Server Key dan Client Key benar
2. `MIDTRANS_IS_PRODUCTION=false` untuk sandbox
3. IP whitelisting di Midtrans dashboard (Settings → Access Keys)

### Error: Database Connection Failed
Periksa:
1. Credentials PostgreSQL di `.env` benar
2. Database sudah dibuat
3. Firewall allow koneksi ke database
4. SSL mode jika required (`?sslmode=require` di DB_HOST)

## 📝 API Endpoints

### Customer Endpoints
- `GET /menu?table={uuid}` - List menu dengan kategori
- `GET /menu/{id}` - Detail menu item (JSON)
- `POST /checkout` - Process checkout dari cart

### Admin Endpoints (requires auth)
- `GET /admin/dashboard` - Dashboard statistik
- `GET /admin/orders` - List orders
- `POST /admin/orders/{id}/status` - Update order status
- `POST /admin/orders/{id}/confirm-payment` - Confirm cash payment
- CRUD `/admin/tables` - Manage tables & QR codes
- CRUD `/admin/categories` - Manage categories
- CRUD `/admin/menu-items` - Manage menu items
- CRUD `/admin/modifier-groups` - Manage modifier groups
- CRUD `/admin/modifier-items` - Manage modifier items

### Webhook
- `POST /payment/callback` - Midtrans payment notification

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 👨‍💻 Developer

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Laravel Framework
- Midtrans Payment Gateway
- Cloudinary CDN
- SimpleSoftwareIO QR Code Generator
- PostgreSQL Database

---

**Happy Coding! 🚀**

For questions or support, please open an issue or contact the developer.

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
