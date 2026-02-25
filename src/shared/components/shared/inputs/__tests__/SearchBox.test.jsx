/* global jest, describe, it, expect, beforeEach */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '../SearchBox';

describe('SearchBox', () => {
    const defaultProps = {
        searchTerm: '',
        setSearchTerm: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<SearchBox {...defaultProps} />);
        expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
    });

    it('focuses input on Ctrl+K', async () => {
        const user = userEvent.setup();
        render(<SearchBox {...defaultProps} />);
        const input = screen.getByPlaceholderText('جستجو...');

        // Initial check: not focused
        expect(input).not.toHaveFocus();

        // Simulate Ctrl+K
        await user.keyboard('{Control>}k{/Control}');

        expect(input).toHaveFocus();
    });

    it('focuses input on Cmd+K (Meta+K)', async () => {
        const user = userEvent.setup();
        render(<SearchBox {...defaultProps} />);
        const input = screen.getByPlaceholderText('جستجو...');

        // Initial check: not focused
        expect(input).not.toHaveFocus();

        // Simulate Meta+K
        await user.keyboard('{Meta>}k{/Meta}');

        expect(input).toHaveFocus();
    });

    it('displays hint when empty and not focused', () => {
        render(<SearchBox {...defaultProps} />);
        // We look for the hint text.
        expect(screen.getByText('Ctrl K')).toBeInTheDocument();
    });
});
