import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from '../SearchBox';

describe('SearchBox', () => {
  it('renders correctly', () => {
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    // Initially it might not have aria-label, but after changes it should.
    // For now, check by role.
  });

  it('calls setSearchTerm on input change', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test' } });
    expect(setSearchTerm).toHaveBeenCalledWith('test');
  });

  // This test is expected to fail initially (or pass if logic was there, which it isn't)
  // We will implement the logic in the next step.
  it('focuses input on Ctrl+K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
    const input = screen.getByRole('textbox');

    fireEvent.keyDown(document, { key: 'k', code: 'KeyK', ctrlKey: true });
    expect(input).toHaveFocus();
  });

  it('has correct aria attributes', () => {
     render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
     const input = screen.getByRole('textbox');
     expect(input).toHaveAttribute('aria-label', 'جستجو');
     expect(input).toHaveAttribute('aria-keyshortcuts', 'Control+k');
  });
});
