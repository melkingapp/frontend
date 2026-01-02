import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button';
import '@testing-library/jest-dom';

describe('Button Component', () => {
  test('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('renders loading state correctly', () => {
    render(<Button loading={true}>Click Me</Button>);
    expect(screen.getByText('در حال پردازش...')).toBeInTheDocument();
  });

  test('renders custom loading text', () => {
    render(<Button loading={true} loadingText="Please wait...">Click Me</Button>);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  test('renders disabled state', () => {
    render(<Button disabled={true}>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('renders disabled state when loading', () => {
    render(<Button loading={true}>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('has aria-busy when loading', () => {
      render(<Button loading={true}>Click Me</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

    test('spinner color depends on button color', () => {
        const { container } = render(<Button loading={true} color="whiteBlue">Click Me</Button>);
        // Need to check if the spinner has correct class
        // The spinner is a div inside the button
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toHaveClass('border-[#2C5A8C]');
    });

    test('spinner color is white for darkBlue', () => {
        const { container } = render(<Button loading={true} color="darkBlue">Click Me</Button>);
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toHaveClass('border-white');
    });
});
