/* global jest, describe, it, expect */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '../SearchBox';

// Mock Lucide icon to avoid issues in test environment
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
}));

describe('SearchBox', () => {
  it('renders with placeholder and initial value', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="initial" setSearchTerm={setSearchTerm} />);

    // Prior to adding aria-label, this might match by placeholder
    const input = screen.getByPlaceholderText('جستجو...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('initial');
  });

  it('updates value on change', async () => {
    const setSearchTerm = jest.fn();
    const user = userEvent.setup();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');
    await user.type(input, 'a');

    expect(setSearchTerm).toHaveBeenCalledWith('a');
  });

  it('focuses input on Ctrl+K', async () => {
    const setSearchTerm = jest.fn();
    const user = userEvent.setup();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');
    expect(document.activeElement).not.toBe(input);

    // Simulate Ctrl+K
    await user.keyboard('{Control>}k{/Control}');

    // This assertion is expected to fail until implementation is added
    expect(document.activeElement).toBe(input);
  });

  it('has correct ARIA attributes', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');
    // These assertions expect the new implementation
    expect(input).toHaveAttribute('aria-keyshortcuts', 'Control+K');
    expect(input).toHaveAttribute('aria-label', 'جستجو');
  });
});
