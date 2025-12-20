import React from 'react';

const CategoryNav = ({ categories, activeCategory, onSelectCategory }) => {
    return (
        <div className="sticky top-16 z-20 bg-coffee-50/95 backdrop-blur-sm pt-4 pb-2 shadow-sm overflow-x-auto border-b border-coffee-100">
            <div className="flex space-x-3 px-4 min-w-max pb-2">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 
                            ${activeCategory === cat.id 
                                ? 'bg-coffee-800 text-white shadow-lg shadow-coffee-800/20 scale-105' 
                                : 'bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-100 hover:border-coffee-300'
                            }`}
                        data-testid={`category-btn-${cat.id}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryNav;
