import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('standalone preview renders and runs interactions in an isolated offline iframe', async ({ page, context }) => {
  const html = await readFile(new URL('../preview.html', import.meta.url), 'utf8');
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (/^https?:/.test(request.url())) externalRequests.push(request.url()); });
  await context.setOffline(true);
  await page.clock.install();
  await page.setContent('<body style="margin:0"><iframe name="portable" sandbox="allow-scripts" style="width:100vw;height:100vh;border:0"></iframe></body>');
  await page.locator('iframe').evaluate((iframe, content) => { iframe.srcdoc = content; }, html);
  const frame = page.frame({ name: 'portable' });
  await expect(frame.locator('h1')).toContainText('명확하게 보여주고,');
  await frame.evaluate(() => document.fonts.ready);
  await expect.poll(() => frame.locator('.project-image').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
  expect(await frame.evaluate(() => document.fonts.check('600 24px "Noto Sans KR Variable"', '명확하게'))).toBe(true);
  for (const [progress, category] of [[0.05, 'redesign'], [0.4, 'project'], [0.75, 'vibe-coding']]) {
    await frame.evaluate((progress) => {
      const work = document.querySelector('.work');
      const sticky = document.querySelector('.work-sticky');
      scrollTo({ top: work.offsetTop + (work.offsetHeight - sticky.offsetHeight) * progress, behavior: 'instant' });
    }, progress);
    await expect(frame.locator('.category-row.is-active')).toHaveAttribute('data-category', category);
    expect(await frame.locator('.work-sticky').evaluate((node) => node.getBoundingClientRect().top)).toBe(0);
    const initial = await frame.locator('.project-image.is-visible').getAttribute('data-project');
    await expect(frame.locator('.visual-stage')).not.toHaveClass(/is-category-transitioning/);
    await page.clock.fastForward(3700);
    await expect(frame.locator('.project-image.is-visible')).not.toHaveAttribute('data-project', initial);
  }
  await frame.locator('[data-category-link="vibe-coding"]').click();
  await expect(frame.getByRole('dialog')).toBeVisible();
  await frame.getByRole('button', { name: '닫기', exact: true }).click();
  await expect(frame.getByRole('dialog')).not.toBeVisible();
  await frame.locator('.about-tools').scrollIntoViewIfNeeded();
  await expect(frame.locator('.about-tools')).toHaveClass(/is-revealed/);
  await frame.locator('.contact-email').click();
  await expect(frame.locator('.contact-dialog')).toBeVisible();
  await frame.getByRole('button', { name: '확인', exact: true }).click();
  await expect(frame.locator('.contact-dialog')).not.toBeVisible();
  const pathError = await frame.locator('[data-orbit="contact"]').evaluate(async (svg) => {
    svg.pauseAnimations();
    svg.setCurrentTime(18);
    await new Promise(requestAnimationFrame);
    const path = svg.querySelector('.orbit-line');
    const local = path.getPointAtLength(path.getTotalLength() / 4);
    const expected = new DOMPoint(local.x, local.y).matrixTransform(path.getCTM());
    const actual = new DOMPoint(0, 0).matrixTransform(svg.querySelector('.orbit-traveler').getCTM());
    return Math.hypot(actual.x - expected.x, actual.y - expected.y);
  });
  expect(pathError).toBeLessThan(2);
  expect(externalRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test('standalone preview navigates through Redesign and all three details entirely offline, then restores Work', async ({ page, context }) => {
  // This journey decodes the full-resolution 7.6 MB artwork in an opaque iframe.
  test.setTimeout(90000);
  const html = await readFile(new URL('../preview.html', import.meta.url), 'utf8');
  const errors = [], requests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  await context.setOffline(true);
  await page.setContent('<body style="margin:0"><iframe name="portable" sandbox="allow-scripts" style="width:100vw;height:100vh;border:0"></iframe></body>');
  await page.locator('iframe').evaluate((iframe, content) => { iframe.srcdoc = content; }, html);
  const home = page.frame({ name: 'portable' });
  await home.locator('[data-category-link="redesign"]').click();
  await expect(home.locator('iframe[name="portfolio-route"]')).toBeVisible();
  const route = page.frame({ name: 'portfolio-route' });
  await expect(route.locator('h1')).toHaveText('REDESIGN.');
  await expect(home.locator('#app')).toHaveAttribute('inert', '');
  for (const [index, title] of [[0, '가족센터.'], [1, 'TANGLE.'], [2, 'MONAMI.']]) {
    await route.locator('.work-thumbnail').nth(index).click();
    await expect(route.locator('h1')).toHaveText(title);
    if (index === 0) {
      await expect.poll(() => route.locator('.family-center-image').evaluateAll((images) => images.length === 1 && images.every((image) => image.complete && image.naturalWidth === 1920))).toBe(true);
      await route.locator('.family-center-next').click();
      await expect(route.locator('h1')).toHaveText('TANGLE.');
    }
    await route.locator('.work-detail-placeholder > .work-back-link').click();
    await expect(route.locator('h1')).toHaveText('REDESIGN.');
  }
  await route.locator('.header .nav-link').first().click();
  await expect(home.locator('iframe[name="portfolio-route"]')).toHaveCount(0);
  await expect(home.locator('#app')).not.toHaveAttribute('inert');
  await expect.poll(() => home.locator('.work-sticky').evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(0);
  await expect(home.locator('[data-category-link="redesign"]')).toBeFocused();
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});
