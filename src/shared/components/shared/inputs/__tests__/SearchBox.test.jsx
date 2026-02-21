/* global jest, describe, it, expect */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBox from "../SearchBox";

describe("SearchBox", () => {
  it("renders input with placeholder", () => {
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
    const input = screen.getByPlaceholderText("جستجو...");
    expect(input).toBeInTheDocument();
  });

  it("updates value on change", () => {
    const setSearchTerm = jest.fn();
    render(<SearchBox searchTerm="" setSearchTerm={setSearchTerm} />);
    const input = screen.getByPlaceholderText("جستجو...");
    fireEvent.change(input, { target: { value: "test" } });
    expect(setSearchTerm).toHaveBeenCalledWith("test");
  });

  it("focuses input on Ctrl+K", () => {
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
    const input = screen.getByPlaceholderText("جستجو...");

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(input).toHaveFocus();
  });

  it("focuses input on Cmd+K (Mac)", () => {
    render(<SearchBox searchTerm="" setSearchTerm={() => {}} />);
    const input = screen.getByPlaceholderText("جستجو...");

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(input).toHaveFocus();
  });
});
