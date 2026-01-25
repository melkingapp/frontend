from playwright.sync_api import sync_playwright, expect
import time

def verify_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to login...")
        try:
            page.goto("http://localhost:5173/login/resident")
        except Exception as e:
            print(f"Error navigating: {e}")
            return

        print("Waiting for phone input...")
        try:
            page.wait_for_selector('input[name="phone"]', timeout=5000)
        except Exception as e:
            print(f"Error waiting for selector: {e}")
            # Take screenshot anyway to debug
            page.screenshot(path="verification_error.png")
            browser.close()
            return

        print("Filling phone...")
        page.fill('input[name="phone"]', "09121234567")

        # Wait a bit for UI to settle
        time.sleep(1)

        print("Taking screenshot...")
        page.screenshot(path="verification.png")

        browser.close()
        print("Done.")

if __name__ == "__main__":
    verify_ux()
