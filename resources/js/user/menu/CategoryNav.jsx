import React from 'react';

const CategoryNav = ({ categories, activeCategory, onSelectCategory }) => {
    return (
        <div className="sticky top-16 z-20 bg-stone-50 pt-4 pb-2 shadow-sm overflow-x-auto">
            <div className="flex space-x-4 px-4 min-w-max">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 
                            ${activeCategory === cat.id 
                                ? 'bg-amber-800 text-white shadow-md' 
                                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryNav;
