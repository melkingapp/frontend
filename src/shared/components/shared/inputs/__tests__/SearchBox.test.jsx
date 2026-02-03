import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';
import React from 'react';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <svg data-testid="search-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

describe('SearchBox', () => {
  const mockSetSearchTerm = jest.fn();

  beforeEach(() => {
    mockSetSearchTerm.mockClear();
  });

  it('renders correctly with placeholder', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith('test');
  });

  it('shows clear button when searchTerm is present', () => {
    render(<SearchBox searchTerm="hello" setSearchTerm={mockSetSearchTerm} />);
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('does not show clear button when searchTerm is empty', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    render(<SearchBox searchTerm="hello" setSearchTerm={mockSetSearchTerm} />);
    const clearBtn = screen.getByRole('button', { name: /پاک کردن/ });
    fireEvent.click(clearBtn);
    expect(mockSetSearchTerm).toHaveBeenCalledWith('');
  });

  it('focuses input on Ctrl+K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');

    // Simulate Ctrl+K
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(input).toHaveFocus();
  });

  it('focuses input on Cmd+K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');

    // Simulate Cmd+K
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(input).toHaveFocus();
  });
});
