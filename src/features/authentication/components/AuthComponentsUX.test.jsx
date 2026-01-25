
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import PhoneInputForm from './PhoneInputForm';
import OtpVerificationForm from './OtpVerificationForm';

// Mock dependencies
jest.mock('lucide-react', () => ({
  ArrowLeftCircle: () => <div data-testid="arrow-left-icon" />,
  RefreshCcw: () => <div data-testid="refresh-icon" />,
  Edit3: () => <div data-testid="edit-icon" />,
}));

describe('Auth Components UX', () => {
  describe('PhoneInputForm', () => {
    it('shows loading state when loading prop is true', () => {
      render(
        <PhoneInputForm
          phone=""
          setPhone={() => {}}
          onSubmit={() => {}}
          onBack={() => {}}
          role="resident"
          loading={true}
        />
      );

      // Shared Button shows "در حال پردازش..." when loading
      const loadingText = screen.getByText(/در حال پردازش/i);
      expect(loadingText).toBeInTheDocument();

      // The button itself should be disabled
      const button = loadingText.closest('button');
      expect(button).toBeDisabled();
    });
  });

  describe('OtpVerificationForm', () => {
    it('shows loading state and has accessible inputs', () => {
      render(
        <OtpVerificationForm
          otp=""
          setOtp={() => {}}
          onVerify={() => {}}
          onBack={() => {}}
          loading={true}
        />
      );

      // Check for inputs aria-labels
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(5);

      inputs.forEach((input, index) => {
        expect(input).toHaveAttribute('aria-label', `Digit ${index + 1}`);
      });

      // Check first input for autocomplete
      expect(inputs[0]).toHaveAttribute('autoComplete', 'one-time-code');

      // Check button loading state
      const loadingText = screen.getByText(/در حال پردازش/i);
      expect(loadingText).toBeInTheDocument();

      const button = loadingText.closest('button');
      expect(button).toBeDisabled();
    });
  });
});
