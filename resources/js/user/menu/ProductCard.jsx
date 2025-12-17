import React from 'react';
import { Plus } from 'lucide-react';

const ProductCard = ({ product, onAdd }) => {
    return (
        <div 
            onClick={() => onAdd(product)}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-stone-100 flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] transition-transform duration-100"
        >
            <div className="h-40 overflow-hidden relative bg-stone-200">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-stone-800 text-lg mb-1 leading-tight">{product.name}</h3>
                <p className="text-stone-500 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">{product.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="font-bold text-amber-900 text-lg">
                        Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <button 
                        className="bg-amber-100 text-amber-900 w-9 h-9 rounded-full flex items-center justify-center hover:bg-amber-200 transition-colors"
                    >
                        <Plus size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
