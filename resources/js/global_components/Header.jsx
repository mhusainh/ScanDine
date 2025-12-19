import React from 'react';

const Header = () => {
    return (
        <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-coffee-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 bg-coffee-800 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        ☕
                    </div>
                    <h1 className="text-xl font-bold text-coffee-900 tracking-tight">ScanDine Cafe</h1>
                </div>
                <div className="text-sm font-medium text-coffee-600 bg-coffee-50 px-3 py-1 rounded-full border border-coffee-200">
                    Table #5
                </div>
            </div>
        </header>
    );
};

export default Header;
