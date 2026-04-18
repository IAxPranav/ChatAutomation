// ============================================
// DreamHome – Chat Frontend (Priya Sharma)
// ============================================

const chatMessages = document.getElementById('chatMessages');
const userInput    = document.getElementById('userInput');
const sendBtn      = document.getElementById('sendBtn');

let conversationHistory = [];
let isTyping = false;

// ── Init ──────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  addDateDivider();
  setTimeout(() => {
    addBotMessage('Hi! I\'m Priya from DreamHome Properties. Looking for a property in Mumbai? I\'ll help you find the right one. 🏠');
    setTimeout(() => showQuickReplies(['Buy a Property', 'Rent a Home', 'Show All Listings', 'Investment Options']), 400);
  }, 600);
});

// ── Send ──────────────────────────────────────
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isTyping) return;

  addUserMessage(text);
  userInput.value = '';
  autoResize(userInput);
  conversationHistory.push({ role: 'user', text });
  await getBotReply(text);
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ── API ───────────────────────────────────────
async function getBotReply(message) {
  isTyping = true;
  sendBtn.disabled = true;

  const typingEl = showTyping();
  // Realistic delay 900ms - 2000ms
  await sleep(900 + Math.random() * 1100);

  try {
    const res  = await fetch('/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        message,
        history: conversationHistory.slice(-16)
      })
    });

    const data = await res.json();
    removeEl(typingEl);

    const reply = data.reply || 'Something went wrong. Please try again.';
    conversationHistory.push({ role: 'bot', text: reply });
    addBotMessage(reply, data.properties || []);

  } catch (err) {
    removeEl(typingEl);
    addBotMessage('Connection issue. Please try again in a moment.');
  } finally {
    isTyping = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

// ── Render: User bubble ───────────────────────
function addUserMessage(text) {
  const el = document.createElement('div');
  el.className = 'message user';
  el.innerHTML = `
    <div>
      <div class="bubble">${safe(text)}</div>
      <div class="bubble-meta">${getTime()} ✓✓</div>
    </div>`;
  chatMessages.appendChild(el);
  scrollBottom();
}

// ── Render: Bot bubble ────────────────────────
function addBotMessage(text, properties = []) {
  const el = document.createElement('div');
  el.className = 'message bot';

  let cardsHtml = '';
  if (properties.length > 0) {
    cardsHtml = `<div class="property-cards">${properties.map(buildCard).join('')}</div>`;
  }

  el.innerHTML = `
    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffdfbf"
         alt="Priya" class="msg-avatar" />
    <div>
      <div class="bubble">${renderText(text)}${cardsHtml}</div>
      <div class="bubble-meta">${getTime()}</div>
    </div>`;

  chatMessages.appendChild(el);
  scrollBottom();
}

// ── Text renderer ─────────────────────────────
// Minimal — just bold, then line breaks. No complex markdown.
function renderText(raw) {
  // 1. Escape HTML first
  let t = safe(raw);
  // 2. Bold: **text** → <strong>text</strong>
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // 3. Line breaks
  t = t.replace(/\n/g, '<br>');
  return t;
}

// ── Property Card ─────────────────────────────
function buildCard(p) {
  const bhkLabel = p.bhk === 0 ? 'Studio' : p.bhk + ' BHK';
  const typeClass = p.type === 'rent' ? 'rent' : 'sale';
  const typeLabel = p.type === 'rent' ? 'RENT' : 'SALE';
  return `
    <div class="prop-card" onclick="openModal('${p.id}')">
      <div class="prop-card-img-wrap">
        <img src="${p.image}" alt="${p.title}" class="prop-card-img" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'" />
        <span class="prop-card-type-tag ${typeClass}">${typeLabel}</span>
      </div>
      <div class="prop-card-body">
        ${p.badge ? `<span class="prop-card-badge">${p.badge}</span>` : ''}
        <h4>${p.title}</h4>
        <div class="prop-card-meta">
          <span>📍 ${p.location}</span>
          <span>🛏 ${bhkLabel}</span>
          <span>📐 ${p.area} sqft</span>
        </div>
        <div class="prop-card-footer">
          <div class="prop-card-price">${p.price || '—'}</div>
          <button class="prop-card-btn" onclick="event.stopPropagation(); bookVisit('${p.id}', '${escapeAttr(p.title)}')">
            Schedule Visit
          </button>
        </div>
      </div>
    </div>`;
}

// ── Quick Replies ─────────────────────────────
function showQuickReplies(chips) {
  const existing = document.getElementById('quickRepliesBar');
  if (existing) existing.remove();

  const bar = document.createElement('div');
  bar.id = 'quickRepliesBar';
  bar.className = 'quick-replies-inline';
  bar.innerHTML = chips.map(c =>
    `<button onclick="sendQuickReply('${escapeAttr(c)}')">${safe(c)}</button>`
  ).join('');
  chatMessages.appendChild(bar);
  scrollBottom();
}

function sendQuickReply(text) {
  const bar = document.getElementById('quickRepliesBar');
  if (bar) bar.remove();
  userInput.value = text;
  sendMessage();
}

// ── Typing indicator ──────────────────────────
function showTyping() {
  const el = document.createElement('div');
  el.className = 'message bot typing-wrap';
  el.innerHTML = `
    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffdfbf"
         alt="Priya" class="msg-avatar" />
    <div class="typing-indicator">
      <div class="typing-dots"><span></span><span></span><span></span></div>
      <span class="typing-label">Priya typing...</span>
    </div>`;
  chatMessages.appendChild(el);
  scrollBottom();
  return el;
}

// ── Modal ─────────────────────────────────────
async function openModal(propId) {
  try {
    const prop = await fetch(`/api/properties/${propId}`).then(r => r.json());
    if (prop.error) return;

    const price    = prop.type === 'rent' ? prop.rentDisplay : prop.priceDisplay;
    const bhkLabel = prop.bhk === 0 ? 'Studio' : prop.bhk + ' BHK';

    document.getElementById('modalBody').innerHTML = `
      <img src="${prop.image}" alt="${prop.title}" class="modal-img"
           onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'" />
      <h2 class="modal-title">${prop.title}</h2>
      <p class="modal-location">📍 ${prop.location.address || ''} ${prop.location.area}, ${prop.location.city}</p>
      <p class="modal-price">
        ${price || '—'}
        ${prop.type === 'sale' && prop.price ? `<span class="modal-emi">~₹${Math.round(prop.price * 0.0072 / 1000)}K/mo EMI</span>` : ''}
      </p>
      <div class="modal-chips">
        <span class="chip">🛏 ${bhkLabel}</span>
        <span class="chip">📐 ${prop.area} sqft</span>
        ${prop.floor ? `<span class="chip">🏢 ${prop.floor}</span>` : ''}
        ${prop.facing ? `<span class="chip">🧭 ${prop.facing}</span>` : ''}
        ${prop.age ? `<span class="chip">🏗 ${prop.age}</span>` : ''}
        <span class="chip">📦 ${prop.possession}</span>
        <span class="chip">${prop.available ? '✅ Available' : '🔜 Coming Soon'}</span>
      </div>
      <p class="modal-desc">${prop.description}</p>
      <p class="modal-section-title">🏋️ Amenities</p>
      <div class="amenity-grid">
        ${prop.amenities.map(a => `<div class="amenity-item">${a}</div>`).join('')}
      </div>
      <p class="modal-section-title">🗺 Nearby</p>
      <ul class="landmark-list">
        ${prop.landmarks.map(l => `<li>${l}</li>`).join('')}
      </ul>
      <div class="modal-cta">
        <button class="btn-visit" onclick="bookVisit('${prop.id}', '${escapeAttr(prop.title)}')">Schedule a Visit</button>
        <button class="btn-call"  onclick="callbackReq('${escapeAttr(prop.title)}')">Request Callback</button>
      </div>`;

    document.getElementById('modalOverlay').classList.add('active');
  } catch (err) { console.error(err); }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function bookVisit(id, title) {
  closeModal();
  userInput.value = `I'd like to schedule a site visit for ${title}.`;
  userInput.focus();
}

function callbackReq(title) {
  closeModal();
  userInput.value = `Please arrange a callback for ${title}. I'd like more details.`;
  userInput.focus();
}

// ── Clear ─────────────────────────────────────
function clearChat() {
  if (!confirm('Start a new conversation?')) return;
  conversationHistory = [];
  chatMessages.innerHTML = '';
  addDateDivider();
  setTimeout(() => {
    addBotMessage('Hi again! How can I help you find a property today? 🏠');
    setTimeout(() => showQuickReplies(['Buy a Property', 'Rent a Home', 'Show All Listings']), 400);
  }, 400);
}

// ── Helpers ───────────────────────────────────
function addDateDivider() {
  const el = document.createElement('div');
  el.className = 'date-divider';
  el.textContent = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  chatMessages.appendChild(el);
}

function scrollBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }
function getTime() { return new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12: true }); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function removeEl(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }

// Safe HTML escape
function safe(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Escape for use inside HTML attribute values
function escapeAttr(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
