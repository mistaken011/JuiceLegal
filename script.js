// ============================================================
// FIREBASE CONFIG
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCeRpkisdRmqhxI1bev6EEj1JF-Tp4wC8s",
  authDomain: "juicelegal-2a6a8.firebaseapp.com",
  projectId: "juicelegal-2a6a8",
  storageBucket: "juicelegal-2a6a8.firebasestorage.app",
  messagingSenderId: "990867850714",
  appId: "1:990867850714:web:8b579d918a72524e1bace3",
  measurementId: "G-YJVTQNJEKE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================================
// DEPT DATA (varsayılan)
// ============================================================
const DEPTS = {
  mrpd: { name: "Mission Row Police Department", tag: "Emniyet", ranks: ["Captain","Lieutenant","Sergeant"] },
  vpd:  { name: "Vespucci Police Department",    tag: "Emniyet", ranks: ["Captain","Lieutenant","Sergeant"] },
  dsd:  { name: "Davis Sheriff Office",           tag: "Şerif Ofisi", ranks: ["Captain","Lieutenant","Sergeant"] },
  sahp: { name: "San Andreas Highway Patrol",     tag: "Devlet Polisi", ranks: ["Captain","Lieutenant","Sergeant"] },
  sdso: { name: "Senora Desert Sheriff Office",   tag: "Şerif Ofisi", ranks: ["Captain","Lieutenant","Sergeant"] },
  pbso: { name: "Paleto Bay Sheriff Office",      tag: "Şerif Ofisi", ranks: ["Captain","Lieutenant","Sergeant"] },
  sapr: { name: "San Andreas Park Ranger",        tag: "Park & Doğa", ranks: ["Captain","Lieutenant","Sergeant"] },
  doj:  { name: "Department Of Justice",          tag: "Adalet Bakanlığı", ranks: ["Yargıç","Savcı","Baro Başkanı"] },
  lsms: { name: "Los Santos Medical Services",    tag: "Sağlık", ranks: ["Başhekim","Başhekim Yardımcısı"] },
  lswn: { name: "Los Santos Weazel News",         tag: "Medya", ranks: ["Yönetici","Yönetici Yardımcısı"] }
};

// Local state
let deptData = {};
let galeriPhotos = [];
let announcements = [];
let weekArchive = [];
let submissions = { lsb:[], ds:[], lss:[] };
let accounts = [{ user:'admin', pass:'justice2024', role:'manager', name:'Admin' }];
let activityLog = [];
let currentUser = null;
let rulesData = { rules: { url:'', embed:true }, ceza: { url:'', embed:true } };
let statsData = { personel:47, birim:12, dept:5 };
let weekData = { name:'[ İsim Soyisim ]', role:'[ Görev / Rütbe ]', tenure:'[ Süre ]', msg:'Bu haftaki üstün performansı ve özverili çalışmasından dolayı tebrik ederiz.', num:'Hafta #1 · 2025', photo:'' };
let visitorCount = 0;
let isDarkTheme = true;
let currentDeptEditing = null;
let deptUnits = {};

// ============================================================
// INIT — sayfa yüklenince Firebase'den veri çek
// ============================================================
async function initApp() {
  await Promise.all([
    loadStats(),
    loadWeek(),
    loadAnnouncements(),
    loadGaleri(),
    loadAllDepts(),
    loadRules(),
    loadSubmissions(),
    loadArchive(),
    loadAccounts(),
    loadActivityLog(),
    loadVisitor()
  ]);
  renderDeptContents();
  renderGaleri();
  renderWeek();
  renderAnnouncements();
  renderRules();
  renderStats();
  renderArchive();
  renderActivityLogList();
  updateFormCount();
}

