from playwright.sync_api import sync_playwright

def verify_ux_loading_states():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Log all requests to debug
        def handle_request(route):
            print(f"Request: {route.request.url}")
            # If it's our target API, delay it
            if "send-otp" in route.request.url:
                print("Intercepting send-otp...")
                import time
                time.sleep(2) # Wait 2 seconds (increased)
                try:
                    route.fulfill(status=200, body='{"otp": "12345"}')
                except Exception as e:
                    print(f"Error fulfilling send-otp: {e}")
            elif "verify-otp" in route.request.url:
                print("Intercepting verify-otp...")
                import time
                time.sleep(2) # Wait 2 seconds (increased)
                mock_response = '''
                {
                    "tokens": {
                        "access": "fake_access_token",
                        "refresh": "fake_refresh_token"
                    },
                    "user": {
                        "phone_number": "09123456789",
                        "role": "manager"
                    }
                }
                '''
                try:
                    route.fulfill(status=200, body=mock_response)
                except Exception as e:
                    print(f"Error fulfilling verify-otp: {e}")
            else:
                route.continue_()

        page.route("**/*", handle_request)

        # Navigate to the login page
        print("Navigating to login page...")
        page.goto("http://localhost:3000/login/manager")

        print("Filling phone number...")
        page.fill('input[name="phone"]', "09123456789")

        print("Clicking submit button...")
        # Start clicking
        page.click('button[type="submit"]')

        print("Waiting for loading spinner on phone form...")
        # Check if spinner exists. The spinner has class 'animate-spin'
        try:
            # Spinner might be quick, but we delayed network by 2s
            page.wait_for_selector('.animate-spin', state='visible', timeout=5000)
            print("✅ SUCCESS: Loading spinner found on phone form!")
            page.screenshot(path="/home/jules/verification/loading_state_phone.png")
        except Exception as e:
            print(f"❌ FAILURE: Loading spinner NOT found on phone form. {e}")
            page.screenshot(path="/home/jules/verification/failed_loading_phone.png")

        print("Waiting for OTP form...")
        # Wait for "Digits" input (aria-label="رقم 1")
        try:
            page.wait_for_selector('input[aria-label="رقم 1"]', timeout=5000)
            print("✅ SUCCESS: OTP form loaded and aria-labels verified!")
        except Exception as e:
            print(f"❌ FAILURE: OTP form did not load. {e}")
            browser.close()
            return

        print("Filling OTP...")
        # We removed auto-submit, so we fill all 5 digits then click button
        page.fill('input[aria-label="رقم 1"]', "1")
        page.fill('input[aria-label="رقم 2"]', "2")
        page.fill('input[aria-label="رقم 3"]', "3")
        page.fill('input[aria-label="رقم 4"]', "4")
        page.fill('input[aria-label="رقم 5"]', "5")

        print("Clicking verify button...")
        # Wait for button to be enabled (it enables when length is 5)
        # We use a short wait to ensure state update happened
        page.wait_for_timeout(500)

        try:
            page.click('button:has-text("ورود به سامانه")', timeout=5000)
        except Exception as e:
             print(f"❌ FAILURE: Could not click verify button. {e}")
             page.screenshot(path="/home/jules/verification/failed_click_otp.png")
             browser.close()
             return

        print("Waiting for loading spinner on OTP form...")
        try:
            page.wait_for_selector('.animate-spin', state='visible', timeout=5000)
            print("✅ SUCCESS: Loading spinner found on OTP form!")
            page.screenshot(path="/home/jules/verification/loading_state_otp.png")
        except Exception as e:
            print(f"❌ FAILURE: Loading spinner NOT found on OTP form. {e}")
            page.screenshot(path="/home/jules/verification/failed_loading_otp.png")

        browser.close()

if __name__ == "__main__":
    verify_ux_loading_states()
