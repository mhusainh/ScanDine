# Flowchart ScanDine System

## 1. Customer Order Flow (Main Flow)

```mermaid
flowchart TD
    A[Customer Datang] --> B[Scan QR Code Meja]
    B --> C{QR Valid?}
    C -->|Tidak| D[Error: Meja Tidak Valid]
    C -->|Ya| E[Load Menu Page dengan table_id]
    E --> F[Browse Menu & Categories]
    F --> G[Pilih Menu Item]
    G --> H{Punya Add-ons?}
    H -->|Ya| I[Pilih Add-ons/Modifiers]
    H -->|Tidak| J[Add to Cart LocalStorage]
    I --> J
    J --> K{Mau Pesan Lagi?}
    K -->|Ya| F
    K -->|Tidak| L[Review Cart]
    L --> M[Input Notes Optional]
    M --> N[Checkout]
    N --> O{Pilih Metode Bayar}
    O -->|Online| P[Request Snap Token ke Backend]
    O -->|Cash| Q[Submit Order ke Backend]
    P --> R[Backend Call Midtrans API]
    R --> S[Return Snap Token]
    S --> T[Tampilkan Midtrans Snap UI]
    T --> U{Customer Bayar?}
    U -->|Ya| V[Payment Success]
    U -->|Tidak| W[Payment Cancelled/Expired]
    V --> X[Midtrans Kirim Callback]
    X --> Y[Backend Update Payment Status]
    Y --> Z[Order Status: Confirmed]
    Q --> Z
    Z --> AA[Tampilkan Success Page]
    AA --> AB[Customer Tunggu Pesanan]
    W --> AC[Order Cancelled]
```

---

## 2. Backend Order Processing Flow

```mermaid
flowchart TD
    A[Receive Checkout Request] --> B[Validate Request Data]
    B --> C{Valid?}
    C -->|Tidak| D[Return Error 422]
    C -->|Ya| E[Start Database Transaction]
    E --> F[Generate Order Number]
    F --> G[Calculate Total Amount]
    G --> H[Insert to orders Table]
    H --> I[Loop Each Cart Item]
    I --> J[Insert to order_items Table]
    J --> K{Punya Modifiers?}
    K -->|Ya| L[Insert to order_item_modifiers Table]
    K -->|Tidak| M{Masih Ada Item?}
    L --> M
    M -->|Ya| I
    M -->|Tidak| N{Payment Method?}
    N -->|Online| O[Create Midtrans Transaction]
    O --> P[Get Snap Token]
    P --> Q[Insert to payments Table status=pending]
    Q --> R[Commit Transaction]
    R --> S[Return Order + Snap Token]
    N -->|Cash| T[Insert to payments Table status=pending]
    T --> U[Commit Transaction]
    U --> V[Return Order Data]
```

---

## 3. Midtrans Payment Callback Flow

```mermaid
flowchart TD
    A[Midtrans Send Notification] --> B[Receive POST to /webhook/midtrans]
    B --> C[Get Notification Data]
    C --> D[Verify Signature Key]
    D --> E{Valid Signature?}
    E -->|Tidak| F[Log Error & Return 401]
    E -->|Ya| G[Find Payment by transaction_id]
    G --> H{Payment Found?}
    H -->|Tidak| I[Log Error & Return 404]
    H -->|Ya| J{Check transaction_status}
    J -->|settlement/capture| K[Update payment_status = settlement]
    J -->|pending| L[Update payment_status = pending]
    J -->|expire| M[Update payment_status = expire]
    J -->|cancel| N[Update payment_status = cancel]
    J -->|deny| O[Update payment_status = deny]
    K --> P[Set paid_at = now]
    P --> Q[Update order.payment_status = paid]
    Q --> R[Update order.status = confirmed]
    R --> S[Save midtrans_response JSON]
    L --> T[Keep order.payment_status = unpaid]
    M --> U[Update order.status = cancelled]
    N --> U
    O --> U
    S --> V[Return 200 OK]
    T --> V
    U --> V
```

---

## 4. Admin Order Management Flow

```mermaid
flowchart TD
    A[Admin Login] --> B[Dashboard]
    B --> C[View Orders List]
    C --> D{Filter Status}
    D --> E[Click Order Detail]
    E --> F[View Order Items & Modifiers]
    F --> G{Order Status?}
    G -->|pending| H{Payment Status?}
    H -->|paid| I[Confirm Order Button]
    H -->|unpaid| J[Wait for Payment]
    I --> K[Update status = confirmed]
    K --> L[Notify Kitchen]
    G -->|confirmed| M[Start Preparing Button]
    M --> N[Update status = preparing]
    G -->|preparing| O[Mark as Served Button]
    O --> P[Update status = served]
    G -->|served| Q{Payment Status?}
    Q -->|unpaid & cash| R[Mark as Paid Button]
    R --> S[Update payment_status = paid]
    S --> T[Complete Order Button]
    Q -->|paid| T
    T --> U[Update status = completed]
    U --> V[Update completed_at = now]
    V --> W[Update table.status = available]
```

