import { jest } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchBox from '../SearchBox';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />
}));

describe('SearchBox', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders correctly with searchTerm and setSearchTerm (debounced)', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="initial" setSearchTerm={setSearchTerm} />);

    const input = screen.getByDisplayValue('initial');
    expect(input).toBeInTheDocument();

    // Type something
    fireEvent.change(input, { target: { value: 'new value' } });

    // Should not be called immediately
    expect(setSearchTerm).not.toHaveBeenCalled();

    // Advance timers by 300ms
    act(() => {
        jest.advanceTimersByTime(300);
    });

    // Should be called now
    expect(setSearchTerm).toHaveBeenCalledWith('new value');
  });

  test('works with value and onChange (standard props)', () => {
    const onChange = jest.fn();

    render(<SearchBox value="test" onChange={onChange} />);

    const input = screen.getByDisplayValue('test');
    expect(input).toBeInTheDocument();

    // Type something
    fireEvent.change(input, { target: { value: 'updated' } });

    // Input should update immediately (local state)
    expect(input.value).toBe('updated');

    // onChange should not be called immediately
    expect(onChange).not.toHaveBeenCalled();

    // Advance timers
    act(() => {
        jest.advanceTimersByTime(300);
    });

    // onChange should be called with new value
    expect(onChange).toHaveBeenCalledWith('updated');
  });

  test('updates when prop changes (controlled)', () => {
    const { rerender } = render(<SearchBox value="initial" />);
    const input = screen.getByDisplayValue('initial');

    rerender(<SearchBox value="external update" />);

    expect(input.value).toBe('external update');
  });
});
