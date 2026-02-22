/* global jest, describe, it, expect, beforeEach */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search Icon</div>,
}));

describe('SearchBox Component', () => {
  const mockSetSearchTerm = jest.fn();

  beforeEach(() => {
    mockSetSearchTerm.mockClear();
  });

  it('renders correctly with placeholder', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');
    expect(input).toBeInTheDocument();
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

    // Simulate Ctrl+K on document
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    expect(input).toHaveFocus();
  });

  it('focuses input on Cmd+K (Mac)', () => {
    // Mock userAgent for Mac
    Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Macintosh',
        configurable: true
    });

    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');

    // Simulate Cmd+K on document
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    expect(input).toHaveFocus();
  });

  it('does not focus on other keys', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');

    fireEvent.keyDown(document, { key: 'j', ctrlKey: true });
    expect(input).not.toHaveFocus();

    fireEvent.keyDown(document, { key: 'k', ctrlKey: false });
    expect(input).not.toHaveFocus();
  });
});
