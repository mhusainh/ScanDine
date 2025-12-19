import React from 'react';
import { Plus } from 'lucide-react';

const ProductCard = ({ product, onAdd }) => {
    return (
        <div 
            onClick={() => onAdd(product)}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-coffee-100 flex flex-col h-full cursor-pointer hover:shadow-lg hover:border-coffee-200 transition-all duration-300 active:scale-[0.98] group"
        >
            <div className="h-44 overflow-hidden relative bg-coffee-100">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-coffee-900 text-lg mb-1 leading-tight group-hover:text-coffee-700 transition-colors">{product.name}</h3>
                <p className="text-coffee-500 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">{product.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-coffee-50">
                    <span className="font-bold text-coffee-800 text-lg">
                        Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <button 
                        className="bg-coffee-100 text-coffee-800 w-10 h-10 rounded-full flex items-center justify-center hover:bg-coffee-800 hover:text-white transition-all duration-300 shadow-sm"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
