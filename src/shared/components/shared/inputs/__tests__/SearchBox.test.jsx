import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';
import React from 'react';

// Mock Lucide icons to avoid rendering issues and to easily find them
jest.mock('lucide-react', () => ({
  Search: (props) => <div data-testid="search-icon" {...props} />,
  X: (props) => <div data-testid="clear-icon" {...props} />,
}));

describe('SearchBox', () => {
  const mockSetSearchTerm = jest.fn();

  beforeEach(() => {
    mockSetSearchTerm.mockClear();
  });

  test('renders input with placeholder', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
  });

  test('calls setSearchTerm on input change', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith('test');
  });

  test('renders search icon', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  test('input has aria-label for accessibility', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    // This is expected to fail before fix
    expect(screen.getByLabelText('جستجو')).toBeInTheDocument();
  });

  test('shows clear button when there is text', () => {
    render(<SearchBox searchTerm="test" setSearchTerm={mockSetSearchTerm} />);
    // This is expected to fail before fix
    // We expect a button with aria-label "پاک کردن جستجو"
    const clearButton = screen.getByRole('button', { name: 'پاک کردن جستجو' });
    expect(clearButton).toBeInTheDocument();
  });

  test('does not show clear button when empty', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const clearButton = screen.queryByRole('button', { name: 'پاک کردن جستجو' });
    expect(clearButton).not.toBeInTheDocument();
  });

  test('clears text when clear button is clicked', () => {
    render(<SearchBox searchTerm="test" setSearchTerm={mockSetSearchTerm} />);
    const clearButton = screen.getByRole('button', { name: 'پاک کردن جستجو' });
    fireEvent.click(clearButton);
    expect(mockSetSearchTerm).toHaveBeenCalledWith('');
  });
});