// ============================================================
// FIRESTORE HELPERS
// ============================================================
async function fsGet(path) {
  try {
    const parts = path.split('/');
    let ref;
    if (parts.length === 2) ref = doc(db, parts[0], parts[1]);
    else ref = doc(db, path);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch(e) { console.error('fsGet error', path, e); return null; }
}

async function fsSet(path, data) {
  try {
    const parts = path.split('/');
    let ref;
    if (parts.length === 2) ref = doc(db, parts[0], parts[1]);
    else ref = doc(db, path);
    await setDoc(ref, data, { merge: true });
  } catch(e) { console.error('fsSet error', path, e); }
}

async function fsColGet(col) {
  try {
    const snap = await getDocs(collection(db, col));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { console.error('fsColGet error', col, e); return []; }
}

async function fsAdd(col, data) {
  try {
    const ref = await addDoc(collection(db, col), data);
    return ref.id;
  } catch(e) { console.error('fsAdd error', col, e); return null; }
}

async function fsDel(col, id) {
  try { await deleteDoc(doc(db, col, id)); } catch(e) { console.error('fsDel error', e); }
}

// ============================================================
// LOAD FUNCTIONS
// ============================================================
async function loadStats() {
  const d = await fsGet('site/stats');
  if (d) statsData = d;
}

async function loadWeek() {
  const d = await fsGet('site/week');
  if (d) weekData = d;
}

async function loadAnnouncements() {
  announcements = await fsColGet('announcements');
}

async function loadGaleri() {
  galeriPhotos = await fsColGet('galeri');
}

async function loadAllDepts() {
  const all = await fsColGet('depts');
  all.forEach(d => { deptData[d.id] = d; deptUnits[d.id] = d.units || []; });
}

async function loadRules() {
  const d = await fsGet('site/rules');
  if (d) rulesData = d;
}

async function loadSubmissions() {
  const all = await fsColGet('submissions');
  submissions = { lsb:[], ds:[], lss:[] };
  all.forEach(s => {
    if (submissions[s.type]) submissions[s.type].push(s);
  });
}

async function loadArchive() {
  weekArchive = await fsColGet('weekArchive');
  weekArchive.sort((a,b) => (b.savedAt||0) - (a.savedAt||0));
}

async function loadAccounts() {
  const d = await fsGet('site/accounts');
  if (d && d.list) accounts = d.list;
}

async function loadActivityLog() {
  const d = await fsGet('site/activityLog');
  if (d && d.log) activityLog = d.log;
}

async function loadVisitor() {
  const d = await fsGet('site/visitors');
  visitorCount = d ? (d.count || 0) : 0;
  visitorCount++;
  await fsSet('site/visitors', { count: visitorCount });
  const el = document.getElementById('visitor-count');
  if (el) el.textContent = visitorCount;
}

// ============================================================
// NAVIGATION
// ============================================================
function goPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const page = document.getElementById('page-'+id);
  if (page) page.classList.add('active');
  const nav = document.getElementById('nav-'+id);
  if (nav) nav.classList.add('active');
  window.scrollTo(0,0);
}

function toggleMobileNav() {
  document.getElementById('mobile-nav').classList.toggle('open');
}
function closeMobileNav() {
  document.getElementById('mobile-nav').classList.remove('open');
}

// ============================================================
// THEME
// ============================================================
function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle('light-theme', !isDarkTheme);
  document.getElementById('theme-btn').textContent = isDarkTheme ? '🌙' : '☀️';
}

// ============================================================
// SEARCH
// ============================================================
const searchIndex = [
  { title:'Hakkımızda', page:'hakkimizda', desc:'Juice Legal hakkında bilgi' },
  { title:'Galeri', page:'galeri', desc:'Fotoğraf galerisi' },
  { title:'Departmanlar', page:'departmanlar', desc:'MRPD VPD DSD SAHP SDSO PBSO SAPR DOJ LSMS LSWN' },
  { title:'Formlar', page:'formlar', desc:'Legal Sup başvurusu departman şikayet' },
  { title:'Kurallar', page:'kurallar', desc:'Legal kurallar ceza kanunu' },
  { title:'Haftanın Memuru', page:'hafta', desc:'Haftalık ödül takdir' },
  { title:'Yönetici', page:'admin', desc:'Admin panel yönetim' },
];

