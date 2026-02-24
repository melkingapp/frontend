/* global jest, describe, it, expect */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBox from '../SearchBox';

describe('SearchBox', () => {
  it('renders correctly', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);
    expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
  });

  it('updates value correctly with searchTerm prop', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(setSearchTerm).toHaveBeenCalledWith('test');
  });

  it('focuses input on Ctrl+K', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');

    // Simulate Ctrl+K on window
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    expect(input).toHaveFocus();
  });

  it('focuses input on Meta+K (Mac)', () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');

    // Simulate Meta+K on window
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    expect(input).toHaveFocus();
  });

  it('handles undefined searchTerm gracefully (crash fix)', () => {
    const setSearchTerm = jest.fn();
    // Intentionally passing undefined searchTerm to simulate broken usage if it were uncontrolled
    render(<SearchBox searchTerm={undefined} setSearchTerm={setSearchTerm} />);
    const input = screen.getByPlaceholderText('جستجو...');
    expect(input.value).toBe('');
  });

  it('does not crash when setSearchTerm is missing', () => {
    // This simulates usage where only value might be passed or nothing
    render(<SearchBox searchTerm="" />);
    const input = screen.getByPlaceholderText('جستجو...');
    fireEvent.change(input, { target: { value: 'test' } });
    // Should not throw
  });
});
