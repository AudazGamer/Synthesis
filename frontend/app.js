const API = 'http://127.0.0.1:5000/api';

const MOCK_APPS = [
  { id: 1, name: 'Cisco Packet Tracer', category: 'education', approved: true,  sha256: 'a1b2c3d4e5f6', status: 'completed',   progress: 100, size: '485 MB', added: 'Hoy 08:30', icon: '🌐' },
  { id: 2, name: 'XAMPP 8.2',           category: 'development', approved: true,  sha256: 'f7e8d9c0b1a2', status: 'downloading', progress: 73,  size: '161 MB', added: 'Hoy 09:15', icon: '⚙️' },
  { id: 3, name: 'Visual Studio Code',  category: 'development', approved: true,  sha256: 'b3c4d5e6f7a8', status: 'downloading', progress: 42,  size: '97 MB',  added: 'Hoy 09:40', icon: '💻' },
  { id: 4, name: 'VLC Media Player',    category: 'multimedia',  approved: true,  sha256: 'c5d6e7f8a9b0', status: 'paused',     progress: 58,  size: '44 MB',  added: 'Ayer 16:00', icon: '🎬' },
  { id: 5, name: 'Steam Client',        category: 'gaming',      approved: false, sha256: 'd7e8f9a0b1c2', status: 'blocked',    progress: 0,   size: '1.2 GB', added: 'Hoy 10:00', icon: '🚫' },
  { id: 6, name: 'MySQL Workbench',     category: 'development', approved: true,  sha256: 'e9f0a1b2c3d4', status: 'completed',  progress: 100, size: '64 MB',  added: 'Ayer 11:30', icon: '🗄️' },
];

const STATUS_CONFIG = {
  downloading: { label: 'Descargando', cls: 'badge-blue',  bar: '#4f8ef7', pulse: true },
  completed:   { label: 'Completado',  cls: 'badge-green', bar: '#3ecf8e', pulse: false },
  paused:      { label: 'Pausado',     cls: 'badge-gray',  bar: '#6b7280', pulse: false },
  blocked:     { label: 'Bloqueado',   cls: 'badge-red',   bar: '#f75555', pulse: false },
  pending:     { label: 'Pendiente',   cls: 'badge-amber', bar: '#f5a623', pulse: false },
  error:       { label: 'Error',       cls: 'badge-red',   bar: '#f75555', pulse: false },
};

const ICONS = {
  education:      '🌐',
  development:    '💻',
  multimedia:     '🎬',
  productivity:   '📋',
  communication:  '💬',
  gaming:         '🎮',
};

// ─── Estado global ───────────────────────────────
let apps = [];
let selected = new Set();
let currentTab = 'all';
let searchQuery = '';
let confirmCallback = null;
let progressInterval = null;

// ─── Inicialización ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadApps();
  bindEvents();
  startProgressSimulation();
});

async function loadApps() {
  try {
    const res = await fetch(API + '/apps/');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      apps = data.map((a, i) => ({
        ...MOCK_APPS[i % MOCK_APPS.length],
        ...a,
        status: a.approved ? 'completed' : 'pending',
        icon: ICONS[a.category] || '📦',
      }));
      toast('Datos cargados desde el servidor', 'success');
    } else {
      apps = [...MOCK_APPS];
    }
  } catch {
    apps = [...MOCK_APPS];
  }
  render();
}

