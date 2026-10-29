import '@fontsource-variable/dm-sans';
import '@fontsource-variable/noto-sans-kr';
import './style.css';
import { categories, profile } from './data.js';
import { renderAboutAndContact, initSections } from './sections.js';
import { initMotion } from './motion.js';
import { renderOrbit, initOrbits } from './orbits.js';
import { initAboutReading } from './reading.js';
import './category-transition.css';

const allProjects = categories.flatMap((category) => category.projects);

document.querySelector('#app').innerHTML = `
  <a class="skip-link" href="#work">프로젝트 탐색으로 건너뛰기</a>
  <header class="header">
    <a class="wordmark" href="#top" aria-label="${profile.nameKo} — 처음으로">sy<span class="wordmark-dot">.</span></a>
    <a class="header-role" href="#top">${profile.name}<span>${profile.role}</span></a>
    <nav aria-label="메인 내비게이션">
      <a class="nav-link is-current" href="#work">Work <span class="nav-count">${String(allProjects.length).padStart(2, '0')}</span></a>
      <a class="nav-link nav-secondary" href="#about">About</a>
      <a class="nav-link nav-secondary" href="#contact">Contact</a>
    </nav>
  </header>
  <main>
    <section class="hero" id="top" aria-labelledby="hero-heading">
      <div class="hero-topline"><span class="eyebrow"><span class="status-dot"></span> THINK CLEAR. MAKE IT MATTER.</span><span class="edition">PORTFOLIO — 2026</span></div>
      <a class="hero-target" href="#work" aria-label="선택한 프로젝트 탐색하기">
        <div class="hero-title-row">
          <h1 id="hero-heading">명확하게 보여주고,<br>기억에 남게 <span class="title-ending">만듭니다<svg class="title-mark" viewBox="0 0 450 20" aria-hidden="true"><path d="M4 13C120 2 295 3 444 10" /></svg></span><span class="title-period">.</span></h1>
          <span class="hero-arrow hero-orbit" aria-hidden="true"><span class="hero-orbit-measure">↗</span>${renderOrbit('hero')}</span>
        </div>
        <div class="hero-intro">
          <p><span class="hero-lead">정보는 쉽게, 브랜드의 매력은 선명하게 전달합니다.</span><span class="hero-support">사용자와 브랜드 사이, 더 나은 경험을 디자인합니다.</span></p>
          <span class="intro-label" aria-hidden="true"></span>
          <span class="touch-cta">프로젝트 보기 <span aria-hidden="true">↗</span></span>
        </div>
      </a>
      <div class="hero-bottom">
        <a class="scroll-cue" href="#work"><span class="scroll-icon" aria-hidden="true">↓</span> SCROLL TO EXPLORE</a>
        <p>생각을 정리하고, 경험을 설계하고,<br>작은 차이를 만드는 디자이너 <strong>${profile.nameKo}</strong>입니다.</p>
        <span class="hero-coordinate">SEOUL, KR <span aria-hidden="true">↗</span></span>
      </div>
    </section>
    <section class="work" id="work" aria-labelledby="work-heading">
      <div class="work-sticky">
        <div class="section-topline"><h2 class="eyebrow" id="work-heading">SELECTED WORK</h2><span class="section-aside">A FEW WAYS I THINK & CREATE <span aria-hidden="true">↙</span></span></div>
        <div class="work-layout">
          <div class="category-panel">
            <div class="category-list" aria-label="프로젝트 카테고리">
              ${categories.map((category, index) => `
                <div class="category-row${index === 0 ? ' is-active' : ''}" data-category="${category.id}">
                  <span class="category-number">${String(index + 1).padStart(2, '0')}</span>
                  <div class="category-copy">
                    <a class="category-link" href="${category.link ?? `#${category.id}`}" data-category-link="${category.id}"${category.link ? '' : ' aria-haspopup="dialog"'}>${category.title}<span class="category-arrow" aria-hidden="true">↗</span></a>
                    <p class="category-label">${category.label}</p>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="category-detail"><span class="detail-marker" aria-hidden="true"><svg width="19" height="22" viewBox="0 0 19 22"><path d="M2 2v10h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.2" /></svg></span><p class="category-description">${categories[0].description}</p></div>
            <div class="work-scroll-cue"><span class="current-step">01</span><span class="category-progress" aria-hidden="true"><span></span></span><span class="total-step">03</span><span class="keep-scrolling">SCROLL TO DISCOVER <span aria-hidden="true">↓</span></span></div>
          </div>
          <div class="visual-panel">
            <div class="visual-topline"><span><span class="live-dot" aria-hidden="true"></span> A GLIMPSE OF THE WORK</span><button class="motion-toggle" type="button" aria-label="대표 이미지 자동 전환 일시정지" aria-pressed="false"><span class="pause-icon" aria-hidden="true">Ⅱ</span><span class="motion-label">PAUSE</span></button></div>
            <div class="visual-stage" role="group" aria-roledescription="자동 순환 프로젝트 비주얼" aria-label="카테고리별 프로젝트 미리보기">
              <div class="visual-card">
              ${allProjects.map((project, index) => `<img class="project-image${index === 0 ? ' is-visible' : ''}" data-project="${project.id}"${project.imageFit ? ` data-image-fit="${project.imageFit}"` : ''} src="${project.image}" alt="${project.alt}" width="1200" height="1000" ${index > 0 ? 'aria-hidden="true"' : ''} draggable="false">`).join('')}
              <span class="visual-badge">${categories[0].projects[0].badge ?? `CONCEPT / ${categories[0].projects[0].year}`}</span>
              </div>
            </div>
            <div class="project-meta">
              <div><h3 class="project-title">${categories[0].projects[0].title}</h3><p class="project-subtitle">${categories[0].projects[0].subtitle}</p></div>
              <div class="project-meta-right"><span class="project-type">${categories[0].projects[0].category}</span><div class="slide-indicators" aria-label="현재 이미지 1 / 3"></div></div>
            </div>
          </div>
        </div>
        <div class="work-bottom"><span>STRATEGY MEETS CURIOSITY.</span><span class="work-counter">01 — REDESIGN</span></div>
      </div>
    </section>
    ${renderAboutAndContact()}
  </main>
  <div class="project-cursor" aria-hidden="true"><span>VIEW<br>PROJECT</span><span class="cursor-arrow">↗</span></div>
  <span class="sr-only category-announcement" role="status" aria-live="polite"></span>
  <dialog class="category-dialog" aria-labelledby="dialog-heading"><button class="dialog-close" type="button" aria-label="닫기">×</button><p class="eyebrow">A CLOSER LOOK</p><h2 id="dialog-heading"></h2><p class="dialog-message">이 카테고리의 자세한 이야기는 곧 이어집니다.</p><button class="dialog-continue" type="button">탐색 계속하기 <span aria-hidden="true">↗</span></button></dialog>
