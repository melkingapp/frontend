import { test, expect } from '@playwright/test';

test.describe('Building Joining Flow - E2E Tests', () => {
  // Test data
  const testUsers = {
    manager: {
      phone: '09100000000',
      password: 'testpass123',
      role: 'manager'
    },
    resident: {
      phone: '09111111111',
      password: 'testpass123',
      role: 'resident'
    },
    newResident: {
      phone: '09122222222',
      password: 'testpass123',
      role: 'resident'
    },
    familyMember: {
      phone: '09133333333',
      password: 'testpass123',
      role: 'resident'
    }
  };

  const buildingData = {
    code: 'ABC123',
    title: 'Test Building'
  };

  test.describe('Complete Resident Joining Flow', () => {
    test('resident can join building via building code', async ({ page, context }) => {
      // Step 1: Login as resident
      await page.goto('/login');
      await page.fill('[data-testid="phone-input"]', testUsers.newResident.phone);
      await page.fill('[data-testid="password-input"]', testUsers.newResident.password);
      await page.click('[data-testid="login-button"]');

      // Wait for login and redirect
      await page.waitForURL('**/dashboard');

      // Step 2: Navigate to join page
      await page.goto('/join');

      // Step 3: Select building code option
      await page.click('[data-testid="building-code-option"]');

      // Step 4: Fill membership request form
      await page.fill('[data-testid="building-code-input"]', buildingData.code);
      await page.fill('[data-testid="full-name-input"]', 'New Resident');
      await page.fill('[data-testid="phone-input"]', testUsers.newResident.phone);
      await page.fill('[data-testid="unit-number-input"]', '201');
      await page.fill('[data-testid="floor-input"]', '2');
      await page.fill('[data-testid="area-input"]', '85');
      await page.fill('[data-testid="resident-count-input"]', '1');
      await page.selectOption('[data-testid="role-select"]', 'resident');

      // Submit request
      await page.click('[data-testid="submit-request-btn"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('درخواست عضویت با موفقیت ارسال شد');

      // Step 5: Login as manager to approve
      const managerPage = await context.newPage();
      await managerPage.goto('/login');
      await managerPage.fill('[data-testid="phone-input"]', testUsers.manager.phone);
      await managerPage.fill('[data-testid="password-input"]', testUsers.manager.password);
      await managerPage.click('[data-testid="login-button"]');
      await managerPage.waitForURL('**/dashboard');

      // Navigate to membership requests
      await managerPage.goto('/manager/membership-requests');

      // Find and approve the request
      await managerPage.click('[data-testid="approve-btn-201"]');

      // Verify approval
      await expect(managerPage.locator('[data-testid="approval-success"]')).toBeVisible();

      // Step 6: Verify resident is now a building member
      await page.reload();
      await expect(page.locator('[data-testid="building-member-badge"]')).toBeVisible();
      await expect(page.locator('[data-testid="building-list"]')).toContainText(buildingData.title);
    });
  });

  test.describe('Manager Suggests User Flow', () => {
    test('manager can suggest user and user can join', async ({ page, context }) => {
      // Step 1: Login as manager
      await page.goto('/login');
      await page.fill('[data-testid="phone-input"]', testUsers.manager.phone);
      await page.fill('[data-testid="password-input"]', testUsers.manager.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('**/dashboard');

      // Step 2: Go to membership management
      await page.goto('/manager/membership-management');

      // Step 3: Create suggested user
      await page.click('[data-testid="suggest-user-btn"]');
      await page.fill('[data-testid="building-code-input"]', buildingData.code);
      await page.fill('[data-testid="full-name-input"]', 'Suggested User');
      await page.fill('[data-testid="phone-input"]', '09144444444');
      await page.fill('[data-testid="unit-number-input"]', '301');
      await page.fill('[data-testid="floor-input"]', '3');
      await page.fill('[data-testid="area-input"]', '90');
      await page.fill('[data-testid="resident-count-input"]', '2');
      await page.selectOption('[data-testid="role-select"]', 'resident');

      await page.click('[data-testid="submit-suggestion-btn"]');

      // Verify suggestion created
      await expect(page.locator('[data-testid="suggestion-success"]')).toBeVisible();

      // Step 4: Login as the suggested user (assuming user exists)
      const userPage = await context.newPage();
      await userPage.goto('/login');
      await userPage.fill('[data-testid="phone-input"]', '09144444444');
      await userPage.fill('[data-testid="password-input"]', 'testpass123');
      await userPage.click('[data-testid="login-button"]');
      await userPage.waitForURL('**/dashboard');

      // Step 5: Verify suggested membership is available
      await expect(userPage.locator('[data-testid="suggested-membership-notice"]')).toBeVisible();
      await expect(userPage.locator('[data-testid="suggested-membership-notice"]')).toContainText('اطلاعات شما توسط مدیر ثبت شده');

      // Step 6: Accept the suggestion
      await userPage.click('[data-testid="accept-suggestion-btn"]');

      // Verify membership is activated
      await expect(userPage.locator('[data-testid="membership-activated"]')).toBeVisible();
      await expect(userPage.locator('[data-testid="building-member-badge"]')).toBeVisible();
    });
  });

  test.describe('Family Invitation Flow', () => {
    test('resident can invite family member and they can join', async ({ page, context }) => {
      // Step 1: Login as resident
      await page.goto('/login');
      await page.fill('[data-testid="phone-input"]', testUsers.resident.phone);
      await page.fill('[data-testid="password-input"]', testUsers.resident.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('**/dashboard');

      // Step 2: Go to family invitations page
      await page.goto('/resident/family-invitations');

      // Step 3: Create family invitation
      await page.click('[data-testid="create-invitation-btn"]');
      await page.fill('[data-testid="building-select"]', buildingData.title);
      await page.fill('[data-testid="unit-number-input"]', '101');
      await page.fill('[data-testid="invited-phone-input"]', testUsers.familyMember.phone);
      await page.fill('[data-testid="expires-at-input"]', '2025-12-31T23:59:59');

      await page.click('[data-testid="submit-invitation-btn"]');

      // Verify invitation created and get invitation code
      await expect(page.locator('[data-testid="invitation-created"]')).toBeVisible();
      const invitationCode = await page.locator('[data-testid="invitation-code"]').textContent();

      // Step 4: Family member receives and uses invitation
      const familyPage = await context.newPage();

      // Simulate receiving invitation link
      await familyPage.goto(`/join/family/${invitationCode}`);

      // Login as family member
      await familyPage.fill('[data-testid="phone-input"]', testUsers.familyMember.phone);
      await familyPage.fill('[data-testid="password-input"]', testUsers.familyMember.password);
      await familyPage.click('[data-testid="login-button"]');

      // Accept invitation
      await familyPage.click('[data-testid="accept-invitation-btn"]');

      // Verify successful join
      await expect(familyPage.locator('[data-testid="invitation-accepted"]')).toBeVisible();
      await expect(familyPage.locator('[data-testid="building-member-badge"]')).toBeVisible();

      // Verify invitation status updated
      await page.reload();
      await expect(page.locator(`[data-testid="invitation-${invitationCode}"]`)).toContainText('accepted');
    });
  });

  test.describe('Transfer Management Flow', () => {
    test('manager can transfer building management to another manager', async ({ page, context }) => {
      // Step 1: Login as current manager
      await page.goto('/login');
      await page.fill('[data-testid="phone-input"]', testUsers.manager.phone);
      await page.fill('[data-testid="password-input"]', testUsers.manager.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('**/dashboard');

      // Step 2: Go to building settings
      await page.goto('/manager/building-settings');

      // Step 3: Initiate management transfer
      await page.click('[data-testid="transfer-management-btn"]');

      // Fill transfer form
      await page.fill('[data-testid="new-manager-phone-input"]', '09155555555'); // New manager phone
      await page.fill('[data-testid="transfer-reason-input"]', 'انتقال مدیریت به دلایل شخصی');

      // Confirm transfer
      await page.click('[data-testid="confirm-transfer-btn"]');

      // Handle confirmation modal
      await page.click('[data-testid="final-confirm-btn"]');

      // Verify transfer initiated
      await expect(page.locator('[data-testid="transfer-initiated"]')).toBeVisible();

      // Step 4: New manager accepts transfer (assuming new manager exists)
      const newManagerPage = await context.newPage();
      await newManagerPage.goto('/login');
      await newManagerPage.fill('[data-testid="phone-input"]', '09155555555');
      await newManagerPage.fill('[data-testid="password-input"]', 'testpass123');
      await newManagerPage.click('[data-testid="login-button"]');
      await newManagerPage.waitForURL('**/dashboard');

      // Check for transfer notification
      await expect(newManagerPage.locator('[data-testid="transfer-notification"]')).toBeVisible();

      // Accept transfer
      await newManagerPage.click('[data-testid="accept-transfer-btn"]');

      // Verify transfer completed
      await expect(newManagerPage.locator('[data-testid="transfer-completed"]')).toBeVisible();

      // Step 5: Verify old manager no longer manages building
      await page.reload();
      await expect(page.locator('[data-testid="building-manager-badge"]')).not.toBeVisible();

      // Verify new manager now manages building
      await expect(newManagerPage.locator('[data-testid="building-manager-badge"]')).toBeVisible();
      await expect(newManagerPage.locator('[data-testid="building-list"]')).toContainText(buildingData.title);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid building code', async ({ page }) => {
      // Login as resident
      await page.goto('/login');
      await page.fill('[data-testid="phone-input"]', testUsers.newResident.phone);
      await page.fill('[data-testid="password-input"]', testUsers.newResident.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('**/dashboard');

      // Try to join with invalid building code
      await page.goto('/join');
      await page.click('[data-testid="building-code-option"]');

      await page.fill('[data-testid="building-code-input"]', 'INVALID');
      await page.fill('[data-testid="full-name-input"]', 'Test User');
      await page.fill('[data-testid="phone-input"]', testUsers.newResident.phone);
      await page.fill('[data-testid="unit-number-input"]', '999');

      await page.click('[data-testid="submit-request-btn"]');

      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('ساختمان یافت نشد');
    });

    test('should handle expired invitation link', async ({ page }) => {
      // Try to use expired invitation code
      await page.goto('/join/family/EXPIRED123');

      // Login
      await page.fill('[data-testid="phone-input"]', testUsers.familyMember.phone);
      await page.fill('[data-testid="password-input"]', testUsers.familyMember.password);
      await page.click('[data-testid="login-button"]');

      // Try to accept
      await page.click('[data-testid="accept-invitation-btn"]');

      // Verify error
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('منقضی شده');
    });
  });

  test.describe('Performance Tests', () => {
    test('joining flow should complete within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      // Login
      await page.goto('/login');
      await page.fill('[data-testid="phone-input"]', testUsers.newResident.phone);
      await page.fill('[data-testid="password-input"]', testUsers.newResident.password);
      await page.click('[data-testid="login-button"]');

      // Navigate and submit request
      await page.goto('/join');
      await page.click('[data-testid="building-code-option"]');

      await page.fill('[data-testid="building-code-input"]', buildingData.code);
      await page.fill('[data-testid="full-name-input"]', 'Performance Test User');
      await page.fill('[data-testid="phone-input"]', '09166666666');
      await page.fill('[data-testid="unit-number-input"]', '401');

      await page.click('[data-testid="submit-request-btn"]');

      // Wait for success
      await page.waitForSelector('[data-testid="success-message"]');

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 10 seconds
      expect(duration).toBeLessThan(10000);
    });
  });
});
