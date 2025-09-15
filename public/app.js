// ===== Config =====
const API = '/api';

// ===== Estado =====
let token = localStorage.getItem('token') || null;

// ===== Helpers =====
function setAuthUI() {
  const btnLogin = document.getElementById('btnLogin');
  const btnRegister = document.getElementById('btnRegister');
  const btnLogout = document.getElementById('btnLogout');
  const btnNew = document.getElementById('btnNew');

  const logged = Boolean(token);
  btnLogin.hidden = logged;
  btnRegister.hidden = logged;
  btnLogout.hidden = !logged;
  btnNew.hidden = !logged;
}

function authHeaders() {
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    }
  });
  const isJSON = res.headers.get('content-type')?.includes('application/json');
  const body = isJSON ? await res.json().catch(() => ({})) : null;
  if (!res.ok) {
    const msg = body?.error || body?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function typesToBadges(csv) {
  if (!csv) return '';
  return csv.split(',').map(t => `<span class="badge">${t}</span>`).join(' ');
}

// ===== UI refs =====
const fName = document.getElementById('fName');
const fType = document.getElementById('fType');
const fMinAtk = document.getElementById('fMinAtk');
const fMaxSpd = document.getElementById('fMaxSpd');
const fPage = document.getElementById('fPage');
const fLimit = document.getElementById('fLimit');
const frmFilters = document.getElementById('filters');
const btnReset = document.getElementById('btnReset');

const results = document.getElementById('results');
const pager = document.getElementById('pager');
const btnNew = document.getElementById('btnNew');

// Dialogs & forms
const dlgPokemon = document.getElementById('dlgPokemon');
const frmPokemon = document.getElementById('frmPokemon');
const dlgTitle = document.getElementById('dlgTitle');
const pkId = document.getElementById('pkId');
const pkName = document.getElementById('pkName');
const pkDex = document.getElementById('pkDex');
const sHp = document.getElementById('sHp');
const sAtk = document.getElementById('sAtk');
const sDef = document.getElementById('sDef');
const sSpA = document.getElementById('sSpA');
const sSpD = document.getElementById('sSpD');
const sSpe = document.getElementById('sSpe');
const pkTypes = document.getElementById('pkTypes');

// Auth dialogs
const dlgLogin = document.getElementById('dlgLogin');
const frmLogin = document.getElementById('frmLogin');
const lgEmail = document.getElementById('lgEmail');
const lgPass = document.getElementById('lgPass');

const dlgRegister = document.getElementById('dlgRegister');
const frmRegister = document.getElementById('frmRegister');
const rgName = document.getElementById('rgName');
const rgEmail = document.getElementById('rgEmail');
const rgPass = document.getElementById('rgPass');

// Auth buttons
const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const btnLogout = document.getElementById('btnLogout');

// Types search
const typesSearch = document.getElementById('typesSearch');
const typeQuery = document.getElementById('typeQuery');
const typesList = document.getElementById('typesList');

// ===== Listado principal =====
async function loadPokemon() {
  const q = new URLSearchParams();
  if (fName.value.trim()) q.set('name', fName.value.trim());
  if (fType.value.trim()) q.set('type', fType.value.trim());
  if (fMinAtk.value) q.set('min_attack', Number(fMinAtk.value));
  if (fMaxSpd.value) q.set('max_speed', Number(fMaxSpd.value));
  const page = Math.max(1, Number(fPage.value || 1));
  const limit = Math.max(1, Math.min(100, Number(fLimit.value || 10)));
  q.set('page', page);
  q.set('limit', limit);

  results.innerHTML = '<div class="notice">Cargando…</div>';
  try {
    const data = await fetchJSON(`${API}/pokemon?${q.toString()}`);
    renderResults(data);
  } catch (err) {
    results.innerHTML = `<div class="notice err">Error: ${err.message}</div>`;
  }
}

function renderResults({ data = [], page, limit }) {
  if (!data.length) {
    results.innerHTML = '<div class="empty">No hay resultados</div>';
    pager.innerHTML = '';
    return;
  }

  const rows = data.map(p => `
    <tr>
      <td>#${p.nat_dex}</td>
      <td>${p.name}</td>
      <td>${typesToBadges(p.types)}</td>
      <td>${p.hp}/${p.attack}/${p.defense}/${p.sp_attack}/${p.sp_defense}/${p.speed}</td>
      <td>
        <button data-id="${p.id}" class="secondary act-view">Ver</button>
        <button data-id="${p.id}" class="primary act-edit" ${!token ? 'hidden' : ''}>Editar</button>
        <button data-id="${p.id}" class="danger act-del" ${!token ? 'hidden' : ''}>Borrar</button>
      </td>
    </tr>
  `).join('');

  results.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Dex</th><th>Nombre</th><th>Tipos</th><th>Stats (HP/Atk/Def/SpA/SpD/Spe)</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  // Pager simple (solo +/-)
  pager.innerHTML = '';
  const btnPrev = el(`<button class="secondary">&laquo; Anterior</button>`);
  const btnNext = el(`<button class="secondary">Siguiente &raquo;</button>`);
  btnPrev.onclick = () => { fPage.value = Math.max(1, Number(fPage.value || 1) - 1); loadPokemon(); };
  btnNext.onclick = () => { fPage.value = Number(fPage.value || 1) + 1; loadPokemon(); };
  pager.append(btnPrev, el(`<span>Página ${page}</span>`), btnNext);

  // Wire acciones
  results.querySelectorAll('.act-view').forEach(b => b.addEventListener('click', onView));
  results.querySelectorAll('.act-edit').forEach(b => b.addEventListener('click', onEdit));
  results.querySelectorAll('.act-del').forEach(b => b.addEventListener('click', onDelete));
}

// ===== Acciones de fila =====
async function onView(e) {
  const id = e.currentTarget.dataset.id;
  try {
    const p = await fetchJSON(`${API}/pokemon/${id}`);
    openDialogFor(p);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function onEdit(e) {
  const id = e.currentTarget.dataset.id;
  try {
    const p = await fetchJSON(`${API}/pokemon/${id}`);
    openDialogFor(p, true);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function onDelete(e) {
  const id = e.currentTarget.dataset.id;
  if (!confirm('¿Seguro que querés borrar este Pokémon?')) return;
  try {
    await fetchJSON(`${API}/pokemon/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
    loadPokemon();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// ===== CRUD Dialog =====
function openDialogFor(p = null, editable = false) {
  dlgTitle.textContent = p ? (editable ? `Editar: ${p.name}` : `Ver: ${p.name}`) : 'Nuevo Pokémon';
  pkId.value = p?.id ?? '';
  pkName.value = p?.name ?? '';
  pkDex.value = p?.nat_dex ?? '';
  sHp.value = p?.hp ?? '';
  sAtk.value = p?.attack ?? '';
  sDef.value = p?.defense ?? '';
  sSpA.value = p?.sp_attack ?? '';
  sSpD.value = p?.sp_defense ?? '';
  sSpe.value = p?.speed ?? '';
  pkTypes.value = p?.types ?? '';

  // Si es "ver" y no editable, deshabilitar inputs
  const disabled = p && !editable;
  [...frmPokemon.querySelectorAll('input')].forEach(i => i.disabled = disabled);
  frmPokemon.querySelector('#btnSave').hidden = disabled;

  dlgPokemon.showModal();
}

btnNew.addEventListener('click', () => openDialogFor(null, true));

frmPokemon.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = pkId.value;
  const body = {
    name: pkName.value.trim(),
    nat_dex: Number(pkDex.value),
    generation: 6,
    stats: {
      hp: Number(sHp.value),
      attack: Number(sAtk.value),
      defense: Number(sDef.value),
      sp_attack: Number(sSpA.value),
      sp_defense: Number(sSpD.value),
      speed: Number(sSpe.value),
    },
    types: pkTypes.value.split(',').map(t => t.trim()).filter(Boolean)
  };

  try {
    if (id) {
      await fetchJSON(`${API}/pokemon/${id}`, {
        method: 'PATCH',
        headers: { ...authHeaders() },
        body: JSON.stringify(body)
      });
    } else {
      await fetchJSON(`${API}/pokemon`, {
        method: 'POST',
        headers: { ...authHeaders() },
        body: JSON.stringify(body)
      });
    }
    dlgPokemon.close();
    loadPokemon();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

// ===== Filtros =====
frmFilters.addEventListener('submit', (e) => {
  e.preventDefault();
  fPage.value = 1;
  loadPokemon();
});
btnReset.addEventListener('click', () => {
  fName.value = '';
  fType.value = '';
  fMinAtk.value = '';
  fMaxSpd.value = '';
  fPage.value = 1;
  fLimit.value = 10;
  loadPokemon();
});

// ===== Tipos =====
typesSearch.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = typeQuery.value.trim();
  typesList.innerHTML = '<div class="notice">Buscando…</div>';
  try {
    const rows = await fetchJSON(`${API}/types${q ? `?name=${encodeURIComponent(q)}` : ''}`);
    if (!rows.length) {
      typesList.innerHTML = '<div class="empty">Sin resultados</div>';
      return;
    }
    typesList.innerHTML = rows.map(t => `<span class="badge">${t.name}</span>`).join(' ');
  } catch (err) {
    typesList.innerHTML = `<div class="notice err">Error: ${err.message}</div>`;
  }
});

// ===== Auth =====
btnLogin.addEventListener('click', () => dlgLogin.showModal());
btnRegister.addEventListener('click', () => dlgRegister.showModal());
btnLogout.addEventListener('click', () => {
  token = null;
  localStorage.removeItem('token');
  setAuthUI();
  loadPokemon();
});

frmLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const { token: tk } = await fetchJSON(`${API}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: lgEmail.value.trim(), password: lgPass.value })
    });
    token = tk;
    localStorage.setItem('token', token);
    dlgLogin.close();
    setAuthUI();
    loadPokemon();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

frmRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await fetchJSON(`${API}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name: rgName.value.trim(), email: rgEmail.value.trim(), password: rgPass.value })
    });
    dlgRegister.close();
    // opcional: loguear automáticamente
    const { token: tk } = await fetchJSON(`${API}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: rgEmail.value.trim(), password: rgPass.value })
    });
    token = tk;
    localStorage.setItem('token', token);
    setAuthUI();
    loadPokemon();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

// ===== Init =====
setAuthUI();
loadPokemon();
