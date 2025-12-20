import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../../../components/shared/Header';

describe('Header Component', () => {
    it('renders correctly with default table number', () => {
        const { container } = render(<Header />);
        expect(screen.getByText('ScanDine Cafe')).toBeInTheDocument();
        expect(screen.getByText('Table #Unknown')).toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });

    it('renders correctly with provided table number', () => {
        const { container } = render(<Header tableNumber="5" />);
        expect(screen.getByText('Table #5')).toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });
});
