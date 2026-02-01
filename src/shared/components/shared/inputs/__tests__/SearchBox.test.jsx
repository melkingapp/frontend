import { describe, test, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';

describe('SearchBox', () => {
    test('renders with default props', () => {
        render(<SearchBox />);
        // Use placeholder or aria-label to find input
        const input = screen.getByPlaceholderText('جستجو...');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'text');
    });

    test('supports value and onChange (standard props)', () => {
        const handleChange = jest.fn();
        render(<SearchBox value="test" onChange={handleChange} />);

        const input = screen.getByPlaceholderText('جستجو...');
        expect(input).toHaveValue('test');

        fireEvent.change(input, { target: { value: 'testing' } });
        expect(handleChange).toHaveBeenCalledWith('testing');
    });

    test('supports searchTerm and setSearchTerm (legacy props)', () => {
        const setSearchTerm = jest.fn();
        render(<SearchBox searchTerm="legacy" setSearchTerm={setSearchTerm} />);

        const input = screen.getByPlaceholderText('جستجو...');
        expect(input).toHaveValue('legacy');

        fireEvent.change(input, { target: { value: 'updated' } });
        expect(setSearchTerm).toHaveBeenCalledWith('updated');
    });

    test('shows clear button only when value is present', () => {
        const { rerender } = render(<SearchBox value="" onChange={() => {}} />);
        expect(screen.queryByLabelText('پاک کردن جستجو')).not.toBeInTheDocument();

        rerender(<SearchBox value="something" onChange={() => {}} />);
        expect(screen.getByLabelText('پاک کردن جستجو')).toBeInTheDocument();
    });

    test('clears input and calls handlers when clear button is clicked', () => {
        const handleChange = jest.fn();
        const setSearchTerm = jest.fn();
        render(<SearchBox value="to clear" onChange={handleChange} setSearchTerm={setSearchTerm} />);

        const clearButton = screen.getByLabelText('پاک کردن جستجو');
        fireEvent.click(clearButton);

        expect(handleChange).toHaveBeenCalledWith('');
        expect(setSearchTerm).toHaveBeenCalledWith('');
    });

    test('focuses input after clearing', () => {
        render(<SearchBox value="focus test" onChange={() => {}} />);
        const input = screen.getByPlaceholderText('جستجو...');
        const clearButton = screen.getByLabelText('پاک کردن جستجو');

        fireEvent.click(clearButton);
        expect(input).toHaveFocus();
    });

    test('has correct RTL classes', () => {
        render(<SearchBox />);
        const input = screen.getByPlaceholderText('جستجو...');
        // Check for pr-10 (padding right for search icon)
        expect(input).toHaveClass('pr-10');
    });

    test('passes additional props to input', () => {
        render(<SearchBox data-testid="custom-input" disabled />);
        const input = screen.getByTestId('custom-input');
        expect(input).toBeDisabled();
    });
});
