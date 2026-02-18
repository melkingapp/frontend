/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingActionButton from '../FloatingActionButton';
import '@testing-library/jest-dom';

// Mock Lucide icons to avoid rendering issues in test environment
jest.mock('lucide-react', () => ({
  __esModule: true,
  Plus: () => <svg data-testid="plus-icon" />,
  User: () => <svg data-testid="user-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
}));

describe('FloatingActionButton', () => {
  const mockItems = [
    { key: 'profile', label: 'Profile', icon: <svg data-testid="user-icon" />, onClick: jest.fn() },
    { key: 'settings', label: 'Settings', icon: <svg data-testid="settings-icon" />, onClick: jest.fn() },
  ];

  test('renders the main toggle button', () => {
    render(<FloatingActionButton items={mockItems} />);
    // The menu items are buttons too, but when rendered initially they might be in DOM.
    // We target the main button specifically by its unique attributes we added.
    const button = screen.getByRole('button', { name: /open menu/i });
    expect(button).toBeInTheDocument();
  });

  test('toggle button has accessible label', () => {
    render(<FloatingActionButton items={mockItems} />);
    const button = screen.getByLabelText(/open menu/i);
    expect(button).toBeInTheDocument();
  });

  test('menu items are hidden when closed', () => {
    render(<FloatingActionButton items={mockItems} />);
    // The menu container should have the 'invisible' class which hides it visually and from screen readers (via visibility: hidden style in CSS)
    // Since JSDOM doesn't process CSS, we check for the class presence
    const menu = screen.getByRole('menu', { hidden: true });
    expect(menu).toHaveClass('invisible');
    expect(menu).toHaveClass('opacity-0');
  });

  test('opens menu on click', () => {
    render(<FloatingActionButton items={mockItems} />);
    const button = screen.getByRole('button', { name: /open menu/i });

    fireEvent.click(button);

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('visible');
    expect(menu).toHaveClass('opacity-100');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-label', 'Close menu');
  });

  test('closes menu on escape key', () => {
    render(<FloatingActionButton items={mockItems} />);
    const button = screen.getByRole('button', { name: /open menu/i });

    fireEvent.click(button); // Open
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('visible');

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(menu).toHaveClass('invisible');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
