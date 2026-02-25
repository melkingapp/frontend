/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchBox from '../SearchBox';

describe('SearchBox Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('updates input value immediately but debounces setSearchTerm call', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');

    // Type 'test'
    fireEvent.change(input, { target: { value: 'test' } });

    // Input should update immediately (local state)
    expect(input.value).toBe('test');

    // setSearchTerm should NOT be called yet
    expect(setSearchTerm).not.toHaveBeenCalled();

    // Fast-forward time by 200ms
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(setSearchTerm).not.toHaveBeenCalled();

    // Fast-forward time by another 100ms (total 300ms)
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Now it should be called
    expect(setSearchTerm).toHaveBeenCalledWith('test');
  });

  it('syncs input value when searchTerm prop changes', () => {
    const setSearchTerm = jest.fn();
    const { rerender } = render(<SearchBox searchTerm="initial" setSearchTerm={setSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');
    expect(input.value).toBe('initial');

    // Simulate prop change from parent
    rerender(<SearchBox searchTerm="updated" setSearchTerm={setSearchTerm} />);

    expect(input.value).toBe('updated');
  });

  it('clears input when searchTerm prop is reset to empty string', () => {
    const setSearchTerm = jest.fn();
    const { rerender } = render(<SearchBox searchTerm="test" setSearchTerm={setSearchTerm} />);

    const input = screen.getByPlaceholderText('جستجو...');
    expect(input.value).toBe('test');

    // Simulate reset
    rerender(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);

    expect(input.value).toBe('');
  });
});
