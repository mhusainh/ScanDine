import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Home, Menu as MenuIcon, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-coffee-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute transform rotate-45 bg-coffee-900 rounded-full"
                        style={{
                            width: Math.random() * 100 + 50 + 'px',
                            height: Math.random() * 100 + 50 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                        }}
                    />
                ))}
            </div>

            <div className="max-w-md w-full text-center relative z-10">
                {/* Animated Coffee Cup */}
                <div className="mb-8 relative inline-block">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-32 h-32 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <Coffee size={64} className="text-coffee-800" strokeWidth={1.5} />
                    </motion.div>
                    
                    {/* Steam Animation */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex space-x-2">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ 
                                    opacity: [0, 0.6, 0], 
                                    y: -20,
                                    x: Math.sin(i) * 5 
                                }}
                                transition={{ 
                                    duration: 2, 
                                    repeat: Infinity, 
                                    delay: i * 0.4,
                                    ease: "easeInOut"
                                }}
                                className="w-2 h-8 bg-coffee-300 rounded-full blur-sm"
                            />
                        ))}
                    </div>
                </div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <h1 className="text-6xl font-bold text-coffee-900 mb-2">404</h1>
                    <h2 className="text-2xl font-bold text-coffee-800 mb-4">Halaman Tidak Ditemukan</h2>
                    <p className="text-coffee-600 mb-8 px-4">
                        Oops! Sepertinya kopi yang Anda cari sudah habis atau halaman ini sedang istirahat.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3 px-8">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-coffee-900 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:bg-coffee-800 transition-colors flex items-center justify-center space-x-2"
                        >
                            <Home size={20} />
                            <span>Kembali ke Beranda</span>
                        </button>

                        <button
                            onClick={() => navigate('/menu')}
                            className="w-full bg-white text-coffee-900 border border-coffee-200 py-3 px-6 rounded-xl font-medium shadow-sm hover:bg-coffee-50 transition-colors flex items-center justify-center space-x-2"
                        >
                            <MenuIcon size={20} />
                            <span>Lihat Menu</span>
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="w-full text-coffee-600 py-2 rounded-xl font-medium hover:text-coffee-800 transition-colors flex items-center justify-center space-x-2 text-sm"
                        >
                            <ArrowLeft size={16} />
                            <span>Kembali ke halaman sebelumnya</span>
                        </button>
                    </div>
                </motion.div>
            </div>
            
            {/* Footer decoration */}
            <div className="absolute bottom-0 w-full text-center p-4 text-coffee-400 text-sm">
                ScanDine Coffee Shop
            </div>
        </div>
    );
};

export default NotFound;
