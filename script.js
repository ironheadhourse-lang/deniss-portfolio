const yearNode = document.querySelector('[data-year]');
if (yearNode) yearNode.textContent = new Date().getFullYear();

const caseGrid = document.querySelector('[data-case-grid]');
const modal = document.querySelector('[data-case-modal]');
const modalContent = document.querySelector('[data-case-modal-content]');

let currentCaseImages = [];
let currentImageIndex = 0;

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, function (char) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char];
  });
}

function renderCaseCards() {
  if (!caseGrid || !Array.isArray(window.PORTFOLIO_CASES)) return;
  caseGrid.innerHTML = window.PORTFOLIO_CASES.map(function(item, index) {
    return `
      <button class="case-card" type="button" data-case-index="${index}">
        <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy">
        <span class="case-card-overlay">
          <p class="tag">${escapeHtml(item.category)}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.summary)}</p>
        </span>
      </button>
    `;
  }).join('');
}

function openCase(index) {
  const item = window.PORTFOLIO_CASES && window.PORTFOLIO_CASES[index];
  if (!item || !modal || !modalContent) return;
  const images = Array.isArray(item.images) ? item.images : [];
  const process = Array.isArray(item.process) ? item.process : [];
  const tools = Array.isArray(item.tools) ? item.tools : [];
  currentCaseImages = images.length ? images : [item.cover];
  modalContent.innerHTML = `
    <div class="case-modal-hero">
      <button class="case-image-button" type="button" data-image-index="0" aria-label="Open image fullscreen">
        <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy">
      </button>
      <div class="case-modal-text">
        <p class="tag">${escapeHtml(item.category)}</p>
        <h2>${escapeHtml(item.title)}</h2>
        <div class="case-meta"><strong>Role:</strong><br>${escapeHtml(item.role)}</div>
        <p>${escapeHtml(item.description)}</p>
        <h3>Process</h3>
        <ol class="case-process">${process.map(function(step){ return `<li>${escapeHtml(step)}</li>`; }).join('')}</ol>
        <div class="case-tools">${tools.map(function(tool){ return `<span>${escapeHtml(tool)}</span>`; }).join('')}</div>
      </div>
    </div>
    <div class="case-modal-gallery">
      ${images.map(function(src, imageIndex){ return `<button class="case-image-button" type="button" data-image-index="${imageIndex}" aria-label="Open image fullscreen"><img src="${escapeHtml(src)}" alt="${escapeHtml(item.title)}" loading="lazy"></button>`; }).join('')}
    </div>
  `;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCase() {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  closeImageViewer(false);
}

function ensureImageViewer() {
  let viewer = document.querySelector('[data-image-viewer]');
  if (viewer) return viewer;
  viewer = document.createElement('div');
  viewer.className = 'image-viewer';
  viewer.setAttribute('data-image-viewer', '');
  viewer.setAttribute('aria-hidden', 'true');
  viewer.innerHTML = `
    <div class="image-viewer-backdrop" data-close-image-viewer></div>
    <button class="image-viewer-close" type="button" data-close-image-viewer aria-label="Close image">×</button>
    <button class="image-viewer-arrow image-viewer-prev" type="button" data-image-prev aria-label="Previous image">‹</button>
    <img class="image-viewer-img" src="" alt="Portfolio image">
    <button class="image-viewer-arrow image-viewer-next" type="button" data-image-next aria-label="Next image">›</button>
  `;
  document.body.appendChild(viewer);
  viewer.addEventListener('click', function(event) {
    if (event.target.closest('[data-close-image-viewer]')) closeImageViewer(true);
    if (event.target.closest('[data-image-prev]')) showImage(currentImageIndex - 1);
    if (event.target.closest('[data-image-next]')) showImage(currentImageIndex + 1);
  });
  let startX = 0;
  viewer.addEventListener('touchstart', function(event) {
    startX = event.changedTouches[0].clientX;
  }, { passive: true });
  viewer.addEventListener('touchend', function(event) {
    const dx = event.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) showImage(currentImageIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });
  return viewer;
}

function showImage(index) {
  if (!currentCaseImages.length) return;
  const viewer = ensureImageViewer();
  currentImageIndex = (index + currentCaseImages.length) % currentCaseImages.length;
  const img = viewer.querySelector('.image-viewer-img');
  img.src = currentCaseImages[currentImageIndex];
  viewer.classList.add('is-open');
  viewer.setAttribute('aria-hidden', 'false');
}

function closeImageViewer(keepCaseOpen) {
  const viewer = document.querySelector('[data-image-viewer]');
  if (!viewer) return;
  viewer.classList.remove('is-open');
  viewer.setAttribute('aria-hidden', 'true');
  const img = viewer.querySelector('.image-viewer-img');
  if (img) img.removeAttribute('src');
  if (!keepCaseOpen && modal && modal.classList.contains('is-open')) return;
}

renderCaseCards();

if (caseGrid) {
  caseGrid.addEventListener('click', function(event) {
    const card = event.target.closest('[data-case-index]');
    if (card) openCase(Number(card.dataset.caseIndex));
  });
}

if (modalContent) {
  modalContent.addEventListener('click', function(event) {
    const imageButton = event.target.closest('[data-image-index]');
    if (!imageButton) return;
    event.preventDefault();
    showImage(Number(imageButton.dataset.imageIndex));
  });
}

document.querySelectorAll('[data-close-modal]').forEach(function(node) {
  node.addEventListener('click', closeCase);
});

document.addEventListener('keydown', function(event) {
  const viewer = document.querySelector('[data-image-viewer]');
  const viewerOpen = viewer && viewer.classList.contains('is-open');
  if (event.key === 'Escape') {
    if (viewerOpen) closeImageViewer(true);
    else closeCase();
  }
  if (viewerOpen && event.key === 'ArrowLeft') showImage(currentImageIndex - 1);
  if (viewerOpen && event.key === 'ArrowRight') showImage(currentImageIndex + 1);
});
