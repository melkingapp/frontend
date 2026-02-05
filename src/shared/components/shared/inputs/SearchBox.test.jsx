
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBox from './SearchBox';

describe('SearchBox', () => {
  test('renders search input with placeholder', () => {
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
    const input = screen.getByPlaceholderText('جستجو...');
    expect(input).toBeInTheDocument();
  });

  test('calls setSearchTerm on input change', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(setSearchTerm).toHaveBeenCalledWith('test');
  });

  test('shows clear button only when there is text', () => {
    const setSearchTerm = jest.fn();
    const { rerender } = render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

    // Should not show clear button initially
    const clearButton = screen.queryByLabelText('پاک کردن جستجو');
    expect(clearButton).not.toBeInTheDocument();

    // Rerender with text
    rerender(<SearchBox searchTerm="hello" setSearchTerm={setSearchTerm} />);

    // Now it should show clear button
    const clearButtonVisible = screen.getByLabelText('پاک کردن جستجو');
    expect(clearButtonVisible).toBeInTheDocument();

    // Click clear button
    fireEvent.click(clearButtonVisible);
    expect(setSearchTerm).toHaveBeenCalledWith('');

    // Focus should return to input? (Maybe nice to have, but checking clear functionality first)
  });
});
