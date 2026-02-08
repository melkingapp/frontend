import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import SearchBox from './SearchBox';

describe('SearchBox', () => {
    it('renders with placeholder', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);
        expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
    });

    it('focuses input on Ctrl+K', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const input = screen.getByPlaceholderText('جستجو...');
        expect(document.activeElement).not.toBe(input);

        fireEvent.keyDown(window, { key: 'k', code: 'KeyK', ctrlKey: true });

        expect(document.activeElement).toBe(input);
    });

    it('focuses input on Cmd+K (Meta+K)', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const input = screen.getByPlaceholderText('جستجو...');
        expect(document.activeElement).not.toBe(input);

        fireEvent.keyDown(window, { key: 'k', code: 'KeyK', metaKey: true });

        expect(document.activeElement).toBe(input);
    });
});
