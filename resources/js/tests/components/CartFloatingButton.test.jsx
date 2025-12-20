import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CartFloatingButton from '../../components/ui/CartFloatingButton';

describe('CartFloatingButton', () => {
    it('renders correctly with count and total', () => {
        render(<CartFloatingButton count={3} total={150000} onClick={() => {}} />);
        
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('View Cart')).toBeInTheDocument();
        // Adjust for locale string output if necessary, or just check partial text
        expect(screen.getByText(/150.000/)).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<CartFloatingButton count={3} total={150000} onClick={handleClick} />);
        
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
