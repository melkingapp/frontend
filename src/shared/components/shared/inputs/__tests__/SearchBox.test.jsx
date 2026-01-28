import { jest, describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';
import React from 'react';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  X: () => <div data-testid="clear-icon">X</div>,
}));

describe('SearchBox Component', () => {
  it('renders correctly with empty search term', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

    expect(screen.getByPlaceholderText('جستجو...')).toBeTruthy();
    expect(screen.getByTestId('search-icon')).toBeTruthy();
    expect(screen.queryByTestId('clear-icon')).toBeNull();
  });

  it('calls setSearchTerm when typing', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(setSearchTerm).toHaveBeenCalledWith('test');
  });

  it('shows clear button when searchTerm is present', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="something" setSearchTerm={setSearchTerm} />);

    // In the current implementation, this will fail, confirming we need to add it.
    // Once implemented, this should pass.
    expect(screen.queryByTestId('clear-icon')).toBeTruthy();
  });

  it('clears search term when clear button is clicked', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="something" setSearchTerm={setSearchTerm} />);

    // This will throw error currently because the button doesn't exist
    const clearBtn = screen.getByLabelText('پاک کردن جستجو');
    fireEvent.click(clearBtn);

    expect(setSearchTerm).toHaveBeenCalledWith('');
  });
});
