import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingActionButton from './FloatingActionButton';
import React from 'react';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Plus: () => <svg data-testid="plus-icon" />,
}));

describe('FloatingActionButton', () => {
  const items = [
    { key: '1', label: 'Item 1', icon: <span>Icon1</span>, onClick: jest.fn() },
    { key: '2', label: 'Item 2', icon: <span>Icon2</span>, onClick: jest.fn() },
  ];

  it('renders the toggle button with correct accessibility attributes', () => {
    render(<FloatingActionButton items={items} />);

    // Check initial state
    // Note: 'toggle menu' aria-label is what we PLAN to add.
    // This query will fail if the label is missing.
    const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-haspopup', 'true');
    expect(toggleButton).toHaveAttribute('aria-controls', 'fab-menu');
  });

  it('toggles menu visibility and focusability', () => {
    render(<FloatingActionButton items={items} />);
    const toggleButton = screen.getByRole('button', { name: /toggle menu/i });

    // Open menu
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    // Check menu container
    // We plan to add id="fab-menu" and role="menu"
    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('id', 'fab-menu');
    expect(menu).toHaveAttribute('aria-hidden', 'false');

    // Check menu items
    // We plan to add role="menuitem"
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(2);
    menuItems.forEach(item => {
        expect(item).toHaveAttribute('tabindex', '0');
    });

    // Close menu
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(menu).toHaveAttribute('aria-hidden', 'true');

    menuItems.forEach(item => {
        expect(item).toHaveAttribute('tabindex', '-1');
    });
  });
});
