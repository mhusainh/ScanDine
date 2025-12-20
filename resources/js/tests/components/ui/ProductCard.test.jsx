import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../../../components/ui/ProductCard';

describe('ProductCard Component', () => {
    const mockOnAdd = vi.fn();
    
    const mockProduct = {
        id: 1,
        name: 'Es Teh Manis',
        description: 'Teh manis dingin segar',
        price: 5000,
        image: 'esteh.jpg'
    };

    it('should render product information correctly', () => {
        const { container } = render(
            <ProductCard 
                product={mockProduct} 
                onAdd={mockOnAdd} 
            />
        );
        
        expect(screen.getByText('Es Teh Manis')).toBeInTheDocument();
        expect(screen.getByText('Teh manis dingin segar')).toBeInTheDocument();
        expect(screen.getByText('Rp 5.000')).toBeInTheDocument(); // id-ID locale
        
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'esteh.jpg');
        expect(img).toHaveAttribute('alt', 'Es Teh Manis');
        
        expect(container).toMatchSnapshot();
    });

    it('should call onAdd when card is clicked', () => {
        render(
            <ProductCard 
                product={mockProduct} 
                onAdd={mockOnAdd} 
            />
        );
        
        const card = screen.getByTestId('product-card-1');
        fireEvent.click(card);
        
        expect(mockOnAdd).toHaveBeenCalledWith(mockProduct);
    });

    it('should call onAdd when plus button is clicked (propagation)', () => {
        render(
            <ProductCard 
                product={mockProduct} 
                onAdd={mockOnAdd} 
            />
        );
        
        // Find the plus button (it's a button element)
        const plusButton = screen.getByRole('button');
        fireEvent.click(plusButton);
        
        // Since the button is inside the card which has the onClick, 
        // clicking the button should bubble up and trigger the card's onClick.
        expect(mockOnAdd).toHaveBeenCalledWith(mockProduct);
    });
});
