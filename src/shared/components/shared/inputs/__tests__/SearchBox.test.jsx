import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '../SearchBox';

describe('SearchBox', () => {
  const mockSetSearchTerm = jest.fn();

  beforeEach(() => {
    mockSetSearchTerm.mockClear();
  });

  test('renders search input', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    // Current implementation uses placeholder "جستجو..."
    const input = screen.getByPlaceholderText(/جستجو/i);
    expect(input).toBeInTheDocument();
  });

  test('typing calls setSearchTerm', async () => {
    const user = userEvent.setup();
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText(/جستجو/i);
    await user.type(input, 'test');
    expect(mockSetSearchTerm).toHaveBeenCalled();
  });

  test('renders clear button when searchTerm is present', () => {
    render(<SearchBox searchTerm="test" setSearchTerm={mockSetSearchTerm} />);
    const clearButton = screen.queryByLabelText('پاک کردن جستجو');
    expect(clearButton).toBeInTheDocument();
  });

  test('does not render clear button when searchTerm is empty', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const clearButton = screen.queryByLabelText('پاک کردن جستجو');
    expect(clearButton).not.toBeInTheDocument();
  });

  test('clears search term when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchBox searchTerm="test" setSearchTerm={mockSetSearchTerm} />);
    const clearButton = screen.getByLabelText('پاک کردن جستجو');
    await user.click(clearButton);
    expect(mockSetSearchTerm).toHaveBeenCalledWith('');
  });

  test('focuses input after clearing', async () => {
    const user = userEvent.setup();
    render(<SearchBox searchTerm="test" setSearchTerm={mockSetSearchTerm} />);
    const clearButton = screen.getByLabelText('پاک کردن جستجو');
    const input = screen.getByPlaceholderText(/جستجو/i);

    await user.click(clearButton);
    expect(input).toHaveFocus();
  });

  test('renders shortcut hint when searchTerm is empty', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    // We expect Ctrl+K or Cmd+K
    const modifier = screen.getByText(/Ctrl|Cmd|⌘/);
    expect(modifier).toBeInTheDocument();
    const kKey = screen.getByText(/\+ K/);
    expect(kKey).toBeInTheDocument();
  });

  test('does not render shortcut hint when searchTerm is present', () => {
    render(<SearchBox searchTerm="test" setSearchTerm={mockSetSearchTerm} />);
    const modifier = screen.queryByText(/Ctrl|Cmd|⌘/);
    expect(modifier).not.toBeInTheDocument();
  });

  test('focuses input on Ctrl+K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText(/جستجو/i);

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(input).toHaveFocus();
  });

  test('focuses input on Cmd+K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    const input = screen.getByPlaceholderText(/جستجو/i);

    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(input).toHaveFocus();
  });
});
