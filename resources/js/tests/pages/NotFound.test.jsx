import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotFound from '../../pages/NotFound';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

describe('NotFound Component', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('renders the 404 message correctly', () => {
        render(<NotFound />);
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('Halaman Tidak Ditemukan')).toBeInTheDocument();
        expect(screen.getByText(/Oops! Sepertinya kopi yang Anda cari sudah habis/i)).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
        render(<NotFound />);
        expect(screen.getByText('Kembali ke Beranda')).toBeInTheDocument();
        expect(screen.getByText('Lihat Menu')).toBeInTheDocument();
        expect(screen.getByText('Kembali ke halaman sebelumnya')).toBeInTheDocument();
    });

    it('navigates to home when "Kembali ke Beranda" is clicked', () => {
        render(<NotFound />);
        fireEvent.click(screen.getByText('Kembali ke Beranda'));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates to menu when "Lihat Menu" is clicked', () => {
        render(<NotFound />);
        fireEvent.click(screen.getByText('Lihat Menu'));
        expect(mockNavigate).toHaveBeenCalledWith('/menu');
    });

    it('navigates back when "Kembali ke halaman sebelumnya" is clicked', () => {
        render(<NotFound />);
        fireEvent.click(screen.getByText('Kembali ke halaman sebelumnya'));
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
});
