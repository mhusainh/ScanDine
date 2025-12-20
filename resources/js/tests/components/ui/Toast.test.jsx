import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from '../../../components/ui/Toast';
import { ToastProvider, useToast } from '../../../contexts/ToastContext';
import { vi } from 'vitest';

// Mock Lucide icons to avoid rendering issues in tests
vi.mock('lucide-react', () => ({
    CheckCircle: () => <div data-testid="icon-success" />,
    AlertCircle: () => <div data-testid="icon-error" />,
    AlertTriangle: () => <div data-testid="icon-warning" />,
    Info: () => <div data-testid="icon-info" />,
    Coffee: () => <div data-testid="icon-coffee" />,
    X: () => <div data-testid="icon-close" />,
}));

describe('Toast Component', () => {
    test('renders correctly with message', () => {
        render(
            <Toast 
                id="test-1" 
                message="Test Message" 
                onClose={() => {}} 
                type="info"
            />
        );
        expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    test('calls onClose after duration', () => {
        vi.useFakeTimers();
        const onClose = vi.fn();
        render(
            <Toast 
                id="test-1" 
                message="Test Message" 
                onClose={onClose} 
                duration={3000}
            />
        );
        
        act(() => {
            vi.advanceTimersByTime(3000);
        });
        
        expect(onClose).toHaveBeenCalledWith('test-1');
        vi.useRealTimers();
    });
});

// Integration Test Component
const TestComponent = () => {
    const { addToast } = useToast();
    return (
        <button onClick={() => addToast({ title: 'Test', message: 'Toast Content' })}>
            Show Toast
        </button>
    );
};

describe('Toast Integration', () => {
    test('adds toast when function is called', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Toast'));
        expect(screen.getByText('Toast Content')).toBeInTheDocument();
    });
});
