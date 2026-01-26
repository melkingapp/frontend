import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';
import { jest } from '@jest/globals';
import React from 'react';

describe('SearchBox', () => {
    test('renders search input with correct placeholder and aria-label', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const input = screen.getByPlaceholderText('جستجو...');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-label', 'جستجو');
    });

    test('calls setSearchTerm on input change', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const input = screen.getByPlaceholderText('جستجو...');
        fireEvent.change(input, { target: { value: 'test' } });

        expect(setSearchTerm).toHaveBeenCalledWith('test');
    });

    test('shows clear button when searchTerm is present', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="test" setSearchTerm={setSearchTerm} />);

        const clearButton = screen.getByLabelText('پاک کردن جستجو');
        expect(clearButton).toBeInTheDocument();
    });

    test('does not show clear button when searchTerm is empty', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const clearButton = screen.queryByLabelText('پاک کردن جستجو');
        expect(clearButton).not.toBeInTheDocument();
    });

    test('clears search term and focuses input on clear button click', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="test" setSearchTerm={setSearchTerm} />);

        const clearButton = screen.getByLabelText('پاک کردن جستجو');
        fireEvent.click(clearButton);

        expect(setSearchTerm).toHaveBeenCalledWith('');

        const input = screen.getByPlaceholderText('جستجو...');
        expect(input).toHaveFocus();
    });
});
