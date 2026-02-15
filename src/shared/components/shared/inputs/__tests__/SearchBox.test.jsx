/* global describe, test, expect, jest */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '../SearchBox';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
}));

describe('SearchBox Component', () => {
  const setup = () => {
    const setSearchTerm = jest.fn();
    const utils = render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');
    return {
      input,
      setSearchTerm,
      ...utils,
    };
  };

  test('renders correctly', () => {
    const { input } = setup();
    expect(input).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  test('updates value on change', async () => {
    const { input, setSearchTerm } = setup();
    const user = userEvent.setup();
    await user.type(input, 'test');
    expect(setSearchTerm).toHaveBeenCalledWith('t');
    expect(setSearchTerm).toHaveBeenCalledWith('e');
    expect(setSearchTerm).toHaveBeenCalledWith('s');
    expect(setSearchTerm).toHaveBeenCalledWith('t');
  });

  test('focuses input on Ctrl+K', () => {
    const { input } = setup();

    // Simulate Ctrl+K
    fireEvent.keyDown(document, { key: 'k', code: 'KeyK', ctrlKey: true });

    expect(input).toHaveFocus();
  });

  test('focuses input on Cmd+K (Mac)', () => {
    const { input } = setup();

    // Simulate Cmd+K
    fireEvent.keyDown(document, { key: 'k', code: 'KeyK', metaKey: true });

    expect(input).toHaveFocus();
  });

  test('displays correct hint for Windows/Linux (Ctrl+K)', () => {
    // Mock userAgent for Windows
    Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
    });

    setup();
    expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
  });

  test('displays correct hint for Mac (Cmd+K)', () => {
    // Mock userAgent for Mac
    Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true
    });

    setup();
    expect(screen.getByText('Cmd+K')).toBeInTheDocument();
  });
});