---

## 5. Menu Management Flow

```mermaid
flowchart TD
    A[Admin - Menu Management] --> B{Action?}
    B -->|Create| C[Form: Add New Menu]
    B -->|Edit| D[Form: Edit Menu]
    B -->|Delete| E[Confirm Delete]
    C --> F[Input: Name, Description, Price]
    F --> G[Select Category]
    G --> H[Upload Image]
    H --> I{Add Modifier Groups?}
    I -->|Ya| J[Select/Create Modifier Groups]
    J --> K[For Each Modifier Group]
    K --> L[Add/Edit Modifier Items]
    L --> M[Set Price per Modifier]
    M --> N{More Groups?}
    N -->|Ya| K
    N -->|Tidak| O[Set sort_order]
    I -->|Tidak| O
    O --> P[Save Menu Item]
    P --> Q[Insert to menu_items]
    Q --> R[Insert to menu_modifier_groups]
    R --> S[Success: Redirect to Menu List]
    D --> T[Load Existing Data]
    T --> F
    E --> U{Confirm?}
    U -->|Ya| V[Soft Delete or Hard Delete]
    U -->|Tidak| S
    V --> S
```

---

## 6. QR Code Generation Flow

```mermaid
flowchart TD
    A[Admin - Table Management] --> B[Create New Table]
    B --> C[Input Table Number]
    C --> D[Generate UUID]
    D --> E[Insert to tables Table]
    E --> F[Generate QR Code URL]
    F --> G[URL Format: /menu?table=uuid]
    G --> H[Generate QR Code Image]
    H --> I[Save/Display QR Code]
    I --> J[Print QR Code]
    J --> K[Pasang di Meja]
```

---

## 7. Cart Management Flow (Client-Side)

```mermaid
flowchart TD
    A[User di Menu Page] --> B[Click Add to Cart]
    B --> C[Get Current Cart from localStorage]
    C --> D{Cart Exists?}
    D -->|Tidak| E[Create New Cart Array]
    D -->|Ya| F[Parse Cart JSON]
    E --> G[Add Item to Cart]
    F --> G
    G --> H[Cart Item Structure]
    H --> I[Save to localStorage]
    I --> J[Update Cart Badge/Icon]
    J --> K{User Action?}
    K -->|View Cart| L[Read from localStorage]
    K -->|Update Qty| M[Update Item in Cart]
    K -->|Remove Item| N[Remove from Cart Array]
    K -->|Clear Cart| O[localStorage.removeItem]
    K -->|Checkout| P[Send Cart to Backend]
    M --> I
    N --> I
    P --> Q[Clear localStorage After Success]
```

---

## 8. Data Structure in Cart (localStorage)

```javascript
// Cart Structure Example
[
    {
        id: 1,
        menu_id: 5,
        name: "Nasi Ayam Katsu",
        price: 17000,
        quantity: 2,
        image_url: "...",
        notes: "Pedas ya",
        modifiers: [
            {
                modifier_group_id: 1,
                modifier_group_name: "Add On Topping",
                modifier_item_id: 3,
                modifier_item_name: "Bakso 3Pcs",
                price: 3000,
                quantity: 1,
            },
            {
                modifier_group_id: 2,
                modifier_group_name: "Pilihan Minuman",
                modifier_item_id: 8,
                modifier_item_name: "Es Teh Jumbo",
                price: 7000,
                quantity: 1,
            },
        ],
        subtotal: 44000, // (17000 * 2) + (3000 * 2) + (7000 * 2)
    },
];
```

---

## 9. Table Status Update Flow

```mermaid
flowchart TD
    A[Order Created] --> B[Check table_id]
    B --> C[Update tables.status = occupied]
    C --> D[Customer Order Active]
    D --> E{Order Status?}
    E -->|completed| F[Check Other Orders on Same Table]
    E -->|cancelled| F
    F --> G{Ada Order Lain?}
    G -->|Ya| H[Keep status = occupied]
    G -->|Tidak| I[Update tables.status = available]
```

---

## 10. Error Handling Flow

```mermaid
flowchart TD
    A[API Request] --> B{Validation}
    B -->|Fail| C[Return 422 Validation Error]
    B -->|Pass| D{Authentication Required?}
    D -->|Ya| E{Authenticated?}
    D -->|Tidak| F[Process Request]
    E -->|Tidak| G[Return 401 Unauthorized]
    E -->|Ya| F
    F --> H{Try Process}
    H -->|Error| I{Error Type?}
    H -->|Success| J[Return 200/201]
    I -->|Database| K[Rollback Transaction]
    I -->|External API| L[Log Error]
    I -->|Not Found| M[Return 404]
    K --> N[Return 500 Server Error]
    L --> N
```

---

**Last Updated:** December 13, 2025  
**Format:** Mermaid Flowchart (Support GitHub & Markdown Viewers)