// ─── Eventos ───────────────────────────────────────
function bindEvents() {
  // Búsqueda
  document.getElementById('search-input').addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase();
    render();
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      render();
    });
  });

  // Checkbox "seleccionar todo"
  document.getElementById('check-all').addEventListener('change', e => {
    const filtered = getFiltered();
    if (e.target.checked) {
      filtered.forEach(a => selected.add(a.id));
    } else {
      selected.clear();
    }
    render();
  });

  // Botón agregar
  document.getElementById('btn-add').addEventListener('click', () => {
    openModal('modal-add');
  });

  // Modal agregar — cancelar
  document.getElementById('btn-cancel-add').addEventListener('click', () => {
    closeModal('modal-add');
  });

  // Modal agregar — confirmar
  document.getElementById('btn-confirm-add').addEventListener('click', submitAdd);

  // Cerrar modal al hacer click en overlay
  document.getElementById('modal-add').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal('modal-add');
  });

  // Modal confirmar eliminar
  document.getElementById('btn-cancel-confirm').addEventListener('click', () => {
    closeModal('modal-confirm');
    confirmCallback = null;
  });

  document.getElementById('btn-ok-confirm').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeModal('modal-confirm');
    confirmCallback = null;
  });

  document.getElementById('modal-confirm').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal('modal-confirm');
  });

  // Eliminar selección
  document.getElementById('btn-delete-selected').addEventListener('click', () => {
    openConfirm(
      `¿Eliminar ${selected.size} aplicación(es)?`,
      'Esta acción no se puede deshacer.',
      () => {
        apps = apps.filter(a => !selected.has(a.id));
        toast(`${selected.size} aplicación(es) eliminada(s)`, 'error');
        selected.clear();
        render();
      }
    );
  });

  // Nav items (solo visual)
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// ─── Render ───────────────────────────────────────
function render() {
  const filtered = getFiltered();
  renderStats();
  renderTable(filtered);
  updateCheckAll(filtered);
  updateDeleteBtn();
  document.getElementById('nav-total').textContent = apps.length;
}

function getFiltered() {
  return apps.filter(a => {
    const matchQ = !searchQuery ||
      a.name.toLowerCase().includes(searchQuery) ||
      a.category.toLowerCase().includes(searchQuery);
    const matchTab =
      currentTab === 'all' ||
      a.status === currentTab ||
      (currentTab === 'blocked' && !a.approved);
    return matchQ && matchTab;
  });
}

function renderStats() {
  document.getElementById('stat-total').textContent     = apps.length;
  document.getElementById('stat-active').textContent    = apps.filter(a => a.status === 'downloading').length;
  document.getElementById('stat-completed').textContent = apps.filter(a => a.status === 'completed').length;
  document.getElementById('stat-blocked').textContent   = apps.filter(a => a.status === 'blocked' || !a.approved).length;
}

function renderTable(filtered) {
  const tbody = document.getElementById('table-body');

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty">
            <div class="empty-title">Sin resultados</div>
            <div class="empty-sub">Prueba con otro término de búsqueda.</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(a => {
    const sc = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
    const pulseHTML = sc.pulse ? `<span class="pulse"></span> ` : '';

    const actionsHTML = buildActions(a);

    return `
      <tr data-id="${a.id}">
        <td class="cell-check">
          <input type="checkbox" class="row-check" data-id="${a.id}" ${selected.has(a.id) ? 'checked' : ''} />
        </td>
        <td>
          <div class="app-name">
            <div class="app-icon">${a.icon || ICONS[a.category] || '📦'}</div>
            <div>
              <div class="app-title">${escHtml(a.name)}</div>
              <div class="app-sub">ID: ${a.id}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge ${sc.cls}">
            ${pulseHTML}${sc.label}
          </span>
        </td>
        <td>${a.size || '—'}</td>
        <td>
          <div class="progress-wrap">
            <div class="progress-bar">
              <div class="progress-fill" style="width:${a.progress}%;background:${sc.bar}"></div>
            </div>
            <span class="pct">${a.progress}%</span>
          </div>
        </td>
        <td><span class="badge badge-gray">${a.category}</span></td>
        <td><span class="hash-text">${(a.sha256 || '').slice(0, 12)}…</span></td>
        <td>${a.added || '—'}</td>
        <td><div class="actions">${actionsHTML}</div></td>
      </tr>`;
  }).join('');

  // Bind checkboxes de fila
  tbody.querySelectorAll('.row-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = parseInt(cb.dataset.id);
      if (cb.checked) selected.add(id);
      else selected.delete(id);
      updateCheckAll(filtered);
      updateDeleteBtn();
    });
  });

  // Bind botones de acción
  tbody.querySelectorAll('.act-pause').forEach(btn => {
    btn.addEventListener('click', () => toggleStatus(parseInt(btn.dataset.id)));
  });

  tbody.querySelectorAll('.act-resume').forEach(btn => {
    btn.addEventListener('click', () => toggleStatus(parseInt(btn.dataset.id)));
  });

  tbody.querySelectorAll('.act-del').forEach(btn => {
    btn.addEventListener('click', () => deleteApp(parseInt(btn.dataset.id)));
  });
}

