import React, { useState } from "react";
import Header from "../../components/shared/Header";
import CategoryNav from "../../components/ui/CategoryNav";
import MenuGrid from "../../components/ui/MenuGrid";
import CartFloatingButton from "../../components/ui/CartFloatingButton";
import CartDrawer from "../../components/ui/CartDrawer";
import ProductDetailDrawer from "../../components/ui/ProductDetailDrawer";
import { useCart } from "../../contexts/CartContext";
import { useMenu } from "../../hooks/useMenu";

const MenuPage = () => {
    const {
        table,
        categories,
        activeCategory,
        setActiveCategory,
        products,
        loading,
        error,
    } = useMenu();

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { cart, updateQuantity, getCartTotal, getCartCount } = useCart();

    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-coffee-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-coffee-800 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-coffee-800 font-medium">
                        Loading Menu...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-coffee-50">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-4">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Error
                    </h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-coffee-50 text-coffee-900 font-sans pb-24">
            <Header tableName={table?.name} />
            <CategoryNav
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />

            <main className="container mx-auto px-4 py-6">
                <MenuGrid products={products} onAdd={handleProductClick} />
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
