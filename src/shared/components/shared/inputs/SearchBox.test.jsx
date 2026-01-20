import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import SearchBox from './SearchBox';

describe('SearchBox', () => {
    it('renders input with correct placeholder and aria-label', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const input = screen.getByPlaceholderText('جستجو...');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-label', 'جستجو');
    });

    it('renders search icon', () => {
        const setSearchTerm = jest.fn();
        const { container } = render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        // Search icon is aria-hidden, so we find it by selector
        // We look for the SVG inside the container that is NOT the clear button (which is absent here)
        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows clear button when there is text', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="test" setSearchTerm={setSearchTerm} />);

        const clearBtn = screen.getByLabelText('پاک کردن جستجو');
        expect(clearBtn).toBeInTheDocument();
    });

    it('does not show clear button when empty', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

        const clearBtn = screen.queryByLabelText('پاک کردن جستجو');
        expect(clearBtn).not.toBeInTheDocument();
    });

    it('clears text when clear button is clicked', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="test" setSearchTerm={setSearchTerm} />);

        const clearBtn = screen.getByLabelText('پاک کردن جستجو');
        fireEvent.click(clearBtn);

        expect(setSearchTerm).toHaveBeenCalledWith("");
    });
});