function openSearch() {
  document.getElementById('search-overlay').classList.add('open');
  setTimeout(() => document.getElementById('search-input').focus(), 100);
}
function closeSearch() {
  document.getElementById('search-overlay').classList.remove('open');
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
}
function doSearch(val) {
  const q = val.toLowerCase().trim();
  const res = document.getElementById('search-results');
  if (!q) { res.innerHTML = ''; return; }
  const matches = searchIndex.filter(i => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
  if (!matches.length) { res.innerHTML = '<div class="sr-empty">Sonuç bulunamadı.</div>'; return; }
  res.innerHTML = matches.map(m => `
    <div class="sr-item" onclick="goPage('${m.page}');closeSearch()">
      <div class="sr-title">${m.title}</div>
      <div class="sr-desc">${m.desc}</div>
    </div>`).join('');
}

// ============================================================
// ANNOUNCEMENT
// ============================================================
function renderAnnouncements() {
  const active = announcements.filter(a => a.active);
  const bar = document.getElementById('announcement-bar');
  const heroAnns = document.getElementById('hero-announcements');

  if (active.length > 0) {
    const latest = active[active.length - 1];
    bar.style.display = 'block';
    bar.className = 'ann-bar ann-' + (latest.color || 'gold');
    document.getElementById('ann-text').textContent = latest.text;
    document.getElementById('main-nav').style.top = '40px';
    document.querySelectorAll('.page').forEach(p => p.style.paddingTop = '104px');
  } else {
    bar.style.display = 'none';
    document.getElementById('main-nav').style.top = '0';
    document.querySelectorAll('.page').forEach(p => p.style.paddingTop = '64px');
  }

  if (heroAnns) {
    heroAnns.innerHTML = active.map(a => `
      <div class="hero-ann-item ann-hero-${a.color||'gold'}">
        <span>📢</span> ${a.text}
      </div>`).join('');
  }

  // Admin listesi
  const annList = document.getElementById('ann-list');
  if (!annList) return;
  if (!announcements.length) { annList.innerHTML = '<div class="empty-list">Henüz duyuru yok.</div>'; return; }
  annList.innerHTML = announcements.map(a => `
    <div class="sub-item">
      <div>
        <h4>${a.text}</h4>
        <div class="sub-meta">Renk: ${a.color} · ${a.active ? '✅ Aktif' : '⏸ Pasif'}</div>
        <button class="action-btn" onclick="toggleAnn('${a.id}',${!a.active})">${a.active ? 'Gizle' : 'Göster'}</button>
        <button class="action-btn danger" onclick="deleteAnn('${a.id}')">Sil</button>
      </div>
      <span class="sub-badge ${a.active?'new':'read'}">${a.active?'Aktif':'Pasif'}</span>
    </div>`).join('');
}

function closeAnn() {
  document.getElementById('announcement-bar').style.display = 'none';
}

async function saveAnnouncement() {
  const text = document.getElementById('ann-input').value.trim();
  if (!text) return;
  const color = document.getElementById('ann-color').value;
  const active = document.getElementById('ann-active').value === '1';
  const id = await fsAdd('announcements', { text, color, active });
  announcements.push({ id, text, color, active });
  document.getElementById('ann-input').value = '';
  renderAnnouncements();
  logActivity('Duyuru eklendi: ' + text);
}

async function toggleAnn(id, val) {
  await fsSet('announcements/'+id, { active: val });
  const a = announcements.find(x => x.id === id);
  if (a) a.active = val;
  renderAnnouncements();
}

async function deleteAnn(id) {
  await fsDel('announcements', id);
  announcements = announcements.filter(a => a.id !== id);
  renderAnnouncements();
  logActivity('Duyuru silindi');
}

// ============================================================
// GALERİ
// ============================================================
function renderGaleri() {
  const grid = document.getElementById('galeri-grid');
  const empty = document.getElementById('galeri-empty');
  if (!grid) return;
  if (!galeriPhotos.length) {
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = galeriPhotos.map(p => `
    <div class="galeri-item" onclick="openLightbox('${p.url}','${p.caption||''}')">
      <img src="${p.url}" alt="${p.caption||''}" onerror="this.parentElement.innerHTML='<div class=galeri-placeholder><span>Yüklenemedi</span></div>'" />
      ${p.caption ? `<div class="galeri-caption">${p.caption}</div>` : ''}
    </div>`).join('');

  const adminGrid = document.getElementById('galeri-admin-list');
  if (!adminGrid) return;
  if (!galeriPhotos.length) { adminGrid.innerHTML = '<div class="empty-list">Henüz fotoğraf yok.</div>'; return; }
  adminGrid.innerHTML = galeriPhotos.map(p => `
    <div class="galeri-admin-item">
      <img src="${p.url}" alt="" />
      <div class="gai-caption">${p.caption||'—'}</div>
      <button class="action-btn danger" onclick="deleteGaleriPhoto('${p.id}')">Sil</button>
    </div>`).join('');
}

function openLightbox(url, caption) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<div class="lb-inner"><img src="${url}" />${caption?`<div class="lb-cap">${caption}</div>`:''}<button class="lb-close" onclick="this.parentElement.parentElement.remove()">✕</button></div>`;
  lb.onclick = e => { if(e.target===lb) lb.remove(); };
  document.body.appendChild(lb);
}

async function addGaleriPhoto() {
  const url = document.getElementById('galeri-url-input').value.trim();
  const caption = document.getElementById('galeri-caption-input').value.trim();
  if (!url) return;
  const id = await fsAdd('galeri', { url, caption, addedAt: Date.now() });
  galeriPhotos.push({ id, url, caption });
  document.getElementById('galeri-url-input').value = '';
  document.getElementById('galeri-caption-input').value = '';
  renderGaleri();
  logActivity('Galeri fotoğrafı eklendi');
}

async function deleteGaleriPhoto(id) {
  await fsDel('galeri', id);
  galeriPhotos = galeriPhotos.filter(p => p.id !== id);
  renderGaleri();
  logActivity('Galeri fotoğrafı silindi');
}

// ============================================================
// DEPARTMANLAR
// ============================================================
function renderDeptContents() {
  const container = document.getElementById('dept-contents');
  if (!container) return;
  const keys = Object.keys(DEPTS);
  container.innerHTML = keys.map((key, i) => {
    const def = DEPTS[key];
    const saved = deptData[key] || {};
    const ranks = def.ranks;
    const units = deptUnits[key] || [];
    const status = saved.status || 'active';
    const statusLabel = { active:'✅ Aktif', passive:'⏸ Pasif', full:'🔒 Dolu' }[status] || '✅ Aktif';
    const personelCount = saved.personel || '—';

    return `
    <div id="fdept-${key}" class="fandom-content ${i===0?'active':''}">
      <div class="fd-header">
        <div class="fd-img-wrap">
          ${saved.img ? `<img src="${saved.img}" alt="${def.name}" />` : `<div class="fd-img-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>Departman Görseli</span></div>`}
        </div>
        <div class="fd-info">
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-bottom:0.8rem;">
            <div class="fd-tag">${def.tag}</div>
            <div class="fd-status-badge status-${status}">${statusLabel}</div>
            <div class="fd-personel-badge">👤 ${personelCount} personel</div>
          </div>
          <h3>${def.name}</h3>
          <div class="fd-short">${key.toUpperCase()}</div>
          <p>${saved.desc || 'Açıklama henüz eklenmemiş.'}</p>
        </div>
      </div>
      <div class="fd-ranks">
        <div class="fd-ranks-title">Komuta Kademesi</div>
        <div class="fd-ranks-grid">
          ${ranks.map((r,ri) => {
            const cls = ri===0?'gold-rank':ri===1?'silver-rank':'bronze-rank';
            const icon = ri===0?'★★★':ri===1?'★★':'★';
            const holder = saved['rank'+ri] || '[ İsim ]';
            return `<div class="fd-rank-card ${cls}">
              <div class="rank-icon">${icon}</div>
              <div class="rank-name">${r}</div>
              <div class="rank-sub">${ri===0?'Departman Komutanı':ri===1?'İkinci Komuta':'Kıdemli Kadro'}</div>
              <div class="rank-holder">${holder}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
      ${units.length ? `
      <div class="fd-units" style="margin-top:1.5rem;">
        <div class="fd-ranks-title">Birimler</div>
        <div class="unit-list">${units.map(u=>`<span class="unit-badge">${u}</span>`).join('')}</div>
      </div>` : ''}
    </div>`;
  }).join('');
}

function fandomTab(id, el) {
  document.querySelectorAll('.fandom-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.fandom-content').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  const content = document.getElementById('fdept-'+id);
  if (content) content.classList.add('active');
}

// Dept Editor
function loadDeptEditor(key) {
  if (!key) { document.getElementById('dept-edit-area').style.display='none'; return; }
  currentDeptEditing = key;
  document.getElementById('dept-edit-area').style.display = 'block';
  const saved = deptData[key] || {};
  const def = DEPTS[key];
  document.getElementById('de-img').value = saved.img || '';
  document.getElementById('de-desc').value = saved.desc || '';
  document.getElementById('de-status').value = saved.status || 'active';
  document.getElementById('de-personel').value = saved.personel || '';

  // Ranks
  const ranksArea = document.getElementById('de-ranks-area');
  ranksArea.innerHTML = def.ranks.map((r,i) => `
    <div class="form-group">
      <label>${r} — İsim</label>
      <input type="text" id="de-rank-${i}" value="${saved['rank'+i]||''}" placeholder="[ İsim ]" />
    </div>`).join('');

  // Units
  deptUnits[key] = saved.units || [];
  renderUnits(key);
}

function renderUnits(key) {
  const list = document.getElementById('de-units-list');
  if (!list) return;
  list.innerHTML = (deptUnits[key]||[]).map((u,i) => `
    <div class="unit-edit-item">
      <span class="unit-badge">${u}</span>
      <button class="action-btn danger" onclick="removeUnit(${i})" style="padding:0.2rem 0.6rem;margin:0;">✕</button>
    </div>`).join('');
}

function addUnit() {
  const input = document.getElementById('de-unit-input');
  const val = input.value.trim();
  if (!val || !currentDeptEditing) return;
  if (!deptUnits[currentDeptEditing]) deptUnits[currentDeptEditing] = [];
  deptUnits[currentDeptEditing].push(val);
  input.value = '';
  renderUnits(currentDeptEditing);
}

function removeUnit(i) {
  if (!currentDeptEditing) return;
  deptUnits[currentDeptEditing].splice(i,1);
  renderUnits(currentDeptEditing);
}

async function saveDeptData() {
  if (!currentDeptEditing) return;
  const key = currentDeptEditing;
  const def = DEPTS[key];
  const data = {
    img: document.getElementById('de-img').value.trim(),
    desc: document.getElementById('de-desc').value.trim(),
    status: document.getElementById('de-status').value,
    personel: document.getElementById('de-personel').value,
    units: deptUnits[key] || []
  };
  def.ranks.forEach((r,i) => {
    data['rank'+i] = document.getElementById('de-rank-'+i)?.value?.trim() || '';
  });
  await fsSet('depts/'+key, data);
  deptData[key] = { ...data, id: key };
  renderDeptContents();
  alert('✅ ' + key.toUpperCase() + ' departmanı kaydedildi!');
  logActivity(key.toUpperCase() + ' departmanı güncellendi');
}

// ============================================================
// KURALLAR
// ============================================================
function renderRules() {
  ['rules','ceza'].forEach(k => {
    const d = rulesData[k] || {};
    const notSet = document.getElementById(k+'-not-set');
    const viewArea = document.getElementById(k+'-view-area');
    const openBtn = document.getElementById(k+'-open-btn');
    const embedArea = document.getElementById(k+'-embed-area');
    if (!notSet) return;
    if (d.url) {
      notSet.style.display = 'none';
      viewArea.style.display = 'block';
      openBtn.href = d.url;
      if (d.embed && embedArea) {
        const fileId = extractDriveId(d.url);
        if (fileId) {
          embedArea.innerHTML = `<iframe src="https://drive.google.com/file/d/${fileId}/preview" width="100%" height="500" frameborder="0" style="border-radius:6px;"></iframe>`;
        }
      } else if (embedArea) {
        embedArea.innerHTML = '';
      }
    } else {
      notSet.style.display = 'flex';
      viewArea.style.display = 'none';
    }
  });

  // Admin input doldur
  if (document.getElementById('rules-url-input')) {
    document.getElementById('rules-url-input').value = rulesData.rules?.url || '';
    document.getElementById('ceza-url-input').value = rulesData.ceza?.url || '';
    document.getElementById('rules-embed-toggle').value = rulesData.rules?.embed ? '1' : '0';
    document.getElementById('ceza-embed-toggle').value = rulesData.ceza?.embed ? '1' : '0';
  }
}

function extractDriveId(url) {
  const m = url.match(/\/file\/d\/([^/]+)/);
  return m ? m[1] : null;
}

async function saveRulesUrl(key) {
  const url = document.getElementById(key+'-url-input').value.trim();
  const embed = document.getElementById(key+'-embed-toggle').value === '1';
  if (!rulesData[key]) rulesData[key] = {};
  rulesData[key].url = url;
  rulesData[key].embed = embed;
  await fsSet('site/rules', rulesData);
  renderRules();
  alert('✅ Kaydedildi!');
  logActivity(key + ' Drive linki güncellendi');
}

// ============================================================
// STATS
// ============================================================
function renderStats() {
  document.getElementById('stat-personel').textContent = statsData.personel;
  document.getElementById('stat-birim').textContent = statsData.birim;
  document.getElementById('stat-dept').textContent = statsData.dept;
  document.getElementById('adash-personel').textContent = statsData.personel;
  document.getElementById('adash-birim').textContent = statsData.birim;
  document.getElementById('adash-dept').textContent = statsData.dept;
}

async function saveStats() {
  const p = document.getElementById('se-personel').value;
  const b = document.getElementById('se-birim').value;
  const d = document.getElementById('se-dept').value;
  if (p) statsData.personel = p;
  if (b) statsData.birim = b;
  if (d) statsData.dept = d;
  await fsSet('site/stats', statsData);
  renderStats();
  alert('✅ İstatistikler güncellendi!');
  logActivity('İstatistikler güncellendi');
}

// ============================================================
// WEEK
// ============================================================
function renderWeek() {
  document.getElementById('week-name').textContent = weekData.name || '[ İsim ]';
  document.getElementById('week-role').textContent = weekData.role || '[ Görev ]';
  document.getElementById('week-tenure').textContent = 'Görev Süreci: ' + (weekData.tenure || '—');
  document.getElementById('week-msg').textContent = weekData.msg || '';
  document.getElementById('week-num-display').textContent = weekData.num || 'Hafta #1';
  const ph = document.getElementById('week-photo-placeholder');
  const area = document.getElementById('week-photo-area');
  if (weekData.photo) {
    const existing = area.querySelector('img.week-real-photo');
    if (existing) existing.remove();
    const img = document.createElement('img');
    img.src = weekData.photo;
    img.className = 'week-real-photo';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0;';
    area.appendChild(img);
    if (ph) ph.style.display = 'none';
  }
}

async function saveWeek() {
  // Mevcut haftayı arşive ekle
  if (weekData.name && weekData.name !== '[ İsim Soyisim ]') {
    const archiveEntry = { ...weekData, savedAt: Date.now() };
    const aid = await fsAdd('weekArchive', archiveEntry);
    weekArchive.unshift({ ...archiveEntry, id: aid });
  }

  weekData = {
    photo: document.getElementById('we-photo').value.trim(),
    name: document.getElementById('we-name').value.trim() || '[ İsim ]',
    role: document.getElementById('we-role').value.trim() || '[ Görev ]',
    tenure: document.getElementById('we-tenure').value.trim() || '—',
    msg: document.getElementById('we-msg').value.trim() || 'Tebrikler!',
    num: document.getElementById('we-num').value.trim() || 'Hafta #1'
  };
  await fsSet('site/week', weekData);
  renderWeek();
  renderArchive();
  renderWeekArchiveAdmin();
  alert('✅ Haftanın memuru güncellendi!');
  logActivity('Haftanın memuru güncellendi: ' + weekData.name);
}

function renderArchive() {
  const list = document.getElementById('archive-list');
  if (!list) return;
  if (!weekArchive.length) { list.innerHTML = '<div style="color:var(--gray);text-align:center;padding:3rem;font-size:0.85rem;">Henüz arşiv kaydı yok.</div>'; return; }
  list.innerHTML = weekArchive.map(w => `
    <div class="archive-card">
      <div class="archive-week">${w.num}</div>
      <div class="archive-name">${w.name}</div>
      <div class="archive-role">${w.role}</div>
      <div class="archive-msg">${w.msg}</div>
    </div>`).join('');
}

function renderWeekArchiveAdmin() {
  const el = document.getElementById('week-archive-admin');
  if (!el) return;
  if (!weekArchive.length) { el.innerHTML = '<div class="empty-list">Henüz arşiv yok.</div>'; return; }
  el.innerHTML = weekArchive.slice(0,10).map(w => `
    <div class="sub-item" style="grid-template-columns:1fr auto;">
      <div>
        <h4>${w.name}</h4>
        <div class="sub-meta">${w.num} · ${w.role}</div>
      </div>
      <span class="sub-badge read">${w.num}</span>
    </div>`).join('');
}

// ============================================================
// FORMS
// ============================================================
function formTab(id, el) {
  document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('form-'+id).classList.add('active');
}

async function submitForm(type) {
  const fields = {
    lsb: ['lsb-name','lsb-discord','lsb-gorev','lsb-sure','lsb-dept','lsb-why','lsb-exp'],
    ds:  ['ds-name','ds-discord','ds-dept','ds-tur','ds-aciklama'],
    lss: ['lss-name','lss-discord','lss-hedef','lss-tarih','lss-aciklama','lss-kanit']
  };
  const data = { type, date: new Date().toLocaleString('tr-TR') };
  let filled = false;
  (fields[type]||[]).forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value) { data[id] = el.value; filled = true; }
  });
  if (!filled) return;

  const id = await fsAdd('submissions', data);
  submissions[type].push({ ...data, id });

  document.getElementById(type+'-form').style.display = 'none';
  document.getElementById(type+'-success').style.display = 'block';
  updateAdminLists();
  updateFormCount();
}

