import React from 'react';

const Header = () => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-amber-800 rounded-full flex items-center justify-center text-white font-bold">
                        S
                    </div>
                    <h1 className="text-xl font-bold text-stone-800">ScanDine Cafe</h1>
                </div>
                <div className="text-sm text-stone-500">
                    Table #5
                </div>
            </div>
        </header>
    );
};

export default Header;
