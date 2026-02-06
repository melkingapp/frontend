import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, afterEach, beforeEach } from '@jest/globals';
import SearchBox from '../SearchBox';
import React from 'react';

describe('SearchBox', () => {
    const mockSetSearchTerm = jest.fn();
    const originalPlatform = navigator.platform;

    beforeEach(() => {
        // Reset platform to a non-Mac value by default
        Object.defineProperty(navigator, 'platform', {
            value: 'Win32',
            configurable: true
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(navigator, 'platform', {
            value: originalPlatform,
            configurable: true
        });
    });

    it('renders correctly with placeholder', () => {
        render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
        const input = screen.getByPlaceholderText('جستجو...');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-label', 'جستجو');
    });

    it('calls setSearchTerm on change', () => {
        render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
        const input = screen.getByPlaceholderText('جستجو...');
        fireEvent.change(input, { target: { value: 'test' } });
        expect(mockSetSearchTerm).toHaveBeenCalledWith('test');
    });

    it('focuses input on Ctrl+K', () => {
        render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
        const input = screen.getByPlaceholderText('جستجو...');

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

        expect(input).toHaveFocus();
    });

    it('shows shortcut hint when empty and not focused', () => {
        render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
        expect(screen.getByText(/Ctrl\+K/)).toBeInTheDocument();
    });

    it('hides shortcut hint when focused', () => {
        render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
        const input = screen.getByPlaceholderText('جستجو...');
        fireEvent.focus(input);
        expect(screen.queryByText(/Ctrl\+K/)).not.toBeInTheDocument();
    });

    it('hides shortcut hint when there is a value', () => {
        render(<SearchBox searchTerm="something" setSearchTerm={mockSetSearchTerm} />);
        expect(screen.queryByText(/Ctrl\+K/)).not.toBeInTheDocument();
    });

    it('displays Mac shortcut symbol on Mac platform', () => {
        Object.defineProperty(navigator, 'platform', {
            value: 'MacIntel',
            configurable: true
        });

        render(<SearchBox searchTerm="" setSearchTerm={mockSetSearchTerm} />);
        expect(screen.getByText(/⌘K/)).toBeInTheDocument();
    });
});
