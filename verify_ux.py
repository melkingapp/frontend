from playwright.sync_api import Page, expect, sync_playwright

def test_search_box_ux(page: Page):
    # 1. Go to the test page
    page.goto("http://localhost:5173/test-ux")

    # 2. Check if SearchBox is visible
    search_input = page.get_by_role("textbox", name="جستجو")
    expect(search_input).to_be_visible()

    # 3. Check if hint is visible
    # The text inside is "Ctrl", "+", "K" in spans.
    # We can check for "Ctrl" text.
    # Note: aria-hidden elements might be ignored by get_by_text if strictly accessible?
    # But let's try.
    # Also wait a bit to ensure hydration if any (though unlikely for this simple component).

    # 4. Press Control+k (lowercase k)
    page.keyboard.press("Control+k")

    # 5. Check if input is focused
    expect(search_input).to_be_focused()

    # 6. Screenshot
    page.screenshot(path="/home/jules/verification/ux_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_search_box_ux(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
            page.screenshot(path="/home/jules/verification/ux_failure.png")
        finally:
            browser.close()
