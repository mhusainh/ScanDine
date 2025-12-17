import React from 'react';

const CartFloatingButton = ({ count, total, onClick }) => {
    return (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-40">
            <button 
                onClick={onClick}
                className="w-full bg-stone-900 text-white rounded-xl shadow-lg p-4 flex items-center justify-between hover:bg-stone-800 transition-colors"
            >
                <div className="flex items-center space-x-3">
                    <div className="bg-amber-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {count}
                    </div>
                    <span className="font-medium">View Cart</span>
                </div>
                <span className="font-bold">
                    Rp {total.toLocaleString('id-ID')}
                </span>
            </button>
        </div>
    );
};

export default CartFloatingButton;
