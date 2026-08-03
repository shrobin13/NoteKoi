import { test, expect } from "@playwright/test";

const ADMIN = {
  email: "sheikhrobin116981@gmail.com",
  password: "Password@123",
};
const SUB_ADMIN = {
  email: "subadmin@demouniversity.com",
  password: "SubAdmin@123",
};
const TEACHER = {
  email: "teacher@demouniversity.com",
  password: "Teacher@123",
};
const STUDENT_CR = {
  email: "student1@demouniversity.com",
  password: "Student@123",
};
const STUDENT = {
  email: "student2@demouniversity.com",
  password: "Student@123",
};

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole("button", { name: /Sign In/i }).click();
  await page.waitForURL("/", { timeout: 10_000 });
}

async function logout(page: import("@playwright/test").Page) {
  await page.goto("/profile");
  await page.click("text=Sign Out");
  await page.waitForURL("/login", { timeout: 5_000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC — capture JS console errors on the login page
// ─────────────────────────────────────────────────────────────────────────────
test("login page: no JS console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("401")) errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/login");
  // Wait for full hydration
  await page.waitForTimeout(2000);

  if (errors.length) {
    console.error("JS errors on login page:", errors.join("\n"));
  }
  expect(errors).toHaveLength(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
test("login: admin can sign in and reaches home", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");

  await page.fill('input[type="email"]', ADMIN.email);
  await page.fill('input[type="password"]', ADMIN.password);
  await page.getByRole("button", { name: /Sign In/i }).click();

  await page.waitForURL("/", { timeout: 10_000 });
  await expect(page).toHaveURL("/");

  // Should show Discover heading
  await expect(page.getByRole("heading", { name: /Discover/i })).toBeVisible();
  expect(errors).toHaveLength(0);
});

test("login: wrong password shows error message", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', ADMIN.email);
  await page.fill('input[type="password"]', "wrongpassword");
  await page.getByRole("button", { name: /Sign In/i }).click();
  await page.waitForTimeout(3000);
  // Should still be on login page
  await expect(page).toHaveURL("/login");
  // Should show an error message
  const errorText = page.locator("p.text-rose-400, .text-rose-400");
  await expect(errorText.first()).toBeVisible();
});

test("login: all 5 accounts work", async ({ page }) => {
  const accounts = [ADMIN, SUB_ADMIN, TEACHER, STUDENT_CR, STUDENT];
  for (const acc of accounts) {
    await page.goto("/login");
    await page.fill('input[type="email"]', acc.email);
    await page.fill('input[type="password"]', acc.password);
    await page.getByRole("button", { name: /Sign In/i }).click();
    await page.waitForURL("/", { timeout: 8_000 });
    await expect(page).toHaveURL("/");

    // Logout for next iteration
    await page.goto("/profile");
    await page.click("text=Sign Out");
    await page.waitForURL("/login", { timeout: 5_000 });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DISCOVER / HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────
test("home: shows role pill after admin login", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  // Role pill should show PLATFORM ADMIN
  await expect(page.locator("text=PLATFORM ADMIN")).toBeVisible({ timeout: 5_000 });
});

test("home: sidebar has admin links for admin user", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await expect(page.locator("text=Colleges & Departments")).toBeVisible();
  await expect(page.locator("text=Sub Admins")).toBeVisible();
  await expect(page.locator("text=Analytics & Logs")).toBeVisible();
});

test("home: sidebar has moderation links for sub admin", async ({ page }) => {
  await login(page, SUB_ADMIN.email, SUB_ADMIN.password);
  await expect(page.locator("text=Moderation Queue")).toBeVisible();
  await expect(page.locator("text=Verify Teachers")).toBeVisible();
  await expect(page.locator("text=CR Assignments")).toBeVisible();
});

test("home: sidebar has CR review queue for CR student", async ({ page }) => {
  await login(page, STUDENT_CR.email, STUDENT_CR.password);
  // CR assignment is loaded asynchronously; give it time to appear
  await expect(page.locator("text=Review Queue")).toBeVisible({ timeout: 8_000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE PAGE
// ─────────────────────────────────────────────────────────────────────────────
test("profile: shows user info", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/profile");
  await expect(page.getByText(ADMIN.email)).toBeVisible();
  await expect(page.getByText("PLATFORM ADMIN")).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PAGES
// ─────────────────────────────────────────────────────────────────────────────
test("admin: colleges & departments page loads", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/admin/structure");
  await expect(page.getByRole("heading", { name: /Structural CRUD/i })).toBeVisible();
  // Should show Demo University from seed data
  await expect(page.getByText("Demo University")).toBeVisible({ timeout: 8_000 });
});

test("admin: sub admins page loads", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/admin/sub-admins");
  await expect(page.getByRole("heading", { name: /Sub Admin/i }).first()).toBeVisible();
});

test("admin: analytics page loads", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/admin/analytics");
  await expect(page.getByRole("heading", { name: /Analytics/i })).toBeVisible();
});

test("admin: resource override page loads", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/admin/override");
  await expect(page.getByRole("heading", { name: /Override/i })).toBeVisible();
});

test("admin: emergency appointment page loads", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/admin/emergency-appointment");
  await expect(page.getByRole("heading", { name: /Emergency/i })).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// SUB ADMIN PAGES
// ─────────────────────────────────────────────────────────────────────────────
test("sub-admin: moderation queue page loads", async ({ page }) => {
  await login(page, SUB_ADMIN.email, SUB_ADMIN.password);
  await page.goto("/manage/sub-admin/queue");
  await expect(page.getByRole("heading", { name: /Moderation/i })).toBeVisible();
});

test("sub-admin: teacher verifications page loads", async ({ page }) => {
  await login(page, SUB_ADMIN.email, SUB_ADMIN.password);
  await page.goto("/manage/sub-admin/teacher-verifications");
  await expect(page.getByRole("heading", { name: /Teacher/i })).toBeVisible();
});

test("sub-admin: CR assignments page loads", async ({ page }) => {
  await login(page, SUB_ADMIN.email, SUB_ADMIN.password);
  await page.goto("/manage/sub-admin/cr-assignments");
  await expect(page.getByRole("heading", { name: /CR/i }).first()).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// CR / MODERATION
// ─────────────────────────────────────────────────────────────────────────────
test("cr: review queue page loads", async ({ page }) => {
  await login(page, STUDENT_CR.email, STUDENT_CR.password);
  await page.goto("/moderate/cr");
  await expect(page.getByRole("heading", { name: /CR Moderation Queue/i })).toBeVisible({ timeout: 8_000 });
});

test("cr: student verifications page loads", async ({ page }) => {
  await login(page, STUDENT_CR.email, STUDENT_CR.password);
  await page.goto("/moderate/cr/student-verifications");
  await expect(page.getByRole("heading", { name: /Student/i })).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────────────────────────────────────
test("search: page loads and shows filter controls", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/search");
  // Search input should be visible
  await expect(page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]').first()).toBeVisible({ timeout: 8_000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD
// ─────────────────────────────────────────────────────────────────────────────
test("upload: wizard loads with resource type selection", async ({ page }) => {
  await login(page, STUDENT_CR.email, STUDENT_CR.password);
  await page.goto("/upload");
  await expect(page.getByRole("heading", { name: /Share a Resource/i })).toBeVisible({ timeout: 8_000 });
  // Resource type buttons should be present
  await expect(page.getByText("Class Notes")).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// MY UPLOADS
// ─────────────────────────────────────────────────────────────────────────────
test("my-uploads: page loads", async ({ page }) => {
  await login(page, STUDENT_CR.email, STUDENT_CR.password);
  await page.goto("/my-uploads");
  await expect(page.getByRole("heading", { name: /Your uploaded resources/i })).toBeVisible({ timeout: 8_000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
test("notifications: page loads", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/notifications");
  await expect(page.getByRole("heading", { name: /Your activity feed/i })).toBeVisible({ timeout: 8_000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// BROWSE
// ─────────────────────────────────────────────────────────────────────────────
test("browse: department cards appear on home and are clickable", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/");
  // Should show department cards
  await expect(page.getByText("Computer Science")).toBeVisible({ timeout: 8_000 });
  // Click the CS department
  await page.getByText("Computer Science").click();
  await page.waitForURL(/\/browse\/.+/, { timeout: 5_000 });
  // Should show sessions
  await expect(page.getByText("2023-24")).toBeVisible({ timeout: 5_000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
test("logout: signs out and redirects to login", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto("/profile");
  await page.click("text=Sign Out");
  await page.waitForURL("/login", { timeout: 5_000 });
  await expect(page).toHaveURL("/login");
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH GUARD
// ─────────────────────────────────────────────────────────────────────────────
test("auth guard: unauthenticated access to profile redirects to login", async ({ page }) => {
  await page.goto("/profile");
  await page.waitForURL("/login", { timeout: 8_000 });
  await expect(page).toHaveURL("/login");
});
