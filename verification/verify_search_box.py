from playwright.sync_api import sync_playwright, expect

def test_search_box():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the test page
        # Note: We need to wait a bit for Vite to start or check output,
        # but usually it's fast. We'll try port 5174 as specified.
        page.goto("http://localhost:5174/test-search-box.html")

        # Wait for SearchBox to be visible
        # The input has aria-label="جستجو"
        search_input = page.get_by_label("جستجو")
        expect(search_input).to_be_visible()

        # Take screenshot of empty state
        page.screenshot(path="verification/search_box_empty.png")

        # Type something
        search_input.fill("Hello World")

        # Check if clear button appears
        # The clear button has aria-label="پاک کردن جستجو"
        clear_button = page.get_by_label("پاک کردن جستجو")
        expect(clear_button).to_be_visible()

        # Take screenshot of filled state
        page.screenshot(path="verification/search_box_filled.png")

        # Click clear button
        clear_button.click()

        # Verify input is empty
        expect(search_input).to_have_value("")

        # Verify clear button is gone
        expect(clear_button).not_to_be_visible()

        # Take screenshot of cleared state
        page.screenshot(path="verification/search_box_cleared.png")

        browser.close()

if __name__ == "__main__":
    test_search_box()
