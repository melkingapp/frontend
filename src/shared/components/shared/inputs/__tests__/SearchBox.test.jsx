/* global jest, describe, test, expect, beforeEach */
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';
import React from 'react';
import '@testing-library/jest-dom';

// Mock Lucide icon
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />
}));

describe('SearchBox Component', () => {
  const mockSetSearchTerm = jest.fn();

  beforeEach(() => {
    mockSetSearchTerm.mockClear();
  });

  test('renders correctly with initial search term', () => {
    render(<SearchBox searchTerm="initial" setSearchTerm={mockSetSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('initial');
  });

  test('updates search term on input change', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');
    fireEvent.change(input, { target: { value: 'new term' } });

    expect(mockSetSearchTerm).toHaveBeenCalledWith('new term');
  });

  test('focuses input on Ctrl+K keydown', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');

    // Simulate Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    expect(input).toHaveFocus();
  });

  test('displays correct shortcut hint based on OS (Windows/Linux default)', () => {
    // Mock userAgent for Windows/Linux if needed, but default JSDOM is likely generic
    // We just check if "Ctrl" is present since that's the default state
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);

    // The hint text is "Ctrl K" inside the component
    // We use a regex to be flexible about whitespace
    expect(screen.getByText(/Ctrl/)).toBeInTheDocument();
  });
});
