/* ══ ANKO.KZ — Main JS ══════════════════════════════════════════════════════ */

/* ── Sticky header ──────────────────────────────────────── */
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

/* ── Mobile drawer ──────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');

function openDrawer() {
  hamburger.classList.add('open');
  drawer.classList.add('open');
  drawerOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  hamburger.classList.remove('open');
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
if (hamburger) hamburger.addEventListener('click', openDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

// Drawer sub-nav toggles
document.querySelectorAll('.drawer-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (target) target.classList.toggle('open');
    const arrow = btn.querySelector('.drawer-arrow');
    if (arrow) arrow.style.transform = target.classList.contains('open') ? 'rotate(180deg)' : '';
  });
});

/* ── FAQ accordion ──────────────────────────────────────── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ── Scroll reveal ──────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Filter tabs ────────────────────────────────────────── */
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const group = tab.closest('.filter-tabs');
    group.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const filter = tab.dataset.filter;
    document.querySelectorAll('[data-group]').forEach(el => {
      if (filter === 'all' || el.dataset.group === filter) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  });
});

/* ── Calculator ─────────────────────────────────────────── */
let rowId = 0;
const calcBody = document.getElementById('calcRows');
const calcResult = document.getElementById('calcResult');

function addCalcRow() {
  if (!calcBody) return;
  rowId++;
  const row = document.createElement('div');
  row.className = 'calc-row';
  row.id = 'row-' + rowId;
  row.innerHTML = `
    <input class="calc-input" placeholder="Деталь ${rowId}" type="text">
    <input class="calc-input" placeholder="Ш мм" type="number" min="1">
    <input class="calc-input" placeholder="Д мм" type="number" min="1">
    <input class="calc-input" placeholder="Кол" type="number" min="1" value="1">
    <select class="calc-select col-edge">
      <option value="none">Без кромки</option>
      <option value="1">1 сторона</option>
      <option value="2">2 стороны</option>
      <option value="4">4 стороны</option>
    </select>
    <button class="calc-remove col-remove" onclick="removeRow('row-${rowId}')">×</button>
  `;
  calcBody.appendChild(row);
}

function removeRow(id) {
  const el = document.getElementById(id);
  if (el && calcBody && calcBody.querySelectorAll('.calc-row').length > 1) el.remove();
}

function calculate() {
  if (!calcBody) return;
  const rows = calcBody.querySelectorAll('.calc-row');
  const sheetSel = document.getElementById('sheetFormat');
  const priceSel = document.getElementById('ldspPrice');
  const cutPrice = parseFloat(document.getElementById('cutPrice')?.value || 350);

  const formatMap = {
    '2750x1830': { w: 2750, h: 1830 },
    '2800x2070': { w: 2800, h: 2070 },
    '2500x1830': { w: 2500, h: 1830 }
  };
  const fmt = formatMap[sheetSel?.value] || formatMap['2750x1830'];
  const sheetPrice = parseFloat(priceSel?.value || 4200);

  let totalParts = 0, totalCuts = 0;
  let parts = [];

  rows.forEach(row => {
    const inputs = row.querySelectorAll('input[type="number"]');
    const w = parseFloat(inputs[0]?.value);
    const h = parseFloat(inputs[1]?.value);
    const qty = parseInt(inputs[2]?.value) || 1;
    if (w > 0 && h > 0) {
      for (let i = 0; i < qty; i++) parts.push({ w, h });
      totalParts += qty;
      totalCuts += qty * 2;
    }
  });

  if (parts.length === 0) { alert('Заполните хотя бы одну деталь'); return; }

  // Simple area-based sheet estimate
  const partArea = parts.reduce((s, p) => s + p.w * p.h, 0);
  const sheetArea = fmt.w * fmt.h * 0.85; // 85% efficiency
  const sheets = Math.max(1, Math.ceil(partArea / sheetArea));

  const costSheets = sheets * sheetPrice;
  const costCuts = totalCuts * cutPrice;
  const costTotal = costSheets + costCuts;

  document.getElementById('resSheets').textContent = sheets;
  document.getElementById('resCuts').textContent = totalCuts;
  document.getElementById('resCostCuts').textContent = costCuts.toLocaleString('ru-RU') + ' ₸';
  document.getElementById('resCostTotal').textContent = costTotal.toLocaleString('ru-RU') + ' ₸';

  if (calcResult) calcResult.classList.add('visible');

  // Build WA message
  let msg = 'Здравствуйте, нужен раскрой ЛДСП.\n\nДетали:\n';
  rows.forEach(row => {
    const name = row.querySelector('input[type="text"]')?.value || 'Деталь';
    const inputs = row.querySelectorAll('input[type="number"]');
    const w = inputs[0]?.value, h = inputs[1]?.value, qty = inputs[2]?.value || 1;
    if (w && h) msg += `${name}: ${w}×${h} мм × ${qty} шт\n`;
  });
  msg += `\nФормат листа: ${sheetSel?.value}\nИтого деталей: ${totalParts}`;
  document.getElementById('waCalcLink').href = 'https://wa.me/77772901402?text=' + encodeURIComponent(msg);
  calcResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Init first calc row
if (calcBody) { addCalcRow(); addCalcRow(); addCalcRow(); }