function buildActions(a) {
  let html = '';

  if (a.status === 'downloading') {
    html += `
      <button class="act-btn act-pause" data-id="${a.id}" title="Pausar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
        </svg>
      </button>`;
  }

  if (a.status === 'paused') {
    html += `
      <button class="act-btn act-resume" data-id="${a.id}" title="Reanudar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </button>`;
  }

  if (a.status === 'completed') {
    html += `
      <button class="act-btn ok" title="Completado" disabled>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </button>`;
  }

  html += `
    <button class="act-btn del act-del" data-id="${a.id}" title="Eliminar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
      </svg>
    </button>`;

  return html;
}

// ─── Acciones ─────────────────────────────────────
function toggleStatus(id) {
  apps = apps.map(a => {
    if (a.id !== id) return a;
    if (a.status === 'downloading') {
      toast('Instalación pausada', 'warning');
      return { ...a, status: 'paused' };
    }
    if (a.status === 'paused') {
      toast('Instalación reanudada', 'info');
      return { ...a, status: 'downloading' };
    }
    return a;
  });
  render();
}

function deleteApp(id) {
  const app = apps.find(a => a.id === id);
  openConfirm(
    '¿Eliminar aplicación?',
    `"${app?.name}" será eliminada del catálogo. Esta acción no se puede deshacer.`,
    () => {
      apps = apps.filter(a => a.id !== id);
      selected.delete(id);
      toast('Aplicación eliminada', 'error');
      render();
    }
  );
}

async function submitAdd() {
  const name     = document.getElementById('add-name').value.trim();
  const category = document.getElementById('add-category').value;
  const sha256   = document.getElementById('add-hash').value.trim();

  if (!name || !sha256) {
    toast('Completa todos los campos', 'error');
    return;
  }

  const newApp = {
    id:       Date.now(),
    name,
    category,
    sha256,
    approved: false,
    status:   'pending',
    progress: 0,
    size:     '—',
    added:    'Ahora',
    icon:     ICONS[category] || '📦',
  };

  apps.unshift(newApp);
  closeModal('modal-add');
  document.getElementById('add-name').value  = '';
  document.getElementById('add-hash').value  = '';
  render();
  toast('Aplicación enviada para aprobación', 'success');

  try {
    const res = await fetch(API + '/apps/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, category, sha256 }),
    });
    if (res.ok) toast('Sincronizado con el servidor', 'success');
  } catch {
    // servidor no disponible — queda en estado local
  }
}

// ─── Simulación de progreso ───────────────────────
function startProgressSimulation() {
  progressInterval = setInterval(() => {
    let changed = false;
    apps = apps.map(a => {
      if (a.status !== 'downloading') return a;
      const np = Math.min(100, a.progress + Math.random() * 2.5);
      changed = true;
      if (np >= 100) {
        toast(`"${a.name}" completada`, 'success');
        return { ...a, progress: 100, status: 'completed' };
      }
      return { ...a, progress: Math.round(np) };
    });
    if (changed) render();
  }, 1200);
}

// ─── UI helpers ───────────────────────────────────
function updateCheckAll(filtered) {
  const cb = document.getElementById('check-all');
  cb.checked = filtered.length > 0 && filtered.every(a => selected.has(a.id));
  cb.indeterminate = !cb.checked && filtered.some(a => selected.has(a.id));
}

function updateDeleteBtn() {
  const btn = document.getElementById('btn-delete-selected');
  if (selected.size > 0) {
    btn.style.display = 'inline-flex';
    btn.textContent = '';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      </svg>
      Eliminar (${selected.size})`;
  } else {
    btn.style.display = 'none';
  }
}

function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function openConfirm(title, sub, cb) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-sub').textContent   = sub;
  confirmCallback = cb;
  openModal('modal-confirm');
}

function toast(msg, type = 'info') {
  const colors = { success: '#3ecf8e', error: '#f75555', info: '#4f8ef7', warning: '#f5a623' };
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `
    <div class="toast-dot" style="background:${colors[type] || colors.info}"></div>
    ${escHtml(msg)}`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
