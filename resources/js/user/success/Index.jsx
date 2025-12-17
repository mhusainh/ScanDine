import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

const SuccessPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle size={40} strokeWidth={3} />
                </div>
                
                <div>
                    <h1 className="text-2xl font-bold text-stone-800 mb-2">Order Confirmed!</h1>
                    <p className="text-stone-500">
                        Pesanan Anda telah diterima dan sedang disiapkan oleh dapur kami.
                    </p>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 text-left space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Order ID</span>
                        <span className="font-bold font-mono">#ORD-2025-001</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Est. Time</span>
                        <span className="font-bold">15-20 Mins</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Table</span>
                        <span className="font-bold">No. 5</span>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/menu')}
                    className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-stone-800"
                >
                    <Home size={18} />
                    <span>Back to Menu</span>
                </button>
            </div>
        </div>
    );
};

export default SuccessPage;
