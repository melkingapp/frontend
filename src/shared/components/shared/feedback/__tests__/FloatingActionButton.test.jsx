/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingActionButton from '../FloatingActionButton';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Plus: () => <svg data-testid="plus-icon" />,
}));

const mockItems = [
  { key: '1', label: 'Add Unit', icon: <span>U</span>, onClick: jest.fn() },
  { key: '2', label: 'Add Tenant', icon: <span>T</span>, onClick: jest.fn() },
];

describe('FloatingActionButton', () => {
  test('renders toggle button with accessible label', () => {
    render(<FloatingActionButton items={mockItems} />);

    // Should have a label like "Open actions menu" or similar
    const toggleButton = screen.getByRole('button', { name: /actions menu|open menu/i });

    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-haspopup', 'true');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('menu items are visually hidden when closed', () => {
    render(<FloatingActionButton items={mockItems} />);

    // Find the menu container. It is the parent of the menu items.
    // Since we don't have a role yet, we might need to find by structure or add a testid.
    // But we are adding role="menu" in the fix. So let's look for role="menu".
    // Wait, initially (before fix) it won't have role="menu".
    // So this test expects the FIX.

    const menu = screen.getByRole('menu', { hidden: true }); // hidden: true allows finding it even if invisible

    // JSDOM won't interpret 'invisible' class as style, so toHaveStyle won't work.
    // But we can check for the class name.
    expect(menu).toHaveClass('invisible');
    expect(menu).toHaveClass('opacity-0');
    expect(menu).toHaveClass('pointer-events-none');
  });

  test('menu items become visible when opened', () => {
    render(<FloatingActionButton items={mockItems} />);

    const toggleButton = screen.getByRole('button', { name: /actions menu|open menu/i });
    fireEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    const menu = screen.getByRole('menu', { hidden: true });
    expect(menu).toHaveClass('visible'); // We will add 'visible' class explicitly or ensure 'invisible' is removed
    expect(menu).toHaveClass('opacity-100');
    expect(menu).not.toHaveClass('pointer-events-none'); // Should NOT have it
    // Wait, the original code had pointer-events-none conditionally.
  });

  test('menu items have correct roles', () => {
    render(<FloatingActionButton items={mockItems} />);
    const toggleButton = screen.getByRole('button', { name: /actions menu|open menu/i });
    fireEvent.click(toggleButton); // Open it to make sure they are accessible

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(mockItems.length);
  });
});
