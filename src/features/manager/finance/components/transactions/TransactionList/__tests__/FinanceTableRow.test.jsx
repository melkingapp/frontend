import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinanceTableRow from '../FinanceTableRow';
import * as utils from '../../../../../../../shared/utils';

// Mock utils
jest.mock('../../../../../../../shared/utils', () => ({
  formatJalaliDate: jest.fn(date => date || '1403/01/01'),
  getPersianType: jest.fn((type) => type || 'نوع'),
  getPersianStatus: jest.fn(status => status || 'وضعیت'),
  getStatusColor: jest.fn(() => 'text-green-500'),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Crown: () => <div data-testid="crown-icon" />,
  Edit2: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  User: () => <div data-testid="user-icon" />,
  Building2: () => <div data-testid="building-icon" />,
}));

describe('FinanceTableRow', () => {
  const mockTransaction = {
    id: 1,
    title: 'تراکنش آزمایشی',
    amount: 100000,
    date: '1403/01/01',
    status: 'paid',
    type: 'charge',
    systemStatus: 'ممتاز',
  };

  const mockHandlers = {
    onSelect: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with basic props', () => {
    render(<FinanceTableRow transaction={mockTransaction} {...mockHandlers} />);

    expect(screen.getByText('تراکنش آزمایشی')).toBeInTheDocument();
    // Check for Persian number format
    expect(screen.getByText('۱۰۰٬۰۰۰')).toBeInTheDocument();
  });

  it('renders extra payment correctly', () => {
    const extraPaymentTransaction = {
      ...mockTransaction,
      category: 'extra_payment',
      title: 'پرداخت اضافی',
      unit: { unit_number: 101 },
      user: { full_name: 'کاربر تست' },
    };

    render(<FinanceTableRow transaction={extraPaymentTransaction} {...mockHandlers} />);

    // Check that at least one element with the text exists
    expect(screen.getAllByText('پرداخت اضافی').length).toBeGreaterThan(0);
    expect(screen.getByText(/کاربر تست/)).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(<FinanceTableRow transaction={mockTransaction} {...mockHandlers} />);

    const rowButton = screen.getByText('تراکنش آزمایشی').closest('button');
    fireEvent.click(rowButton);
    expect(mockHandlers.onSelect).toHaveBeenCalledWith(mockTransaction);
  });

  it('shows edit and delete buttons for manager', () => {
    render(<FinanceTableRow transaction={mockTransaction} {...mockHandlers} isManager={true} />);

    const editButton = screen.getByTitle('ویرایش');
    const deleteButton = screen.getByTitle('حذف');

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTransaction);

    fireEvent.click(deleteButton);
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTransaction);
  });

  it('does not show edit and delete buttons for non-manager', () => {
    render(<FinanceTableRow transaction={mockTransaction} {...mockHandlers} isManager={false} />);

    expect(screen.queryByTitle('ویرایش')).not.toBeInTheDocument();
    expect(screen.queryByTitle('حذف')).not.toBeInTheDocument();
  });
});