function updateFormCount() {
  const total = submissions.lsb.length + submissions.ds.length + submissions.lss.length;
  const el = document.getElementById('adash-forms');
  if (el) el.textContent = total;
  ['lsb','ds','lss'].forEach(t => {
    const b = document.getElementById('badge-'+t);
    if (b) b.textContent = submissions[t].length;
  });
}

function updateAdminLists() {
  ['lsb','ds','lss'].forEach(type => {
    const list = document.getElementById('list-'+type);
    if (!list) return;
    if (!submissions[type].length) { list.innerHTML = '<div class="empty-list">Henüz kayıt yok.</div>'; return; }
    list.innerHTML = submissions[type].map((s,i) => `
      <div class="sub-item">
        <div>
          <h4>${typeLabel(type)} #${i+1}</h4>
          <p>${Object.entries(s).filter(([k])=>!['type','date','id'].includes(k)).map(([k,v])=>v).join(' · ')}</p>
          <div class="sub-meta">${s.date}</div>
          <button class="action-btn danger" onclick="deleteSubmission('${type}','${s.id}')">Sil</button>
        </div>
        <span class="sub-badge new">Yeni</span>
      </div>`).join('');
  });
}

async function deleteSubmission(type, id) {
  await fsDel('submissions', id);
  submissions[type] = submissions[type].filter(s => s.id !== id);
  updateAdminLists();
  updateFormCount();
  logActivity('Form silindi: ' + type);
}

