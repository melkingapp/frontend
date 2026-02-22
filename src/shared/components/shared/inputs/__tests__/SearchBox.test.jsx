/* global jest, describe, it, expect */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchBox from '../SearchBox';

// Fake timers are needed for testing debounce
jest.useFakeTimers();

describe('SearchBox Component', () => {
    it('updates the input value immediately but delays calling setSearchTerm', () => {
        const setSearchTerm = jest.fn();
        const initialTerm = '';

        // Render the component
        render(
            <SearchBox searchTerm={initialTerm} setSearchTerm={setSearchTerm} delay={500} />
        );

        const input = screen.getByPlaceholderText('جستجو...');

        // Simulate typing "hello"
        fireEvent.change(input, { target: { value: 'hello' } });

        // Assert input value updates immediately (optimistic UI)
        expect(input.value).toBe('hello');

        // Assert setSearchTerm is NOT called immediately due to debounce
        expect(setSearchTerm).not.toHaveBeenCalled();

        // Fast-forward time by 300ms (less than delay)
        act(() => {
            jest.advanceTimersByTime(300);
        });
        expect(setSearchTerm).not.toHaveBeenCalled();

        // Fast-forward time by another 300ms (total > 500ms)
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // Now it should be called
        expect(setSearchTerm).toHaveBeenCalledWith('hello');
        expect(setSearchTerm).toHaveBeenCalledTimes(1);
    });

    it('syncs local value when searchTerm prop changes externally', () => {
        const setSearchTerm = jest.fn();
        const { rerender } = render(
            <SearchBox searchTerm="initial" setSearchTerm={setSearchTerm} />
        );

        const input = screen.getByPlaceholderText('جستجو...');
        expect(input.value).toBe('initial');

        // Update prop from outside
        rerender(<SearchBox searchTerm="updated" setSearchTerm={setSearchTerm} />);

        expect(input.value).toBe('updated');
    });
});
