/* global jest, describe, it, expect */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '../SearchBox';
import React from 'react';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Search: (props) => <div data-testid="search-icon" {...props} />,
  X: (props) => <div data-testid="clear-icon" {...props} />,
}));

describe('SearchBox', () => {
  it('renders correctly with empty search term', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

    expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    // Check for shortcut hint
    expect(screen.getByText(/K/)).toBeInTheDocument();
  });

  it('renders correctly with search term', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="test" setSearchTerm={setSearchTerm} />);

    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    expect(screen.getByTestId('clear-icon')).toBeInTheDocument();
    // Hint should be hidden or removed
    expect(screen.queryByText(/Ctrl\+K/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/⌘K/i)).not.toBeInTheDocument();
  });

  it('calls setSearchTerm when typing', async () => {
    const setSearchTerm = jest.fn();
    const user = userEvent.setup();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');
    await user.type(input, 'a');
    expect(setSearchTerm).toHaveBeenCalledWith('a');
  });

  it('clears search term when X is clicked', async () => {
    const setSearchTerm = jest.fn();
    const user = userEvent.setup();
    render(<SearchBox searchTerm="test" setSearchTerm={setSearchTerm} />);

    const clearButton = screen.getByTitle('پاک کردن');
    await user.click(clearButton);
    expect(setSearchTerm).toHaveBeenCalledWith('');

    expect(screen.getByPlaceholderText('جستجو...')).toHaveFocus();
  });

  it('focuses input on Ctrl+K', async () => {
    const setSearchTerm = jest.fn();
    const user = userEvent.setup();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');
    expect(input).not.toHaveFocus();

    await user.keyboard('{Control>}k{/Control}');
    expect(input).toHaveFocus();
  });
});
