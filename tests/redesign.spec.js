import { test, expect, devices } from '@playwright/test';

test('Redesign opens from the main category and Back to Work returns to the sticky work section', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('[data-category-link="redesign"]');
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/redesign\/$/);
  await expect(page.locator('h1')).toHaveText('REDESIGN.');
  await expect(page.locator('.header .nav-link').first()).toHaveAttribute('href', '/#work');
  await expect(page.locator('.header .nav-secondary').nth(0)).toHaveAttribute('href', '/#about');
  await expect(page.locator('.header .nav-secondary').nth(1)).toHaveAttribute('href', '/#contact');
  await page.locator('.work-page-intro .work-back-link').click();
  await expect(page).toHaveURL(/\/#work$/);
  await expect.poll(() => page.locator('.work-sticky').evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(0);
  await expect(page.locator('.category-row.is-active')).toHaveAttribute('data-category', 'redesign');
});

test('Redesign lists three large projects with data-driven metadata and real detail links', async ({ page }) => {
  await page.goto('/redesign/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.work-page-intro-bottom > p')).toContainText('기존 브랜드의 문제를 발견하고,');
  await expect(page.locator('.work-entry')).toHaveCount(3);
  await expect(page.locator('.work-entry h2')).toHaveText(['가족센터↗', 'TANGLE↗', 'MONAMI↗']);
  await expect(page.locator('.work-entry-number')).toHaveText(['01', '02', '03']);
  await expect(page.locator('.work-entry-facts')).toContainText(['—', '2026', '2026']);
  await expect(page.locator('.work-thumbnail').nth(0)).toHaveAttribute('href', '/redesign/family-center');
  await expect(page.locator('.work-thumbnail img').first()).toHaveAttribute('src', '/images/family-center-cover.png');
  await expect(page.locator('.work-thumbnail img').first()).toHaveCSS('object-fit', 'contain');
  await expect(page.locator('.work-thumbnail').nth(1)).toHaveAttribute('href', '/redesign/tangle/')
  await expect(page.locator('.work-thumbnail').nth(2)).toHaveAttribute('href', '/redesign/monami/');
  const a = await page.locator('.work-thumbnail').nth(0).boundingBox();
  const b = await page.locator('.work-thumbnail').nth(1).boundingBox();
  expect(a.width).toBeGreaterThan(page.viewportSize().width * .8);
  expect(a.height).toBeGreaterThan(600);
  expect(b.y).toBeGreaterThan(a.y + a.height + 150);
  await page.locator('.work-thumbnail').nth(2).scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.work-thumbnail img').evaluateAll((nodes) => nodes.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
});

test('thumbnail cursor reuses the home style, follows smoothly, and restores the native pointer', async ({ page }) => {
  await page.goto('/redesign/');
  const target = page.locator('.work-thumbnail').first();
  await target.scrollIntoViewIfNeeded();
  await target.hover({ position: { x: 300, y: 250 } });
  const cursor = page.locator('.work-list-cursor');
  await expect(cursor).toHaveClass(/is-visible/);
  await expect(cursor).toContainText('VIEWMORE');
  await expect(cursor).toHaveCSS('width', '128px');
  await expect(target).toHaveCSS('cursor', 'none');
  await expect(target.locator('img')).toHaveCSS('transform', 'matrix(1.025, 0, 0, 1.025, 0, 0)');
  const rect = await target.boundingBox();
  const x = Math.round(rect.x + 500), y = Math.round(rect.y + 300);
  await page.mouse.move(x, y);
  await expect.poll(() => cursor.evaluate((node) => Math.round(node.getBoundingClientRect().x + node.offsetWidth / 2))).toBe(x);
  await page.mouse.move(20, 20);
  await expect(cursor).not.toHaveClass(/is-visible/);
  await expect(target).not.toHaveCSS('cursor', 'none');
  await target.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/redesign\/family-center\/?$/);
});

