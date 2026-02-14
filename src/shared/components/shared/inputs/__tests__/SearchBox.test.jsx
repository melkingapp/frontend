/* global describe, test, expect, jest */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '../SearchBox';

// Mock lucide-react to avoid ESM issues if any
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
}));

describe('SearchBox', () => {
  test('renders correctly', () => {
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
    expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  test('focuses input on Ctrl+K', async () => {
    const user = userEvent.setup();
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);

    const input = screen.getByPlaceholderText('جستجو...');
    expect(input).not.toHaveFocus();

    // Simulate Ctrl+K
    await user.keyboard('{Control>}k{/Control}');

    expect(input).toHaveFocus();
  });

  test('focuses input on Cmd+K (Mac)', async () => {
    const user = userEvent.setup();
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);

    const input = screen.getByPlaceholderText('جستجو...');
    expect(input).not.toHaveFocus();

    // Simulate Cmd+K
    await user.keyboard('{Meta>}k{/Meta}');

    expect(input).toHaveFocus();
  });
});
