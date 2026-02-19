from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:5173/about")
            page.goto("http://localhost:5173/about")

            # Wait for content
            print("Waiting for search box...")
            page.wait_for_selector('input[placeholder="جستجو..."]')

            # Verify initial state
            print("Checking input presence...")
            search_input = page.locator('input[placeholder="جستجو..."]')

            # Take initial screenshot
            page.screenshot(path="/home/jules/verification/before_focus.png")
            print("Screenshot before focus saved.")

            # Verify hint
            print("Verifying hint...")
            # The hint text is "Ctrl K" inside a kbd element inside a div with dir="ltr"
            hint = page.locator('kbd:has-text("Ctrl K")')
            if hint.count() > 0:
                print("Hint found!")
            else:
                print("Hint NOT found! Maybe OS detection thinks it is Mac?")
                # Check for "Cmd K" just in case
                cmd_hint = page.locator('kbd:has-text("⌘ K")')
                if cmd_hint.count() > 0:
                    print("Mac hint found!")
                else:
                    print("No hint found!")

            # Test functionality
            print("Testing focus...")
            # Make sure input is blurred first
            page.evaluate("document.activeElement.blur()")

            # Press Ctrl+K
            # We simulate both just in case linux needs "Control+K"
            page.keyboard.press("Control+K")

            # Check focus
            is_focused = page.evaluate("document.activeElement === document.querySelector('input[placeholder=\"جستجو...\"]')")
            print(f"Is focused: {is_focused}")

            # Take screenshot after focus
            page.screenshot(path="/home/jules/verification/after_focus.png")
            print("Screenshot after focus saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
