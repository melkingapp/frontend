/* global jest, describe, it, expect, beforeEach */
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';
import React from 'react';

// Mock Lucide icon since we don't need to test the icon itself
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
}));

describe('SearchBox', () => {
  const mockSetSearchTerm = jest.fn();

  beforeEach(() => {
    mockSetSearchTerm.mockClear();
  });

  it('renders correctly', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('updates value on change', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith('test');
  });

  it('focuses input on Ctrl+K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');

    expect(document.activeElement).not.toBe(input);

    // Simulate Ctrl+K keydown on document
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    expect(document.activeElement).toBe(input);
  });

  it('focuses input on Cmd+K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');

    expect(document.activeElement).not.toBe(input);

    // Simulate Cmd+K keydown on document
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    expect(document.activeElement).toBe(input);
  });

  it('displays keyboard hint', () => {
      render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
      // Check for "Ctrl K" or similar hint
      expect(screen.getByText(/Ctrl/i)).toBeInTheDocument();
      expect(screen.getByText(/K/i)).toBeInTheDocument();
  });
});
