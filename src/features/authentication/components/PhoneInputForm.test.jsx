import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhoneInputForm from './PhoneInputForm';
import { jest } from '@jest/globals';

describe('PhoneInputForm', () => {
    const mockOnSubmit = jest.fn();
    const mockOnBack = jest.fn();

    beforeEach(() => {
        mockOnSubmit.mockClear();
        mockOnBack.mockClear();
    });

    test('renders correctly', () => {
        render(<PhoneInputForm phone="" setPhone={() => {}} onSubmit={mockOnSubmit} onBack={mockOnBack} role="resident" />);
        expect(screen.getByLabelText(/شماره موبایل/i)).toBeInTheDocument();
        expect(screen.getByText(/ورود به عنوان ساکن/i)).toBeInTheDocument();
    });

    test('validates phone number format', async () => {
        render(<PhoneInputForm phone="" setPhone={() => {}} onSubmit={mockOnSubmit} onBack={mockOnBack} role="resident" />);

        const input = screen.getByLabelText(/شماره موبایل/i);
        const submitButton = screen.getByText(/دریافت کد تأیید/i);

        fireEvent.change(input, { target: { value: '123' } });
        fireEvent.click(submitButton);

        expect(await screen.findByText(/شماره موبایل معتبر نیست/i)).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();

        // Check accessibility attributes
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby', 'phone-error');
    });

    test('submits valid phone number', async () => {
        render(<PhoneInputForm phone="" setPhone={() => {}} onSubmit={mockOnSubmit} onBack={mockOnBack} role="resident" />);

        const input = screen.getByLabelText(/شماره موبایل/i);
        const submitButton = screen.getByText(/دریافت کد تأیید/i);

        fireEvent.change(input, { target: { value: '09123456789' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith('09123456789');
        });
    });

    test('shows loading state', () => {
        render(<PhoneInputForm phone="09123456789" setPhone={() => {}} onSubmit={mockOnSubmit} onBack={mockOnBack} role="resident" loading={true} />);

        const submitButton = screen.getByRole('button', { name: /در حال پردازش/i });
        expect(submitButton).toBeDisabled();
        expect(screen.queryByText(/دریافت کد تأیید/i)).not.toBeInTheDocument();
    });
});
