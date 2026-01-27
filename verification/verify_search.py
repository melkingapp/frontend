from playwright.sync_api import sync_playwright, expect
import time

def verify_search(page):
    page.goto("http://localhost:5173/test-search")

    # Wait for the search box
    input_box = page.get_by_placeholder("جستجو...")
    expect(input_box).to_be_visible()

    # Type something
    input_box.fill("Hello World")

    # Verify clear button appears (it has aria-label="پاک کردن جستجو")
    clear_btn = page.get_by_label("پاک کردن جستجو")
    expect(clear_btn).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification/search_box.png")

    # Click clear
    clear_btn.click()

    # Verify cleared
    expect(input_box).to_have_value("")

    # Take screenshot of cleared state
    page.screenshot(path="verification/search_box_cleared.png")
    print("Verification successful")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_search(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
