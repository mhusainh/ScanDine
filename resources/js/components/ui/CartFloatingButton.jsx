import React from 'react';

const CartFloatingButton = ({ count, total, onClick }) => {
    return (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-40">
            <button 
                onClick={onClick}
                className="w-full bg-coffee-900 text-white rounded-xl shadow-xl p-4 flex items-center justify-between hover:bg-coffee-800 transition-all duration-300 transform active:scale-[0.98] border border-coffee-700"
            >
                <div className="flex items-center space-x-3">
                    <div className="bg-coffee-100 text-coffee-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                        {count}
                    </div>
                    <span className="font-medium tracking-wide">View Cart</span>
                </div>
                <span className="font-bold text-lg">
                    Rp {total.toLocaleString('id-ID')}
                </span>
            </button>
        </div>
    );
};

export default CartFloatingButton;
