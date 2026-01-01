import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';
import React from 'react';

// Mock lucide-react to avoid ESM issues and check props
jest.mock('lucide-react', () => ({
  Search: (props) => <div data-testid="search-icon" {...props} />
}));

describe('SearchBox Component', () => {
  const mockSetSearchTerm = jest.fn();

  beforeEach(() => {
    mockSetSearchTerm.mockClear();
  });

  it('renders correctly with required props', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);

    // Check if input is rendered
    const input = screen.getByPlaceholderText('جستجو...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('calls setSearchTerm on input change', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(mockSetSearchTerm).toHaveBeenCalledWith('test');
  });

  it('has accessible label', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    // Check for aria-label on the input
    const input = screen.getByPlaceholderText('جستجو...');
    expect(input).toHaveAttribute('aria-label', 'جستجو');
  });

  it('hides the decorative icon from screen readers', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const icon = screen.getByTestId('search-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('positions the icon on the right (start) for RTL', () => {
      render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
      const icon = screen.getByTestId('search-icon');

      // Check for RTL positioning classes
      expect(icon.className).toContain('right-3');
      expect(icon.className).not.toContain('left-3');

      const input = screen.getByPlaceholderText('جستجو...');
      expect(input.className).toContain('pr-10');
      expect(input.className).toContain('pl-3');
      expect(input.className).not.toContain('pl-10');
  });
});
