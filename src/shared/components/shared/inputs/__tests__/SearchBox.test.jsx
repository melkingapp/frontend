import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';
import React from 'react';

describe('SearchBox', () => {
    it('renders with default placeholder', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', 'جستجو...');
    });

    it('renders with custom placeholder', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} placeholder="Custom Placeholder" />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('placeholder', 'Custom Placeholder');
    });

    it('calls setSearchTerm on input change', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test' } });

        expect(setSearchTerm).toHaveBeenCalledWith('test');
    });

    // NOTE: This test expects the Clear button to exist, which is not yet implemented.
    // I will write it now, and it will fail or pass once implemented.
    // For now, I'll write the test assuming the implementation will follow.
    it('shows clear button when searchTerm is present and clears on click', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="hello" setSearchTerm={setSearchTerm} />);

        // Use queryByLabelText to check existence
        // I plan to add aria-label="پاک کردن جستجو"
        const clearButton = screen.getByLabelText('پاک کردن جستجو');
        expect(clearButton).toBeInTheDocument();

        fireEvent.click(clearButton);
        expect(setSearchTerm).toHaveBeenCalledWith('');

        // Verify focus is returned to input (requires mocking useRef or verify activeElement)
        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
    });

    it('does not show clear button when searchTerm is empty', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const clearButton = screen.queryByLabelText('پاک کردن جستجو');
        expect(clearButton).not.toBeInTheDocument();
    });
});