test('all project routes load directly, reload, and return through list, history and header navigation', async ({ page }) => {
  for (const [slug, title] of [['family-center', '가족센터'], ['tangle', 'TANGLE'], ['monami', 'MONAMI']]) {
    await page.goto('/redesign/');
    await page.goto(`/redesign/${slug}/`);
    await page.reload();
    await expect(page.locator('h1')).toHaveText(`${title}.`);
    if (slug === 'family-center') await expect(page.locator('.family-center-image')).toHaveCount(1);
    else await expect(page.locator('.detail-preparing')).toContainText('이 프로젝트의 이야기를 준비하고 있습니다.');
    await page.goBack();
    await expect(page.locator('h1')).toHaveText('REDESIGN.');
    await page.goForward();
    await expect(page.locator('h1')).toHaveText(`${title}.`);
    await page.locator('.header .nav-link').first().click();
    await expect(page).toHaveURL(/\/#work$/);
    await expect(page.locator('#hero-heading')).toContainText('명확하게 보여주고,');
  }
});

test('tablet and mobile keep a vertical list with tap navigation and no custom cursor', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 13'], baseURL: 'http://127.0.0.1:5173' });
  const page = await context.newPage();
  await page.goto('/redesign/');
  for (const [width, height] of [[320, 700], [390, 844], [820, 1180]]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator('.work-list-cursor')).toHaveCSS('display', 'none');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const boxes = await page.locator('.work-thumbnail').evaluateAll((nodes) => nodes.map((node) => { const rect = node.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom }; }));
    expect(boxes[1].top).toBeGreaterThan(boxes[0].bottom);
  }
  await page.locator('.work-thumbnail').nth(2).tap();
  await expect(page.locator('h1')).toHaveText('MONAMI.');
  await context.close();
});

test('new routes respect reduced motion and load assets without browser errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/redesign/', '/redesign/family-center', '/redesign/tangle/', '/redesign/monami/']) {
    await page.goto(route, { waitUntil: 'networkidle' });
    await expect(page.locator('.work-page')).toHaveCSS('animation-name', 'none');
    await page.evaluate(() => document.fonts.ready);
  }
  await page.goto('/redesign/');
  await page.locator('.work-thumbnail').first().hover();
  await expect(page.locator('.work-thumbnail img').first()).toHaveCSS('transform', 'none');
  expect(errors).toEqual([]);
});

test('stationary pointer stays custom during thumbnail scrolling and defaults to an arrow elsewhere', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/redesign/');
  await page.evaluate(() => document.fonts.ready);
  const cursor = page.locator('.work-list-cursor');
  await page.mouse.move(200, 500);
  await expect(cursor).not.toHaveClass(/is-visible/);
  await page.locator('.work-thumbnail').first().evaluate((node) => scrollTo({ top: node.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }));
  await expect(cursor).toHaveClass(/is-visible/);
  await expect(page.locator('.work-thumbnail').first()).toHaveClass(/has-work-cursor/);

  await page.evaluate(() => {
    window.cursorSamples = [];
    window.recordCursor = true;
    function sample() {
      const hit = document.elementFromPoint(200, 500);
      window.cursorSamples.push(getComputedStyle(hit).cursor);
      if (window.recordCursor) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
  await expect(cursor).toHaveClass(/is-visible/);
  await expect(page.locator('.work-thumbnail').first()).toHaveCSS('cursor', 'none');

  await page.locator('.work-entry-title h2 a').first().evaluate((node) => {
    const rect = node.getBoundingClientRect();
    scrollTo({ top: rect.top + scrollY + rect.height / 2 - 500, behavior: 'instant' });
  });
  await expect(cursor).not.toHaveClass(/is-visible/);
  await expect(page.locator('.work-entry-title h2 a').first()).toHaveCSS('cursor', 'default');
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.elementFromPoint(200, 500)).cursor)).toBe('default');

  await page.locator('.work-thumbnail').nth(1).evaluate((node) => scrollTo({ top: node.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }));
  await expect(page.locator('.work-thumbnail').nth(1)).toHaveClass(/has-work-cursor/);
  await expect(cursor).toHaveClass(/is-visible/);
  await expect(page.locator('.work-thumbnail').first()).not.toHaveClass(/has-work-cursor/);
  const samples = await page.evaluate(() => { window.recordCursor = false; return window.cursorSamples; });
  expect(samples.length).toBeGreaterThan(0);
  expect(samples).not.toContain('pointer');
  await page.locator('.work-entry').nth(1).locator('h2 a').click();
  await expect(page.locator('h1')).toHaveText('TANGLE.');
});

test('family center uses its exact data URL and redirects to a reloadable detail page', async ({ page, request }) => {
  const response = await request.get('/redesign/family-center', { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe('/redesign/family-center/');
  await page.goto('/redesign/');
  await page.locator('.work-thumbnail').first().click();
  await expect(page.locator('h1')).toHaveText('가족센터.');
  await page.reload();
  await expect(page.locator('h1')).toHaveText('가족센터.');
  await expect(page.locator('.family-center-image')).toHaveCount(1);
  await expect(page.locator('.family-center-cover')).toHaveCount(0);
  await expect(page.locator('.family-center-portfolio')).toHaveAttribute('src', /portfolio\.png/);
});