function exportForms(type) {
  if (!submissions[type].length) { alert('Dışa aktarılacak kayıt yok.'); return; }
  const text = submissions[type].map((s,i) =>
    `=== ${typeLabel(type)} #${i+1} ===\n` +
    Object.entries(s).filter(([k])=>!['type','id'].includes(k)).map(([k,v])=>`${k}: ${v}`).join('\n')
  ).join('\n\n');
  const blob = new Blob([text], { type:'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = type + '_' + new Date().toISOString().slice(0,10) + '.txt';
  a.click();
}

function typeLabel(t) {
  return { lsb:'Sup Başvurusu', ds:'Dept Şikayeti', lss:'Sup Şikayeti' }[t]||t;
}

// ============================================================
// ADMIN LOGIN
// ============================================================
function adminLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  const acc = accounts.find(a => a.user===u && a.pass===p);
  if (acc) {
    currentUser = acc;
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dash').classList.add('shown');
    document.getElementById('welcome-name').textContent = acc.name;
    document.getElementById('last-login').textContent = new Date().toLocaleString('tr-TR');
    document.getElementById('login-err').style.display = 'none';
    updateAdminLists();
    updateFormCount();
    renderWeekArchiveAdmin();
    renderGaleri();
    renderAnnouncements();
    renderRules();
    logActivity('Giriş yapıldı: ' + acc.name);
  } else {
    document.getElementById('login-err').style.display = 'block';
  }
}

document.getElementById('login-pass').addEventListener('keydown', e => { if(e.key==='Enter') adminLogin(); });

function adminLogout() {
  if (currentUser) logActivity('Çıkış yapıldı: ' + currentUser.name);
  currentUser = null;
  document.getElementById('admin-login').style.display = 'flex';
  document.getElementById('admin-dash').classList.remove('shown');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

function adminSection(id, el) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const sec = document.getElementById('asec-'+id);
  if (sec) sec.classList.add('active');
  if (el) el.classList.add('active');
}

// ============================================================
// ACCOUNTS
// ============================================================
function renderAccounts() {
  const grid = document.getElementById('accounts-grid');
  if (!grid) return;
  grid.innerHTML = accounts.map((a,i) => `
    <div class="account-card">
      <div class="ac-name">${a.name}</div>
      <div class="ac-role ${a.role==='manager'?'ac-manager':'ac-sup'}">${a.role==='manager'?'Legal Manager':'Legal Sup'}</div>
      <p>@${a.user}</p>
      ${i===0?`<button class="action-btn" disabled>Silinemez</button>`:`<button class="action-btn danger" onclick="deleteAccount(${i})">Sil</button>`}
    </div>`).join('');
}

async function createAccount() {
  const u = document.getElementById('new-user').value.trim();
  const p = document.getElementById('new-pass').value;
  const r = document.getElementById('new-role').value;
  const n = document.getElementById('new-name').value.trim();
  if (!u||!p||!n) return;
  accounts.push({ user:u, pass:p, role:r, name:n });
  await fsSet('site/accounts', { list: accounts });
  renderAccounts();
  document.getElementById('acc-msg').style.display = 'block';
  setTimeout(()=>{ document.getElementById('acc-msg').style.display='none'; }, 3000);
  document.getElementById('new-user').value='';
  document.getElementById('new-pass').value='';
  document.getElementById('new-name').value='';
  logActivity('Yeni hesap oluşturuldu: ' + n);
}

async function deleteAccount(i) {
  logActivity('Hesap silindi: ' + accounts[i].name);
  accounts.splice(i,1);
  await fsSet('site/accounts', { list: accounts });
  renderAccounts();
}

// ============================================================
// ŞİFRE DEĞİŞTİR
// ============================================================
async function changePassword() {
  const old = document.getElementById('pw-old').value;
  const n1 = document.getElementById('pw-new').value;
  const n2 = document.getElementById('pw-new2').value;
  const msg = document.getElementById('pw-msg');
  if (!currentUser) return;
  if (old !== currentUser.pass) { msg.style.display='block'; msg.style.color='#E74C3C'; msg.textContent='Mevcut şifre hatalı.'; return; }
  if (n1 !== n2) { msg.style.display='block'; msg.style.color='#E74C3C'; msg.textContent='Yeni şifreler eşleşmiyor.'; return; }
  if (n1.length < 6) { msg.style.display='block'; msg.style.color='#E74C3C'; msg.textContent='Şifre en az 6 karakter olmalı.'; return; }
  const idx = accounts.findIndex(a => a.user === currentUser.user);
  if (idx >= 0) { accounts[idx].pass = n1; currentUser.pass = n1; }
  await fsSet('site/accounts', { list: accounts });
  msg.style.display='block'; msg.style.color='#27AE60'; msg.textContent='Şifre başarıyla değiştirildi!';
  document.getElementById('pw-old').value='';
  document.getElementById('pw-new').value='';
  document.getElementById('pw-new2').value='';
  logActivity('Şifre değiştirildi: ' + currentUser.name);
}

// ============================================================
// AKTİVİTE LOGU
// ============================================================
async function logActivity(msg) {
  const entry = { msg, user: currentUser?.name || 'Sistem', time: new Date().toLocaleString('tr-TR') };
  activityLog.unshift(entry);
  if (activityLog.length > 50) activityLog = activityLog.slice(0,50);
  await fsSet('site/activityLog', { log: activityLog });
  renderActivityLogList();
}

function renderActivityLogList() {
  const el = document.getElementById('activity-log-list');
  if (!el) return;
  if (!activityLog.length) { el.innerHTML = '<div class="empty-list">Log boş.</div>'; return; }
  el.innerHTML = activityLog.map(l => `
    <div class="log-item">
      <div class="log-msg">${l.msg}</div>
      <div class="log-meta">${l.user} · ${l.time}</div>
    </div>`).join('');
}

async function clearLog() {
  activityLog = [];
  await fsSet('site/activityLog', { log: [] });
  renderActivityLogList();
}

// ============================================================
// START
// ============================================================
initApp().then(() => {
  renderAccounts();
});

// ============================================================
// GLOBAL EXPORTS — onclick'ler için window'a bağla
// ============================================================
window.goPage = goPage;
window.toggleMobileNav = toggleMobileNav;
window.closeMobileNav = closeMobileNav;
window.toggleTheme = toggleTheme;
window.openSearch = openSearch;
window.closeSearch = closeSearch;
window.doSearch = doSearch;
window.closeAnn = closeAnn;
window.saveAnnouncement = saveAnnouncement;
window.toggleAnn = toggleAnn;
window.deleteAnn = deleteAnn;
window.addGaleriPhoto = addGaleriPhoto;
window.deleteGaleriPhoto = deleteGaleriPhoto;
window.fandomTab = fandomTab;
window.loadDeptEditor = loadDeptEditor;
window.addUnit = addUnit;
window.removeUnit = removeUnit;
window.saveDeptData = saveDeptData;
window.saveRulesUrl = saveRulesUrl;
window.saveStats = saveStats;
window.saveWeek = saveWeek;
window.formTab = formTab;
window.submitForm = submitForm;
window.deleteSubmission = deleteSubmission;
window.exportForms = exportForms;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.adminSection = adminSection;
window.createAccount = createAccount;
window.deleteAccount = deleteAccount;
window.changePassword = changePassword;
window.clearLog = clearLog;
