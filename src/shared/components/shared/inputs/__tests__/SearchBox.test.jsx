import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';
import React from 'react';

// Mock Lucide icon to avoid rendering issues
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
}));

describe('SearchBox Component', () => {
  const mockSetSearchTerm = jest.fn();

  beforeEach(() => {
    mockSetSearchTerm.mockClear();
  });

  test('renders correctly', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  test('updates input value on change', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith('test');
  });

  test('focuses input on Ctrl+K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');

    // Simulate Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    expect(input).toHaveFocus();
  });

  test('focuses input on Cmd+K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');

    // Simulate Cmd+K
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    expect(input).toHaveFocus();
  });

  test('displays keyboard shortcut hint', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    // screen.debug();
    // Check for "Ctrl+K" or "⌘K"
    const hint = screen.getByText(/Ctrl\+K|⌘K/i);
    expect(hint).toBeInTheDocument();
  });
});
