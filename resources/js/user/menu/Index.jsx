import React, { useState } from "react";
import Header from "../../global_components/Header";
import CategoryNav from "./CategoryNav";
import MenuGrid from "./MenuGrid";
import CartFloatingButton from "./CartFloatingButton";
import CartDrawer from "./CartDrawer";
import ProductDetailDrawer from "./ProductDetailDrawer";
import { useCart } from "../../context/CartContext";

// Dummy Data (In real app, fetch from API)
const DUMMY_CATEGORIES = [
    { id: 1, name: "Coffee", active: true },
    { id: 2, name: "Non-Coffee", active: false },
    { id: 3, name: "Snacks", active: false },
    { id: 4, name: "Main Course", active: false },
    { id: 5, name: "Desserts", active: false },
];

const DUMMY_PRODUCTS = [
    {
        id: 1,
        category_id: 1,
        name: "Caffe Latte",
        description: "Espresso with steamed milk",
        price: 25000,
        image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1937&auto=format&fit=crop",
    },
    {
        id: 2,
        category_id: 1,
        name: "Americano",
        description: "Espresso with hot water",
        price: 20000,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1887&auto=format&fit=crop",
    },
    {
        id: 3,
        category_id: 1,
        name: "Cappuccino",
        description: "Espresso, steamed milk, and foam",
        price: 28000,
        image: "https://images.unsplash.com/photo-1534778181155-3343a85903b7?q=80&w=1887&auto=format&fit=crop",
    },
    {
        id: 4,
        category_id: 3,
        name: "French Fries",
        description: "Crispy fried potatoes",
        price: 18000,
        image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=1925&auto=format&fit=crop",
    },
    {
        id: 5,
        category_id: 3,
        name: "Nachos",
        description: "Tortilla chips with cheese sauce",
        price: 22000,
        image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=1935&auto=format&fit=crop",
    },
];

const MenuPage = () => {
    const [activeCategory, setActiveCategory] = useState(1);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { cart, updateQuantity, getCartTotal, getCartCount } = useCart();

    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };

    return (
        <div className="min-h-screen bg-coffee-50 text-coffee-900 font-sans pb-24">
            <Header />
            <CategoryNav
                categories={DUMMY_CATEGORIES}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />

            <main className="container mx-auto px-4 py-6">
                <MenuGrid
                    products={DUMMY_PRODUCTS.filter(
                        (p) => p.category_id === activeCategory
                    )}
                    onAdd={handleProductClick} // Clicking now opens detail drawer
                />
            </main>

            {getCartCount() > 0 && (
                <CartFloatingButton
                    count={getCartCount()}
                    total={getCartTotal()}
                    onClick={() => setIsCartOpen(true)}
                />
            )}

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                updateQuantity={updateQuantity}
                total={getCartTotal()}
            />

            <ProductDetailDrawer
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                product={selectedProduct}
            />
        </div>
    );
};

export default MenuPage;