`;

// Native sticky preserves normal scroll, keyboard navigation and reverse scroll.
// Each category receives two viewports of desktop scroll travel, including the
// last one. The touch layout keeps a shorter, equally divided scroll distance.
const work = document.querySelector('.work');
const sticky = document.querySelector('.work-sticky');
const rows = [...document.querySelectorAll('.category-row')];
const description = document.querySelector('.category-description');
const images = [...document.querySelectorAll('.project-image')];
const visualStage = document.querySelector('.visual-stage');
const indicators = document.querySelector('.slide-indicators');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const mobile = matchMedia('(max-width: 760px)');
const SLIDE_DURATION = 3600;
let activeCategory = 0;
let activeProject = 0;
let paused = false;
let inView = false;
let timer;
const visualCard = visualStage.querySelector('.visual-card');
let categoryAnimations = [];
let outgoingCard;
let transitioning = false;
let transitionVersion = 0;

function clearCategoryTransition() {
  transitionVersion++;
  categoryAnimations.forEach((animation) => animation.cancel());
  categoryAnimations = [];
  outgoingCard?.remove();
  outgoingCard = null;
  transitioning = false;
  visualStage.classList.remove('is-category-transitioning');
}

function transitionCategory(snapshot, direction) {
  const rect = visualStage.getBoundingClientRect();
  if (motionPreference.matches || !visualCard.animate || rect.bottom <= 0 || rect.top >= innerHeight) return;
  const version = transitionVersion;
  transitioning = true;
  visualStage.classList.add('is-category-transitioning');
  outgoingCard = document.createElement('div');
  outgoingCard.className = 'category-card-ghost';
  outgoingCard.setAttribute('aria-hidden', 'true');
  snapshot.className = 'category-card-image';
  snapshot.removeAttribute('data-project');
  snapshot.removeAttribute('aria-hidden');
  outgoingCard.append(snapshot, visualCard.querySelector('.visual-badge').cloneNode(true));
  visualStage.append(outgoingCard);
  const options = { easing: 'cubic-bezier(.22,.65,.25,1)', fill: 'both' };
  const shadow = '0 14px 32px #24272316';
  categoryAnimations = [
    outgoingCard.animate([
      { transform: 'translateX(0) rotateY(0) scale(1)', opacity: 1, offset: 0 },
      { transform: `translateX(${-direction * 5}%) rotateY(${-direction * 18}deg) scale(.97)`, opacity: 1, offset: .65 },
      { transform: `translateX(${-direction * 8}%) rotateY(${-direction * 24}deg) scale(.95)`, opacity: 0, boxShadow: shadow, offset: 1 },
    ], { ...options, duration: 340 }),
    visualCard.animate([
      { transform: `translateX(${direction * 8}%) rotateY(${direction * 24}deg) scale(.95)`, opacity: 0, boxShadow: shadow },
      { transform: `translateX(${direction * 5}%) rotateY(${direction * 18}deg) scale(.97)`, opacity: 1, offset: .25 },
      { transform: 'translateX(0) rotateY(0) scale(1)', opacity: 1, boxShadow: '0 0 0 #24272300' },
    ], { ...options, duration: 440, delay: 340 }),
  ];
  categoryAnimations[1].onfinish = () => {
    if (version !== transitionVersion) return;
    clearCategoryTransition();
    scheduleSlide();
  };
}

function showProject({ reset = false } = {}) {
  const category = categories[activeCategory];
  const project = category.projects[activeProject];
  // Cross-fade only within a category. On category changes, finish any previous
  // fade immediately so no outgoing category can remain visible underneath.
  if (reset) visualStage.classList.add('is-resetting');
  for (const image of images) {
    const visible = image.dataset.project === project.id;
    image.classList.toggle('is-visible', visible);
    image.setAttribute('aria-hidden', String(!visible));
  }
  if (reset) {
    // Commit the new opacity/scale with transitions disabled before restoring
    // the normal 0.5s fade for the next automatic slide.
    void visualStage.offsetWidth;
    visualStage.classList.remove('is-resetting');
  }
  document.querySelector('.project-title').textContent = project.title;
  document.querySelector('.project-subtitle').textContent = project.subtitle;
  document.querySelector('.project-type').textContent = project.category;
  document.querySelector('.visual-badge').textContent = project.badge ?? `CONCEPT / ${project.year}`;
  indicators.innerHTML = category.projects.map((_, index) => `<span class="slide-indicator${index === activeProject ? ' is-active' : ''}" aria-hidden="true"></span>`).join('');
  indicators.setAttribute('aria-label', `현재 이미지 ${activeProject + 1} / ${category.projects.length}`);
}

function scheduleSlide() {
  clearTimeout(timer);
  if (paused || transitioning || motionPreference.matches || !inView || document.hidden) return;
  timer = setTimeout(() => {
    activeProject = (activeProject + 1) % categories[activeCategory].projects.length;
    showProject();
    scheduleSlide();
  }, SLIDE_DURATION);
}

function setCategory(index) {
  if (index === activeCategory) return;
  clearTimeout(timer);
  // Freeze one complete outgoing image, including when an automatic fade is
  // underway. The new category is a separate opaque panel, never a mixed slide.
  const snapshot = images.find((image) => image.classList.contains('is-visible')).cloneNode(true);
  const previousBadge = visualCard.querySelector('.visual-badge').textContent;
  const direction = Math.sign(index - activeCategory);
  clearCategoryTransition();
  activeCategory = index;
  activeProject = 0;
  const category = categories[index];
  rows.forEach((row, rowIndex) => {
    row.classList.toggle('is-active', rowIndex === index);
    const link = row.querySelector('a');
    if (rowIndex === index) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  description.textContent = category.description;
  document.querySelector('.current-step').textContent = String(index + 1).padStart(2, '0');
  document.querySelector('.work-counter').textContent = `${String(index + 1).padStart(2, '0')} — ${category.title}`;
  document.querySelector('.category-announcement').textContent = `${index + 1} / 3, ${category.title}. ${category.label}`;
  showProject({ reset: true });
  transitionCategory(snapshot, direction);
  if (outgoingCard) outgoingCard.querySelector('.visual-badge').textContent = previousBadge;
  scheduleSlide();
}

let scrollFrame = 0;
function updateScroll() {
  scrollFrame = 0;
  const travel = work.offsetHeight - sticky.offsetHeight;
  const progress = Math.max(0, Math.min(1, -work.getBoundingClientRect().top / Math.max(1, travel)));
  setCategory(Math.min(categories.length - 1, Math.floor(progress * categories.length)));
  const rect = sticky.getBoundingClientRect();
  if (transitioning && (rect.bottom <= 0 || rect.top >= innerHeight)) clearCategoryTransition();
  document.querySelector('.category-progress > span').style.transform = `scaleX(${Math.max(0.03, progress)})`;
}
function queueScrollUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}
addEventListener('scroll', queueScrollUpdate, { passive: true });
addEventListener('resize', queueScrollUpdate);
mobile.addEventListener('change', queueScrollUpdate);
rows[0].querySelector('a').setAttribute('aria-current', 'true');
showProject();
updateScroll();

new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  scheduleSlide();
}, { threshold: 0.15 }).observe(sticky);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearCategoryTransition();
  scheduleSlide();
});

const motionButton = document.querySelector('.motion-toggle');
function updateMotionButton() {
  const stopped = paused || motionPreference.matches;
  motionButton.setAttribute('aria-pressed', String(stopped));
  motionButton.setAttribute('aria-label', motionPreference.matches ? '움직임 줄이기 설정으로 자동 전환 정지됨' : stopped ? '대표 이미지 자동 전환 재생' : '대표 이미지 자동 전환 일시정지');
  document.querySelector('.pause-icon').textContent = stopped ? '▷' : 'Ⅱ';
  document.querySelector('.motion-label').textContent = motionPreference.matches ? 'REDUCED MOTION' : stopped ? 'PLAY' : 'PAUSE';
  motionButton.disabled = motionPreference.matches;
  scheduleSlide();
}
motionButton.addEventListener('click', () => { paused = !paused; updateMotionButton(); });
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) clearCategoryTransition();
  updateMotionButton();
});
updateMotionButton();

// Only this hero link replaces the native pointer, and only on a fine pointer.
const target = document.querySelector('.hero-target');
const cursor = document.querySelector('.project-cursor');
let cursorX = 0, cursorY = 0, mouseX = 0, mouseY = 0, cursorFrame = 0;
let cursorInside = false;
function animateCursor() {
  const ease = motionPreference.matches ? 1 : 0.18;
  cursorX += (mouseX - cursorX) * ease;
  cursorY += (mouseY - cursorY) * ease;
  cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
  if (cursorInside) cursorFrame = requestAnimationFrame(animateCursor);
}
function hideCursor() {
  cursorInside = false;
  cursor.classList.remove('is-visible');
  target.classList.remove('has-custom-cursor');
  cancelAnimationFrame(cursorFrame);
}
function showCursor(event) {
  if (!finePointer.matches || event.pointerType === 'touch') return;
  mouseX = cursorX = event.clientX;
  mouseY = cursorY = event.clientY;
  cursorInside = true;
  cursor.classList.add('is-visible');
  target.classList.add('has-custom-cursor');
  animateCursor();
}
target.addEventListener('pointerenter', showCursor);
target.addEventListener('pointermove', (event) => {
  if (!cursorInside) showCursor(event);
  mouseX = event.clientX;
  mouseY = event.clientY;
});
target.addEventListener('pointerleave', hideCursor);
target.addEventListener('click', hideCursor);
target.addEventListener('pointercancel', hideCursor);
addEventListener('blur', hideCursor);
addEventListener('scroll', hideCursor, { passive: true });
finePointer.addEventListener('change', hideCursor);

// Set categories[].link to connect future detail pages; no broken routes today.
const dialog = document.querySelector('.category-dialog');
document.querySelectorAll('[data-category-link]').forEach((link) => {
  const category = categories.find((item) => item.id === link.dataset.categoryLink);
  if (category.link) return;
  link.addEventListener('click', (event) => {
    event.preventDefault();
    document.querySelector('#dialog-heading').textContent = category.title;
    dialog.showModal();
  });
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.dialog-continue').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

initSections();
initAboutReading();
initMotion();
initOrbits();
