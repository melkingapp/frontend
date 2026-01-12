
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from './SearchBox';
import { jest } from '@jest/globals';

describe('SearchBox Component', () => {
    it('renders correctly with accessibility attributes', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        // Check for accessible label
        expect(screen.getByLabelText('جستجو')).toBeTruthy();

        // Search icon should be hidden from screen readers
        // We can't easily check for aria-hidden="true" on SVG directly with simple queries,
        // but we can ensure the input is accessible.

        // Check placeholder
        expect(screen.getByPlaceholderText('جستجو...')).toBeTruthy();
    });

    it('shows clear button when there is text', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="hello" setSearchTerm={setSearchTerm} />);

        // Clear button should be visible
        const clearButton = screen.getByLabelText('پاک کردن جستجو');
        expect(clearButton).toBeTruthy();

        // Click clear button
        fireEvent.click(clearButton);
        expect(setSearchTerm).toHaveBeenCalledWith('');
    });

    it('does not show clear button when empty', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        // Clear button should not be visible
        const clearButton = screen.queryByLabelText('پاک کردن جستجو');
        expect(clearButton).toBeNull();
    });
});
