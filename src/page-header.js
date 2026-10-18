import { categories, profile } from './data.js';

// The main page remains untouched; secondary pages use its exact header style
// and content, with cross-page anchors back to the actual home sections.
export function renderPageHeader() {
  const count = categories.reduce((total, category) => total + category.projects.length, 0);
  return `<header class="header">
    <a class="wordmark" href="/#top" aria-label="${profile.nameKo} — 처음으로">jh<span class="wordmark-dot">.</span></a>
    <a class="header-role" href="/#top">${profile.name}<span>${profile.role}</span></a>
    <nav aria-label="메인 내비게이션">
      <a class="nav-link is-current" href="/#work">Work <span class="nav-count">${String(count).padStart(2, '0')}</span></a>
      <a class="nav-link nav-secondary" href="/#about">About</a>
      <a class="nav-link nav-secondary" href="/#contact">Contact</a>
    </nav>
  </header>`;
}
