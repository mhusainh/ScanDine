import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageWithFallback from '../../../components/ui/ImageWithFallback';

describe('ImageWithFallback Component', () => {
    it('should render the image when src is valid', () => {
        const { container } = render(
            <ImageWithFallback 
                src="valid-image.jpg" 
                alt="Test Image" 
                className="w-10 h-10"
            />
        );
        
        const img = screen.getByRole('img');
        expect(img.tagName).toBe('IMG');
        expect(img).toHaveAttribute('src', 'valid-image.jpg');
        expect(img).toHaveAttribute('alt', 'Test Image');
        expect(img).toHaveClass('w-10 h-10');
    });

    it('should render fallback when src is missing', () => {
        render(
            <ImageWithFallback 
                src={null} 
                alt="Missing Image" 
            />
        );
        
        // When fallback is rendered, it's a div with role="img"
        const fallback = screen.getByRole('img');
        expect(fallback.tagName).toBe('DIV');
        expect(fallback).toHaveAttribute('aria-label', 'Missing Image');
        expect(screen.getByText('ScanDine')).toBeInTheDocument();
    });

    it('should switch to fallback when image load fails', () => {
        render(
            <ImageWithFallback 
                src="invalid-image.jpg" 
                alt="Broken Image" 
            />
        );
        
        const img = screen.getByRole('img');
        
        // Simulate error
        fireEvent.error(img);
        
        const fallback = screen.getByRole('img');
        expect(fallback.tagName).toBe('DIV');
        expect(fallback).toHaveAttribute('aria-label', 'Broken Image');
    });
});
