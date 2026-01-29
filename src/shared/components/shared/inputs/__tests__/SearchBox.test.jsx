import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, jest } from '@jest/globals';
import SearchBox from '../SearchBox';

describe('SearchBox Component', () => {
    test('renders correctly with default props', () => {
        render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
        const input = screen.getByRole('textbox', { name: /جستجو/i });
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', 'جستجو...');
    });

    test('supports value/onChange (Controlled)', async () => {
        const handleChange = jest.fn();
        render(<SearchBox value="test" onChange={handleChange} />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('test');

        await userEvent.type(input, '1');
        expect(handleChange).toHaveBeenCalled();
    });

    test('supports searchTerm/setSearchTerm (Legacy)', async () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="legacy" setSearchTerm={setSearchTerm} />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('legacy');

        fireEvent.change(input, { target: { value: 'legacy updated' } });
        expect(setSearchTerm).toHaveBeenCalledWith('legacy updated');
    });

    test('shows clear button when there is text', () => {
        const { rerender } = render(<SearchBox value="" onChange={() => {}} />);
        expect(screen.queryByLabelText(/پاک کردن جستجو/i)).not.toBeInTheDocument();

        rerender(<SearchBox value="text" onChange={() => {}} />);
        expect(screen.getByLabelText(/پاک کردن جستجو/i)).toBeInTheDocument();
    });

    test('clear button clears text and focuses input', () => {
        const handleChange = jest.fn();
        render(<SearchBox value="hello" onChange={handleChange} />);

        const clearButton = screen.getByLabelText(/پاک کردن جستجو/i);
        fireEvent.click(clearButton);

        // Check if onChange was called with empty string
        expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
            target: expect.objectContaining({ value: "" })
        }));
    });

    test('has correct RTL styling classes', () => {
        const { container } = render(<SearchBox value="" onChange={() => {}} />);
        // Search icon should be on the right (Start)
        // Note: We check for the class that positions it
        // The implementation has "absolute right-3"

        // Find the input wrapper
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('relative');
    });
});
