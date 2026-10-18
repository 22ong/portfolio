export async function scrollAbout(page, step) {
  await page.locator('.about-principle h3').nth(step).evaluate((heading) => {
    scrollTo({ top: heading.getBoundingClientRect().top + scrollY - innerHeight * .30, behavior: 'instant' });
  });
}
