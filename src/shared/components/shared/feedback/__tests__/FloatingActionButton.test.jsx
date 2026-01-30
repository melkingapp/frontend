/* global jest */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingActionButton from '../FloatingActionButton';
import { describe, test, expect } from '@jest/globals';

// Mock lucide-react
jest.mock('lucide-react', () => ({
    Plus: () => <div data-testid="plus-icon">Plus</div>,
}));

// Mock useClickOutside
jest.mock('../../../../hooks/useClickOutside', () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe('FloatingActionButton Accessibility', () => {
    const mockItems = [
        { key: '1', label: 'Item 1', icon: <span>Icon 1</span>, onClick: jest.fn() },
        { key: '2', label: 'Item 2', icon: <span>Icon 2</span>, onClick: jest.fn() },
    ];

    test('renders with correct accessibility attributes when closed', () => {
        render(<FloatingActionButton items={mockItems} />);

        // This is expected to fail initially because aria-label is missing
        // We look for a button that has "Open menu" or similar accessible name
        const mainButton = screen.getByRole('button', { name: /open menu|toggle action menu/i });
        expect(mainButton).toBeInTheDocument();
        expect(mainButton).toHaveAttribute('aria-expanded', 'false');

        // Check menu items are not reachable via keyboard
        const item1 = screen.getByText('Item 1').closest('button');
        expect(item1).toHaveAttribute('tabIndex', '-1');
    });

    test('updates accessibility attributes when opened', () => {
        render(<FloatingActionButton items={mockItems} />);

        const mainButton = screen.getByRole('button', { name: /open menu|toggle action menu/i });
        fireEvent.click(mainButton);

        expect(mainButton).toHaveAttribute('aria-expanded', 'true');
        expect(mainButton).toHaveAttribute('aria-label', expect.stringMatching(/close menu/i));

        const item1 = screen.getByText('Item 1').closest('button');
        expect(item1).toHaveAttribute('tabIndex', '0');
    });
});
