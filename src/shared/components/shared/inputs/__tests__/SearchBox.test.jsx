/* global describe, test, expect */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBox from '../SearchBox';

describe('SearchBox', () => {
  test('renders with placeholder', () => {
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
    expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
  });

  test('focuses input on Ctrl+K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
    const input = screen.getByPlaceholderText('جستجو...');

    // Simulate Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true, code: 'KeyK' });

    expect(input).toHaveFocus();
  });

  test('focuses input on Cmd+K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
    const input = screen.getByPlaceholderText('جستجو...');

    // Simulate Cmd+K
    fireEvent.keyDown(window, { key: 'k', metaKey: true, code: 'KeyK' });

    expect(input).toHaveFocus();
  });

  test('does not focus on just K', () => {
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
    const input = screen.getByPlaceholderText('جستجو...');

    // Simulate K without modifier
    fireEvent.keyDown(window, { key: 'k', code: 'KeyK' });

    expect(input).not.toHaveFocus();
  });
});
