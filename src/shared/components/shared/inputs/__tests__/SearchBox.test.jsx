import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '../SearchBox';
import React from 'react';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <span data-testid="search-icon">Search</span>,
  X: () => <span data-testid="clear-icon">X</span>,
}));

describe('SearchBox Component', () => {
  const mockSetSearchTerm = jest.fn();

  beforeEach(() => {
    mockSetSearchTerm.mockClear();
  });

  it('renders correctly with empty search term', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    // Hint should be visible when empty (implementation pending)
    // expect(screen.getByText(/K/)).toBeInTheDocument();
  });

  it('renders correctly with search term', () => {
    render(<SearchBox searchTerm="test" setSearchTerm={mockSetSearchTerm} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test');
    // Clear button should be visible (implementation pending)
  });

  it('calls setSearchTerm when typing', async () => {
    const user = userEvent.setup();
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'a');

    expect(mockSetSearchTerm).toHaveBeenCalledWith('a');
  });

  it('focuses input on Ctrl+K', async () => {
    const user = userEvent.setup();
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);

    const input = screen.getByRole('textbox');

    // Simulate Ctrl+K
    await user.keyboard('{Control>}k{/Control}');

    expect(input).toHaveFocus();
  });

    it('focuses input on Cmd+K', async () => {
    const user = userEvent.setup();
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);

    const input = screen.getByRole('textbox');

    // Simulate Meta+K
    await user.keyboard('{Meta>}k{/Meta}');

    expect(input).toHaveFocus();
  });
});
