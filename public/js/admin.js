// ============================================
// DreamHome Admin Panel – JavaScript
// ============================================

let allProperties = [];
let deleteTargetId = null;

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadAllData();
  togglePriceFields();
});

async function loadAllData() {
  await fetchProperties();
  renderDashboard();
  renderTable();
}

// ── Fetch Properties ──────────────────────────
async function fetchProperties() {
  try {
    const res  = await fetch('/api/properties');
    const data = await res.json();
    allProperties = data.properties || [];
  } catch (err) {
    showToast('Failed to load properties', 'error');
    allProperties = [];
  }
}

// ── Dashboard ─────────────────────────────────
function renderDashboard() {
  const total = allProperties.length;
  const avail = allProperties.filter(p => p.available).length;
  const sale  = allProperties.filter(p => p.type === 'sale').length;
  const rent  = allProperties.filter(p => p.type === 'rent').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statAvail').textContent = avail;
  document.getElementById('statSale').textContent  = sale;
  document.getElementById('statRent').textContent  = rent;

  // Recent listings (last 6)
  const grid = document.getElementById('dashPropGrid');
  const recent = [...allProperties].slice(-6).reverse();

  if (recent.length === 0) {
    grid.innerHTML = '<p class="loading">No properties yet. Add some!</p>';
    return;
  }

  grid.innerHTML = recent.map(p => {
    const price = p.type === 'rent' ? p.rentDisplay : p.priceDisplay;
    return `
      <div class="prop-mini-card">
        <img src="${p.image}" alt="${p.title}"
             onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'" />
        <div class="prop-mini-info">
          <span class="prop-mini-badge ${p.type === 'sale' ? 'badge-sale' : 'badge-rent'}">
            ${p.type === 'sale' ? '🏠 Sale' : '🔑 Rent'}
          </span>
          <h4>${p.title}</h4>
          <p>📍 ${p.location.area}, ${p.location.city}</p>
          <p class="prop-mini-price">${price || '—'}</p>
        </div>
      </div>`;
  }).join('');
}

