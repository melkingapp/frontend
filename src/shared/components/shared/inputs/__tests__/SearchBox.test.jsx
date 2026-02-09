/* global jest, describe, it, expect */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '../SearchBox';

describe('SearchBox', () => {
    it('renders correctly with empty search term', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const input = screen.getByPlaceholderText('جستجو...');
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue('');

        // Hint should be present (Ctrl+K or ⌘K depending on environment, likely Ctrl+K in JSDOM)
        const hint = screen.getByText(/Ctrl\+K|⌘K/);
        expect(hint).toBeInTheDocument();
    });

    it('renders clear button when search term is present', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="test" setSearchTerm={setSearchTerm} />);

        const clearButton = screen.getByTitle('پاک کردن');
        expect(clearButton).toBeInTheDocument();

        // Hint should NOT be present
        const hint = screen.queryByText(/Ctrl\+K|⌘K/);
        expect(hint).not.toBeInTheDocument();
    });

    it('clears search term when clear button is clicked', async () => {
        const setSearchTerm = jest.fn();
        const user = userEvent.setup();
        render(<SearchBox searchTerm="test" setSearchTerm={setSearchTerm} />);

        const clearButton = screen.getByTitle('پاک کردن');
        await user.click(clearButton);

        expect(setSearchTerm).toHaveBeenCalledWith('');
    });

    it('focuses input on Ctrl+K', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const input = screen.getByPlaceholderText('جستجو...');

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

        expect(input).toHaveFocus();
    });
});
