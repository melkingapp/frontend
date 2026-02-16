/* global describe, test, expect, jest, beforeEach */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectField from '../SelectField';

// Mock getPersianType
jest.mock('../../../../utils/typeUtils', () => ({
    getPersianType: jest.fn((val) => `Persian ${val}`),
}));

describe('SelectField Component', () => {
    const defaultProps = {
        label: 'Test Label',
        name: 'test-select',
        value: '',
        onChange: jest.fn(),
        options: [
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders label and select element', () => {
        render(<SelectField {...defaultProps} />);
        expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    test('renders options correctly', () => {
        render(<SelectField {...defaultProps} />);
        expect(screen.getByRole('option', { name: 'انتخاب کنید' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
    });

    test('calls onChange when selection changes', () => {
        render(<SelectField {...defaultProps} />);
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'opt1' } });
        expect(defaultProps.onChange).toHaveBeenCalled();
    });

    test('displays error message when error prop is provided', () => {
        render(<SelectField {...defaultProps} error="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();

        const select = screen.getByRole('combobox');
        expect(select).toHaveAttribute('aria-invalid', 'true');
        expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
    });

    test('disables the select when disabled prop is true', () => {
        render(<SelectField {...defaultProps} disabled />);
        expect(screen.getByRole('combobox')).toBeDisabled();
    });

    test('handles value not in options by using fallback', () => {
        render(<SelectField {...defaultProps} value="unknown" />);
        // Expect the fallback option to be rendered
        // The mock returns "Persian unknown"
        expect(screen.getByRole('option', { name: 'Persian unknown' })).toBeInTheDocument();
    });

    test('forwards ref to the select element', () => {
        const ref = React.createRef();
        render(<SelectField {...defaultProps} ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    });

    test('renders required indicator and attribute', () => {
        render(<SelectField {...defaultProps} required />);
        expect(screen.getByText('*')).toHaveClass('text-red-500');
        expect(screen.getByRole('combobox')).toBeRequired();
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
    });

    test('passes extra props to select element', () => {
        render(<SelectField {...defaultProps} data-testid="custom-select" />);
        expect(screen.getByTestId('custom-select')).toBeInTheDocument();
    });
});