// ── Table Render ──────────────────────────────
function renderTable(props = allProperties) {
  const tbody = document.getElementById('propTableBody');

  if (props.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">No properties found</td></tr>';
    return;
  }

  tbody.innerHTML = props.map(p => {
    const price = p.type === 'rent' ? (p.rentDisplay || '—') : (p.priceDisplay || '—');
    const bhkLabel = p.bhk === 0 ? 'Studio' : `${p.bhk} BHK`;
    return `
      <tr>
        <td>
          <img src="${p.image}" alt="${p.title}" class="table-img"
               onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'" />
        </td>
        <td>
          <div class="table-title">${p.title}</div>
          <div class="table-sub">${p.id} · ${p.area} sq ft</div>
        </td>
        <td><span class="type-chip ${p.type === 'sale' ? 'type-sale' : 'type-rent'}">
          ${p.type === 'sale' ? 'Sale' : 'Rent'}
        </span></td>
        <td>${bhkLabel}</td>
        <td>
          <div class="table-title">${p.location.area}</div>
          <div class="table-sub">${p.location.city}</div>
        </td>
        <td><strong>${price}</strong></td>
        <td><span class="avail-chip ${p.available ? 'avail-yes' : 'avail-no'}">
          ${p.available ? '✅ Available' : '🔜 Soon'}
        </span></td>
        <td>
          <div class="action-btns">
            <button class="btn-edit" onclick="editProperty('${p.id}')">✏️ Edit</button>
            <button class="btn-del"  onclick="confirmDelete('${p.id}')">🗑 Del</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── Filter Table ──────────────────────────────
function filterTable() {
  const search = document.getElementById('filterSearch').value.toLowerCase();
  const type   = document.getElementById('filterType').value;
  const bhk    = document.getElementById('filterBHK').value;
  const avail  = document.getElementById('filterAvail').value;

  let filtered = allProperties.filter(p => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search) ||
      p.location.area.toLowerCase().includes(search) ||
      p.location.city.toLowerCase().includes(search) ||
      p.id.toLowerCase().includes(search);

    const matchType  = !type  || p.type === type;
    const matchBHK   = !bhk   || p.bhk  === parseInt(bhk);
    const matchAvail = !avail || p.available === (avail === 'true');

    return matchSearch && matchType && matchBHK && matchAvail;
  });

  renderTable(filtered);
}

// ── Form: Add ─────────────────────────────────
async function handleFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('editId').value;
  const isEdit = !!editId;

  const body = {
    title:       document.getElementById('f_title').value,
    type:        document.getElementById('f_type').value,
    bhk:         document.getElementById('f_bhk').value,
    price:       document.getElementById('f_price').value,
    priceDisplay:document.getElementById('f_priceDisplay').value,
    rent:        document.getElementById('f_rent').value,
    rentDisplay: document.getElementById('f_rentDisplay').value,
    city:        document.getElementById('f_city').value,
    area:        document.getElementById('f_area').value,
    address:     document.getElementById('f_address').value,
    area_sqft:   document.getElementById('f_area_sqft').value,
    floor:       document.getElementById('f_floor').value,
    totalFloors: document.getElementById('f_totalFloors').value,
    age:         document.getElementById('f_age').value,
    facing:      document.getElementById('f_facing').value,
    possession:  document.getElementById('f_possession').value,
    image:       document.getElementById('f_image').value,
    badge:       document.getElementById('f_badge').value,
    available:   document.getElementById('f_available').value,
    amenities:   document.getElementById('f_amenities').value,
    landmarks:   document.getElementById('f_landmarks').value,
    description: document.getElementById('f_description').value
  };

  try {
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = isEdit ? '💾 Saving...' : '⏳ Adding...';

    const url    = isEdit ? `/api/properties/${editId}` : '/api/properties';
    const method = isEdit ? 'PUT' : 'POST';

    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed');

    showToast(isEdit ? '✅ Property updated!' : '✅ Property added!', 'success');
    resetForm();
    await loadAllData();
    showSection('properties', document.querySelector('[href="#properties"]'));

  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    const btn = document.getElementById('submitBtn');
    btn.disabled = false;
    btn.textContent = '➕ Add Property';
  }
}

// ── Form: Edit ────────────────────────────────
function editProperty(id) {
  const prop = allProperties.find(p => p.id === id);
  if (!prop) return;

  document.getElementById('editId').value = id;
  document.getElementById('f_title').value        = prop.title || '';
  document.getElementById('f_type').value         = prop.type  || 'sale';
  document.getElementById('f_bhk').value          = prop.bhk   ?? 2;
  document.getElementById('f_price').value        = prop.price || '';
  document.getElementById('f_priceDisplay').value = prop.priceDisplay || '';
  document.getElementById('f_rent').value         = prop.rent  || '';
  document.getElementById('f_rentDisplay').value  = prop.rentDisplay  || '';
  document.getElementById('f_city').value         = prop.location?.city    || '';
  document.getElementById('f_area').value         = prop.location?.area    || '';
  document.getElementById('f_address').value      = prop.location?.address || '';
  document.getElementById('f_area_sqft').value    = prop.area   || '';
  document.getElementById('f_floor').value        = prop.floor  || '';
  document.getElementById('f_totalFloors').value  = prop.totalFloors || '';
  document.getElementById('f_age').value          = prop.age    || '';
  document.getElementById('f_facing').value       = prop.facing || '';
  document.getElementById('f_possession').value   = prop.possession || '';
  document.getElementById('f_image').value        = prop.image  || '';
  document.getElementById('f_badge').value        = prop.badge  || '';
  document.getElementById('f_available').value    = prop.available ? 'true' : 'false';
  document.getElementById('f_amenities').value    = (prop.amenities || []).join(', ');
  document.getElementById('f_landmarks').value    = (prop.landmarks || []).join(', ');
  document.getElementById('f_description').value  = prop.description || '';

  document.getElementById('formTitle').textContent  = '✏️ Edit Property';
  document.getElementById('submitBtn').textContent   = '💾 Save Changes';
  togglePriceFields();
  showSection('add', document.querySelector('[href="#add"]'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Form: Reset ───────────────────────────────
function resetForm() {
  document.getElementById('propForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('formTitle').textContent  = 'Add New Property';
  document.getElementById('submitBtn').textContent   = '➕ Add Property';
  togglePriceFields();
}

// ── Toggle Price/Rent Fields ──────────────────
function togglePriceFields() {
  const type = document.getElementById('f_type').value;
  const isSale = type === 'sale';

  document.getElementById('saleFields').style.display    = isSale ? 'flex' : 'none';
  document.getElementById('saleDspFields').style.display  = isSale ? 'flex' : 'none';
  document.getElementById('rentFields').style.display    = isSale ? 'none' : 'flex';
  document.getElementById('rentDspFields').style.display  = isSale ? 'none' : 'flex';
}

// ── Delete ────────────────────────────────────
function confirmDelete(id) {
  deleteTargetId = id;
  document.getElementById('deleteOverlay').classList.add('active');

  document.getElementById('confirmDeleteBtn').onclick = async () => {
    try {
      const res = await fetch(`/api/properties/${deleteTargetId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      showToast('🗑 Property deleted!', 'success');
      closeDeleteModal();
      await loadAllData();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };
}

function closeDeleteModal() {
  document.getElementById('deleteOverlay').classList.remove('active');
  deleteTargetId = null;
}

// ── Section Nav ───────────────────────────────
function showSection(name, linkEl) {
  document.querySelectorAll('.section').forEach(s  => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const sec = document.getElementById(`sec-${name}`);
  if (sec) sec.classList.add('active');
  if (linkEl) linkEl.classList.add('active');

  if (name === 'properties') renderTable();
  if (name === 'dashboard')  renderDashboard();
  if (name === 'add')        { /* form already visible */ }
}

// ── Toast ─────────────────────────────────────
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}
