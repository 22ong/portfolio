import '@fontsource-variable/dm-sans';
import '@fontsource-variable/noto-sans-kr';
import './style.css';
import './sections.css';
import './redesign.css';
import { profile } from './data.js';
import { redesign } from './work-data.js';
import { renderPageHeader } from './page-header.js';
import { initHoverCursor } from './hover-cursor.js';
import { hasFamilyCenterArtwork, renderFamilyCenterDetail } from './family-center-detail.js';

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const slug = (globalThis.__PORTFOLIO_PREVIEW_PATH__ ?? location.pathname).split('/').filter(Boolean)[1];
const project = redesign.projects.find((item) => item.id === slug);
const footer = `<footer class="work-page-footer"><span>© 2026 ${escapeHTML(profile.name)}</span><span>THINK CLEAR. MAKE IT MATTER.</span><a href="/#work">BACK TO WORK <span aria-hidden="true">↗</span></a></footer>`;

function projectEntry(item) {
  return `<article class="work-entry" aria-labelledby="${item.id}-heading">
    <a class="work-thumbnail" href="${escapeHTML(item.link)}" aria-label="${escapeHTML(item.title)} 프로젝트 자세히 보기" draggable="false" data-work-cursor>
      <img${item.thumbnailFit === 'contain' ? ' class="is-cover-thumbnail"' : ''} src="${escapeHTML(item.thumbnail)}" alt="${escapeHTML(item.alt)}" width="1200" height="1000" draggable="false" loading="${item.number === '01' ? 'eager' : 'lazy'}" />
      <span class="work-thumbnail-hint" aria-hidden="true">VIEW PROJECT <span>↗</span></span>
    </a>
    <div class="work-entry-meta"><span class="work-entry-number">${escapeHTML(item.number)}</span>
      <div class="work-entry-title"><h2 id="${item.id}-heading"><a href="${escapeHTML(item.link)}">${escapeHTML(item.title)}<span aria-hidden="true">↗</span></a></h2><p>${escapeHTML(item.description)}</p></div>
      <p class="work-entry-facts"><span>${escapeHTML(item.year)}</span><span>${escapeHTML(item.category)}</span></p>
    </div>
  </article>`;
}

function renderList() {
  return `<main class="work-page" id="page-content">
    <section class="work-page-intro" aria-labelledby="redesign-heading">
      <div class="work-page-eyebrow"><p class="eyebrow"><span class="section-number">${redesign.number}</span> SELECTED WORK</p><span>${String(redesign.projects.length).padStart(2, '0')} PROJECTS</span></div>
      <h1 id="redesign-heading">${redesign.title}<span class="work-page-point" aria-hidden="true">.</span></h1>
      <div class="work-page-intro-bottom"><a class="work-back-link" href="/#work"><span aria-hidden="true">←</span> BACK TO WORK</a><p>${escapeHTML(redesign.description)}</p></div>
    </section>
    <section class="work-project-list" aria-label="REDESIGN 프로젝트 목록">${redesign.projects.map(projectEntry).join('')}</section>
    ${footer}
  </main><div class="project-cursor work-list-cursor" aria-hidden="true"><span>VIEW<br>MORE</span><span class="cursor-arrow">↗</span></div>`;
}

function renderPlaceholder(item) {
  return `<main class="work-page work-detail-placeholder" id="page-content">
    <a class="work-back-link" href="/redesign/"><span aria-hidden="true">←</span> ALL REDESIGN</a>
    <div class="detail-placeholder-copy"><p class="eyebrow"><span class="section-number">${item.number}</span> REDESIGN / ${escapeHTML(item.year)}</p>
      <h1>${escapeHTML(item.title)}<span class="work-page-point" aria-hidden="true">.</span></h1>
      <p class="detail-preparing">이 프로젝트의 이야기를 준비하고 있습니다.</p>
      <p class="detail-description">${escapeHTML(item.description)}</p>
    </div>
    <img class="detail-placeholder-image" src="${escapeHTML(item.thumbnail)}" alt="${escapeHTML(item.alt)}" width="1200" height="1000" />
    <div class="detail-return"><a class="work-back-link" href="/redesign/">← ALL REDESIGN</a><a class="work-back-link" href="/#work">BACK TO WORK ↗</a></div>
    ${footer}
  </main>`;
}

document.title = `${project?.title ?? redesign.title} — ${profile.name}`;
document.body.classList.toggle('redesign-list-page', !project);
const nextProject = project && redesign.projects[redesign.projects.indexOf(project) + 1];
const content = project?.id === 'family-center' && hasFamilyCenterArtwork
  ? renderFamilyCenterDetail(project, nextProject)
  : project ? renderPlaceholder(project) : renderList();
document.querySelector('#app').innerHTML = `<a class="skip-link" href="#page-content">본문으로 건너뛰기</a>${renderPageHeader()}${content}`;
if (!project) initHoverCursor([...document.querySelectorAll('[data-work-cursor]')], document.querySelector('.work-list-cursor'));
