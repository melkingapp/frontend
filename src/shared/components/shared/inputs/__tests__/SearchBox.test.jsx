import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';

/* global jest, describe, it, expect, document, window */

describe('SearchBox', () => {
    it('renders correctly', () => {
        render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
        expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
    });

    it('updates search term on input', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);
        const input = screen.getByPlaceholderText('جستجو...');
        fireEvent.change(input, { target: { value: 'test' } });
        expect(setSearchTerm).toHaveBeenCalledWith('test');
    });

    it('shows shortcut hint initially', () => {
        render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
        expect(screen.getByText('Ctrl K')).toBeInTheDocument();
    });

    it('hides shortcut hint when input is focused', () => {
        render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
        const input = screen.getByPlaceholderText('جستجو...');
        fireEvent.focus(input);
        expect(screen.queryByText('Ctrl K')).not.toBeInTheDocument();
    });

    it('hides shortcut hint when there is a search term', () => {
        render(<SearchBox searchTerm="test" setSearchTerm={() => {}} />);
        expect(screen.queryByText('Ctrl K')).not.toBeInTheDocument();
    });

    it('focuses input on Ctrl+K', () => {
        render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
        const input = screen.getByPlaceholderText('جستجو...');

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        expect(document.activeElement).toBe(input);
    });
});
