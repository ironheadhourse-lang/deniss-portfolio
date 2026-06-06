const yearNode = document.querySelector('[data-year]');
if (yearNode) yearNode.textContent = new Date().getFullYear();


const caseGrid = document.querySelector('[data-case-grid]');
const modal = document.querySelector('[data-case-modal]');
const modalContent = document.querySelector('[data-case-modal-content]');

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
        <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}">
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
  modalContent.innerHTML = `
    <div class="case-modal-hero">
      <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}">
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
      ${images.map(function(src){ return `<img src="${escapeHtml(src)}" alt="${escapeHtml(item.title)}">`; }).join('')}
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
}

renderCaseCards();
if (caseGrid) {
  caseGrid.addEventListener('click', function(event) {
    const card = event.target.closest('[data-case-index]');
    if (card) openCase(Number(card.dataset.caseIndex));
  });
}
document.querySelectorAll('[data-close-modal]').forEach(function(node) {
  node.addEventListener('click', closeCase);
});
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') closeCase();
});
