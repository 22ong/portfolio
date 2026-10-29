import './family-center-detail.css';

// The separate cover belongs to the list. Display only the complete portfolio
// original here, including its own opening artwork, without cropping it.
const originals = import.meta.glob('./assets/family-center/portfolio.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const source = (name) => Object.entries(originals).find(([path]) => path.split('/').pop().startsWith(`${name}.`))?.[1];
export const familyCenterArtwork = { portfolio: source('portfolio') };
export const hasFamilyCenterArtwork = Boolean(familyCenterArtwork.portfolio);

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

export function renderFamilyCenterDetail(project, nextProject, artwork = familyCenterArtwork) {
  return `<main class="work-page family-center-detail" id="page-content" aria-labelledby="family-center-heading">
    <h1 class="sr-only" id="family-center-heading">${escapeHTML(project.title)}.</h1>
    <div class="family-center-images">
      <img class="family-center-image family-center-portfolio" src="${escapeHTML(artwork.portfolio)}" alt="가족센터 전체 포트폴리오: Overview, Mood board, Design System, As-is, To-be" width="1920" height="9154" fetchpriority="high" decoding="async" />
    </div>
    <nav class="family-center-navigation" aria-label="프로젝트 탐색">
      <a class="work-back-link" href="/#work"><span aria-hidden="true">←</span> BACK TO WORK</a>
      ${nextProject ? `<a class="work-back-link family-center-next" href="${escapeHTML(nextProject.link)}"><span>NEXT PROJECT</span><span>${escapeHTML(nextProject.title)} <span aria-hidden="true">↗</span></span></a>` : ''}
    </nav>
  </main>`;
}
