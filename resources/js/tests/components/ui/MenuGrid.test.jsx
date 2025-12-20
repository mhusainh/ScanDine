import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuGrid from '../../../components/ui/MenuGrid';

// Mock ProductCard to simplify MenuGrid test
vi.mock('../../../components/ui/ProductCard', () => ({
    default: ({ product, onAdd }) => (
        <div data-testid={`product-${product.id}`} onClick={() => onAdd(product)}>
            {product.name}
        </div>
    )
}));

describe('MenuGrid Component', () => {
    const mockOnAdd = vi.fn();
    const mockProducts = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
        { id: 3, name: 'Product 3' }
    ];

    it('should render correct number of products', () => {
        const { container } = render(
            <MenuGrid 
                products={mockProducts} 
                onAdd={mockOnAdd} 
            />
        );
        
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText('Product 3')).toBeInTheDocument();
        
        expect(container).toMatchSnapshot();
    });

    it('should pass onAdd to ProductCard', () => {
        render(
            <MenuGrid 
                products={mockProducts} 
                onAdd={mockOnAdd} 
            />
        );
        
        const product = screen.getByTestId('product-1');
        fireEvent.click(product);
        
        expect(mockOnAdd).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('should render empty grid when no products', () => {
        const { container } = render(
            <MenuGrid 
                products={[]} 
                onAdd={mockOnAdd} 
            />
        );
        
        expect(container.firstChild).toBeEmptyDOMElement();
        // Or check if it has the grid class but no children
        expect(container.firstChild).toHaveClass('grid');
    });
});
