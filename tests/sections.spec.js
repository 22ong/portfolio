import { test, expect, devices } from '@playwright/test';
import { scrollAbout } from './helpers.js';

test('header links smoothly reach Work, About and Contact', async ({ page }) => {
  await page.goto('/');
  for (const [name, id] of [['About', 'about'], ['Contact', 'contact'], ['Work', 'work']]) {
    await page.locator('.header').getByRole('navigation').getByRole('link', { name, exact: name !== 'Work' }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect.poll(() => page.locator(`#${id}`).evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(id === 'work' ? 0 : 80);
  }
});

test('About uses a sticky statement with three large principles and a compact tool list', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about')).toHaveClass(/is-reading-focused/);
  await expect(page.locator('.about-principle h3')).toHaveText(['UI DESIGN', 'WEB DESIGN', 'INTERACTION']);
  await expect(page.locator('.about-tools li')).toHaveText(['Figma', 'Photoshop', 'Illustrator', 'HTML / CSS', 'JavaScript']);
  const top = await page.locator('#about').evaluate((node) => node.offsetTop);
  for (const distance of [200, 350]) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), top + distance);
    await expect.poll(() => page.locator('.about-statement').evaluate((node) => node.getBoundingClientRect().top)).toBe(90);
  }
  for (const [index, principle] of (await page.locator('.about-principle').all()).entries()) {
    await scrollAbout(page, index);
    await expect(principle).toHaveClass(/is-keyword-active/);
    await expect(principle).toHaveClass(/is-revealed/);
  }
  await page.locator('.about-tools').scrollIntoViewIfNeeded();
  await expect(page.locator('.about-tools')).toHaveClass(/is-revealed/);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator('.about-tools')).toHaveClass(/is-revealed/);
});

test('Contact placeholders acknowledge clicks without opening fake destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contact h2')).toHaveText("LET'S MAKESOMETHINGMEMORABLE.");
  await expect(page.locator('#contact form')).toHaveCount(0);
  await expect(page.locator('.contact-socials .social-link')).toHaveCount(3);
  await expect(page.locator('.contact-socials')).toContainText('GITHUB');
  const email = page.locator('.contact-email');
  await expect(email).toHaveText('hello@example.com↗');
  await email.scrollIntoViewIfNeeded();
  await email.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.contact-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.contact-dialog')).not.toBeVisible();
  await expect(email).toBeFocused();
  await page.locator('.contact-title-link').click();
  await expect(page.locator('.contact-dialog')).toBeVisible();
  await page.getByRole('button', { name: '확인', exact: true }).click();
  await expect(page.locator('.contact-dialog')).not.toBeVisible();
  await expect(page.locator('#contact .contact-footer')).toContainText('DESIGNED & DEVELOPED BY');
});

test('Contact has a larger independent cursor and restores the native pointer', async ({ page }) => {
  await page.goto('/');
  for (const selector of ['.contact-title-link', '.contact-email']) {
    const target = page.locator(selector);
    await target.scrollIntoViewIfNeeded();
    await target.hover();
    await expect(page.locator('.contact-cursor')).toHaveClass(/is-visible/);
    await expect(page.locator('.project-cursor')).not.toHaveClass(/is-visible/);
    const size = await page.locator('.contact-cursor').evaluate((node) => node.offsetWidth);
    expect(size).toBeGreaterThan(await page.locator('.project-cursor').evaluate((node) => node.offsetWidth));
    expect(size).toBeLessThanOrEqual(150);
    await expect(page.locator('.contact-cursor-disc')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await expect(target).toHaveCSS('cursor', 'none');
    await page.mouse.move(20, 20);
    await expect(page.locator('.contact-cursor')).not.toHaveClass(/is-visible/);
    await expect(page.locator('.contact-cursor')).toHaveCSS('opacity', '0');
    await expect(page.locator('.contact-cursor-disc')).toHaveCSS('transform', 'matrix(0.7, 0, 0, 0.7, 0, 0)');
    await expect(target).not.toHaveCSS('cursor', 'none');
  }
});

test('new sections stack on tablets and touch devices, with no overflow or custom cursor', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 13'], baseURL: 'http://127.0.0.1:5173' });
  const page = await context.newPage();
  await page.goto('/');
  for (const [width, height] of [[360, 800], [390, 844], [820, 1180]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.about-statement')).toHaveCSS('position', 'static');
    for (const [first, second] of [['.about-statement', '.about-information'], ['.contact-invitation', '.contact-bottom']]) {
      const a = await page.locator(first).boundingBox();
      const b = await page.locator(second).boundingBox();
      expect(b.y).toBeGreaterThan(a.y + a.height);
    }
  }
  await expect(page.locator('.contact-cursor')).toHaveCSS('display', 'none');
  await context.close();
});

test('reduced motion keeps all About content readable without reveal movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.about-reveal').first()).toHaveClass(/is-revealed/);
  const visible = await page.locator('.about-reveal').evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).opacity === '1' && getComputedStyle(node).transform === 'none'));
  expect(visible).toBe(true);
});
