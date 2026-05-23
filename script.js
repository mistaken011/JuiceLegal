// ======================================================
// STATE
// ======================================================
let accounts = [
  { user: 'admin', pass: 'justice2024', role: 'manager', name: 'Admin' }
];
let submissions = { lsb:[], ds:[], lss:[] };
let activityLog = [];
let currentAdmin = null;
let weekHistory = [];
let driveLinks = { rules:'', ceza:'' };
let currentDeptKey = null;

// Default departments
let departments = [
  { key:'mrpd', short:'MRPD', name:'Mission Row Police Department', tag:'Emniyet', desc:'Mission Row Polis Departmanı, Los Santos şehir merkezinin güvenliğinden sorumlu ana kolluk kuvvetidir.', img:'', status:'aktif', ranks:[{icon:'★★★',name:'Captain',sub:'Departman Komutanı',holder:'[ İsim ]',photo:''},{icon:'★★',name:'Lieutenant',sub:'İkinci Komuta',holder:'[ İsim ]',photo:''},{icon:'★',name:'Sergeant',sub:'Kıdemli Subay',holder:'[ İsim ]',photo:''}], units:[], personnel:[] },
  { key:'vpd', short:'VPD', name:'Vespucci Police Department', tag:'Emniyet', desc:'Vespucci Polis Departmanı, sahil bölgesi ve Vespucci Plajı\'nın güvenliğinden sorumlu kolluk birimidir.', img:'', status:'aktif', ranks:[{icon:'★★★',name:'Captain',sub:'Departman Komutanı',holder:'[ İsim ]',photo:''},{icon:'★★',name:'Lieutenant',sub:'İkinci Komuta',holder:'[ İsim ]',photo:''},{icon:'★',name:'Sergeant',sub:'Kıdemli Subay',holder:'[ İsim ]',photo:''}], units:[], personnel:[] },
  { key:'dsd', short:'DSD', name:'Davis Sheriff Office', tag:'Şerif Ofisi', desc:'Davis Şerif Ofisi, Davis bölgesi ve çevresinin güvenliğini sağlayan şerif birimidir.', img:'', status:'aktif', ranks:[{icon:'★★★',name:'Captain',sub:'Departman Komutanı',holder:'[ İsim ]',photo:''},{icon:'★★',name:'Lieutenant',sub:'İkinci Komuta',holder:'[ İsim ]',photo:''},{icon:'★',name:'Sergeant',sub:'Kıdemli Subay',holder:'[ İsim ]',photo:''}], units:[], personnel:[] },
  { key:'sahp', short:'SAHP', name:'San Andreas Highway Patrol', tag:'Devlet Polisi', desc:'San Andreas Karayolu Polisi, eyalet genelindeki otoyollar üzerindeki trafik denetiminden sorumludur.', img:'', status:'aktif', ranks:[{icon:'★★★',name:'Captain',sub:'Departman Komutanı',holder:'[ İsim ]',photo:''},{icon:'★★',name:'Lieutenant',sub:'İkinci Komuta',holder:'[ İsim ]',photo:''},{icon:'★',name:'Sergeant',sub:'Kıdemli Subay',holder:'[ İsim ]',photo:''}], units:[], personnel:[] },
  { key:'sdso', short:'SDSO', name:'Senora Desert Sheriff Office', tag:'Şerif Ofisi', desc:'Senora Çölü Şerif Ofisi, çöl bölgesi ve geniş kırsal alanlardaki güvenlik operasyonlarını yürütür.', img:'', status:'aktif', ranks:[{icon:'★★★',name:'Captain',sub:'Departman Komutanı',holder:'[ İsim ]',photo:''},{icon:'★★',name:'Lieutenant',sub:'İkinci Komuta',holder:'[ İsim ]',photo:''},{icon:'★',name:'Sergeant',sub:'Kıdemli Subay',holder:'[ İsim ]',photo:''}], units:[], personnel:[] },
  { key:'pbso', short:'PBSO', name:'Paleto Bay Sheriff Office', tag:'Şerif Ofisi', desc:'Paleto Bay Şerif Ofisi, kuzey bölgeleri ve Paleto Körfezi çevresindeki güvenliği sağlar.', img:'', status:'aktif', ranks:[{icon:'★★★',name:'Captain',sub:'Departman Komutanı',holder:'[ İsim ]',photo:''},{icon:'★★',name:'Lieutenant',sub:'İkinci Komuta',holder:'[ İsim ]',photo:''},{icon:'★',name:'Sergeant',sub:'Kıdemli Subay',holder:'[ İsim ]',photo:''}], units:[], personnel:[] },
  { key:'sapr', short:'SAPR', name:'San Andreas Park Ranger', tag:'Park & Doğa', desc:'San Andreas Park Korucuları, milli parklar ve orman alanlarının güvenliğini sağlar.', img:'', status:'aktif', ranks:[{icon:'★★★',name:'Captain',sub:'Birim Komutanı',holder:'[ İsim ]',photo:''},{icon:'★★',name:'Lieutenant',sub:'İkinci Komuta',holder:'[ İsim ]',photo:''},{icon:'★',name:'Sergeant',sub:'Kıdemli Korucu',holder:'[ İsim ]',photo:''}], units:[], personnel:[] },
  { key:'doj', short:'DOJ', name:'Department Of Justice', tag:'Adalet Bakanlığı', desc:'Adalet Bakanlığı, tüm hukuki süreçlerin en üst denetim merciidir.', img:'', status:'aktif', ranks:[{icon:'⚖',name:'Yargıç',sub:'Yargı Mercii',holder:'[ İsim ]',photo:''},{icon:'⚖',name:'Savcı',sub:'İddianame Makamı',holder:'[ İsim ]',photo:''},{icon:'⚖',name:'Baro Başkanı',sub:'Savunma Mercii',holder:'[ İsim ]',photo:''}], units:[], personnel:[] },
  { key:'lsms', short:'LSMS', name:'Los Santos Medical Services', tag:'Sağlık', desc:'Los Santos Sağlık Hizmetleri, şehir genelinde acil tıbbi müdahale ve sağlık hizmetlerini yürütür.', img:'', status:'aktif', ranks:[{icon:'✚',name:'Başhekim',sub:'Birim Başkanı',holder:'[ İsim ]',photo:''},{icon:'✚',name:'Başhekim Yardımcısı',sub:'İkinci Komuta',holder:'[ İsim ]',photo:''}], units:[], personnel:[] },
  { key:'lswn', short:'LSWN', name:'Los Santos Weazel News', tag:'Medya', desc:'Los Santos Weazel News, şehrin resmi haber ve medya kuruluşudur.', img:'', status:'aktif', ranks:[{icon:'📡',name:'Yönetici',sub:'Genel Yayın Yönetmeni',holder:'[ İsim ]',photo:''},{icon:'📡',name:'Yönetici Yardımcısı',sub:'İkinci Komuta',holder:'[ İsim ]',photo:''}], units:[], personnel:[] }
];

// ======================================================
// VISITOR COUNTER
// ======================================================
function initVisitor() {
  let count = parseInt(localStorage.getItem('jl_visitors') || '0');
  const visited = sessionStorage.getItem('jl_visited');
  if (!visited) {
    count++;
    localStorage.setItem('jl_visitors', count);
    sessionStorage.setItem('jl_visited', '1');
  }
  const el = document.getElementById('stat-visitors');
  if (el) el.textContent = count;
}

// ======================================================
// THEME
// ======================================================
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const btn = document.getElementById('theme-btn');
  btn.textContent = document.body.classList.contains('light-theme') ? '🌙' : '☀';
  localStorage.setItem('jl_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}
function initTheme() {
  if (localStorage.getItem('jl_theme') === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('theme-btn').textContent = '🌙';
  }
}

// ======================================================
// NAVIGATION
// ======================================================
function goPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  window.scrollTo(0, 0);
}

// ======================================================
// SEARCH
// ======================================================
const searchIndex = [
  { page: 'hakkimizda', label: 'Hakkımızda', keywords: 'hakkımızda juice legal departman personel adalet düzen hukuk başvur' },
  { page: 'galeri', label: 'Galeri', keywords: 'galeri fotoğraf resim görsel departman' },
  { page: 'departmanlar', label: 'Departmanlar', keywords: 'departmanlar mrpd vpd dsd sahp sdso pbso sapr doj lsms lswn emniyet polis şerif adalet sağlık medya' },
  { page: 'formlar', label: 'Formlar', keywords: 'formlar başvuru şikayet öneri legal sup departman' },
  { page: 'kurallar', label: 'Kurallar & Kanunlar', keywords: 'kurallar kanunlar ceza hukuk mevzuat' },
  { page: 'hafta', label: 'Haftanın Memuru', keywords: 'haftanın memuru haftalık takdir personel arşiv' },
  { page: 'admin', label: 'Admin Panel', keywords: 'admin yönetici panel giriş' }
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
document.getElementById('search-input').addEventListener('input', function() {
  const q = this.value.trim().toLowerCase();
  const res = document.getElementById('search-results');
  if (!q) { res.innerHTML = ''; return; }
  const matches = [];
  searchIndex.forEach(item => {
    if (item.keywords.includes(q) || item.label.toLowerCase().includes(q)) matches.push(item);
  });
  departments.forEach(d => {
    if (d.name.toLowerCase().includes(q) || d.short.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)) {
      matches.push({ page: 'departmanlar', label: 'Departmanlar — ' + d.short, keywords: '', _deptKey: d.key });
    }
  });
  if (!matches.length) { res.innerHTML = '<div class="search-result-item"><div class="res-text" style="color:var(--gray);">Sonuç bulunamadı.</div></div>'; return; }
  res.innerHTML = matches.map(m => `
    <div class="search-result-item" onclick="searchGoTo('${m.page}','${m._deptKey||''}')">
      <div class="res-page">${m.label.split('—')[0].trim()}</div>
      <div class="res-text">${m.label}</div>
    </div>`).join('');
});
function searchGoTo(page, deptKey) {
  closeSearch();
  goPage(page);
  if (deptKey) {
    setTimeout(() => {
      const tab = document.querySelector(`.fandom-tab[data-key="${deptKey}"]`);
      if (tab) { tab.click(); tab.scrollIntoView({ behavior: 'smooth' }); }
    }, 100);
  }
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
document.getElementById('search-overlay').addEventListener('click', function(e) { if (e.target === this) closeSearch(); });

// ======================================================
// ANNOUNCEMENT
// ======================================================
function saveAnnouncement() {
  const text = document.getElementById('ann-input').value.trim();
  if (!text) return;
  const bar = document.getElementById('announcement-bar');
  document.getElementById('ann-text').textContent = text;
  bar.style.display = 'block';
  localStorage.setItem('jl_announcement', text);
  addLog('Duyuru yayınlandı: ' + text.substring(0, 40) + '...');
  alert('✅ Duyuru yayınlandı!');
}
function removeAnnouncement() {
  document.getElementById('announcement-bar').style.display = 'none';
  localStorage.removeItem('jl_announcement');
  addLog('Duyuru kaldırıldı.');
}
function closeAnnouncement() {
  document.getElementById('announcement-bar').style.display = 'none';
}
function loadAnnouncement() {
  const saved = localStorage.getItem('jl_announcement');
  if (saved) {
    document.getElementById('ann-text').textContent = saved;
    document.getElementById('announcement-bar').style.display = 'block';
    document.getElementById('ann-input').value = saved;
  }
}

// ======================================================
// DEPARTMENTS — RENDER
// ======================================================
function renderDepartmentTabs() {
  const tabs = document.getElementById('dept-tabs');
  const contents = document.getElementById('dept-contents');
  tabs.innerHTML = '';
  contents.innerHTML = '';
  departments.forEach((d, i) => {
    const dotClass = `dot-${d.status}`;
    const tab = document.createElement('div');
    tab.className = 'fandom-tab' + (i === 0 ? ' active' : '');
    tab.dataset.key = d.key;
    tab.innerHTML = d.short + `<span class="dept-status-dot ${dotClass}"></span>`;
    tab.onclick = function() {
      document.querySelectorAll('.fandom-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.fandom-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('fdept-' + d.key).classList.add('active');
    };
    tabs.appendChild(tab);

    const content = document.createElement('div');
    content.id = 'fdept-' + d.key;
    content.className = 'fandom-content' + (i === 0 ? ' active' : '');
    content.innerHTML = renderDeptContent(d);
    contents.appendChild(content);
  });
}

function renderDeptContent(d) {
  const imgHTML = d.img
    ? `<img src="${d.img}" alt="${d.name}" />`
    : `<div class="fd-img-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>Departman Görseli</span></div>`;
  const statusLabel = {aktif:'Aktif',pasif:'Pasif',dolu:'Dolu'}[d.status] || 'Aktif';
  const rankClasses = ['gold-rank','silver-rank','bronze-rank'];
  const ranksHTML = d.ranks.map((r, i) => {
    const cls = rankClasses[i] || 'bronze-rank';
    const photoHTML = r.photo ? `<img src="${r.photo}" class="rank-photo" alt="${r.name}" />` : '';
    return `<div class="fd-rank-card ${cls}">${photoHTML}<div class="rank-icon">${r.icon}</div><div class="rank-name">${r.name}</div><div class="rank-sub">${r.sub}</div><div class="rank-holder">${r.holder || '[ İsim ]'}</div></div>`;
  }).join('');
  const unitsHTML = d.units && d.units.length ? `<div class="fd-units"><div class="fd-units-title">Alt Birimler</div>${d.units.map(u=>`<div class="unit-item"><span class="unit-name">${u.name}</span><span class="unit-count">${u.count||0} personel</span></div>`).join('')}</div>` : '';
  const personnelHTML = d.personnel && d.personnel.length ? `<div class="fd-personnel"><div class="fd-personnel-title">Personel <span class="personnel-count">${d.personnel.length}</span></div><div class="fd-personnel-grid">${d.personnel.map(p=>{const ava=p.photo?`<img src="${p.photo}" class="personnel-avatar" alt="${p.name}" />`:`<div class="personnel-avatar-placeholder">${(p.name||'?').charAt(0)}</div>`;return `<div class="personnel-card">${ava}<div class="personnel-name">${p.name}</div><div class="personnel-rank">${p.rank}</div></div>`}).join('')}</div></div>` : '';

  return `
    <div class="fd-header">
      <div class="fd-img-wrap">${imgHTML}</div>
      <div class="fd-info">
        <div class="fd-status-badge status-${d.status}"><span style="width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block;"></span>${statusLabel}</div>
        <div class="fd-tag">${d.tag}</div>
        <h3>${d.name}</h3>
        <div class="fd-short">${d.short}</div>
        <p>${d.desc}</p>
      </div>
    </div>
    <div class="fd-ranks">
      <div class="fd-ranks-title">Komuta Kademesi</div>
      <div class="fd-ranks-grid">${ranksHTML}</div>
    </div>
    ${unitsHTML}
    ${personnelHTML}`;
}

// ======================================================
// DEPARTMENT EDITOR
// ======================================================
function renderAdminDeptSelector() {
  const list = document.getElementById('dept-sel-list');
  list.innerHTML = departments.map(d => `
    <div class="dept-sel-item${currentDeptKey === d.key ? ' active' : ''}" onclick="selectDeptForEdit('${d.key}')">${d.short} — ${d.name}</div>
  `).join('');
}

function selectDeptForEdit(key) {
  currentDeptKey = key;
  const d = departments.find(x => x.key === key);
  if (!d) return;
  renderAdminDeptSelector();
  const panel = document.getElementById('dept-edit-panel');

  const ranksEditorHTML = d.ranks.map((r, i) => `
    <div class="rank-editor-row">
      <div class="form-group" style="margin:0"><label style="font-size:0.6rem;">İkon / Sembol</label><input type="text" value="${r.icon}" onchange="updateRank('${key}',${i},'icon',this.value)" style="padding:0.4rem 0.6rem;" /></div>
      <div class="form-group" style="margin:0"><label style="font-size:0.6rem;">Rütbe Adı</label><input type="text" value="${r.name}" onchange="updateRank('${key}',${i},'name',this.value)" style="padding:0.4rem 0.6rem;" /></div>
      <div class="form-group" style="margin:0"><label style="font-size:0.6rem;">Görev / İsim</label><input type="text" value="${r.holder}" onchange="updateRank('${key}',${i},'holder',this.value)" placeholder="[ İsim ]" style="padding:0.4rem 0.6rem;" /></div>
      <div class="form-group" style="margin:0"><label style="font-size:0.6rem;">Fotoğraf URL</label><input type="text" value="${r.photo||''}" onchange="updateRank('${key}',${i},'photo',this.value)" placeholder="https://..." style="padding:0.4rem 0.6rem;" /></div>
    </div>`).join('');

  const unitsEditorHTML = (d.units || []).map((u, i) => `
    <div class="unit-editor-row" id="unit-row-${key}-${i}">
      <div class="form-group" style="margin:0"><input type="text" value="${u.name}" onchange="updateUnit('${key}',${i},'name',this.value)" placeholder="Birim Adı" style="padding:0.4rem 0.6rem;" /></div>
      <div class="form-group" style="margin:0"><input type="number" value="${u.count||0}" onchange="updateUnit('${key}',${i},'count',this.value)" placeholder="Personel" style="padding:0.4rem 0.6rem;" /></div>
      <button class="action-btn danger" onclick="removeUnit('${key}',${i})" style="margin:0;">Sil</button>
    </div>`).join('');

  const personnelEditorHTML = (d.personnel || []).map((p, i) => `
    <div class="personnel-editor-row" id="pers-row-${key}-${i}">
      <div class="form-group" style="margin:0"><input type="text" value="${p.name}" onchange="updatePersonnel('${key}',${i},'name',this.value)" placeholder="İsim Soyisim" style="padding:0.4rem 0.6rem;" /></div>
      <div class="form-group" style="margin:0"><input type="text" value="${p.rank}" onchange="updatePersonnel('${key}',${i},'rank',this.value)" placeholder="Rütbe" style="padding:0.4rem 0.6rem;" /></div>
      <div class="form-group" style="margin:0"><input type="text" value="${p.photo||''}" onchange="updatePersonnel('${key}',${i},'photo',this.value)" placeholder="Fotoğraf URL" style="padding:0.4rem 0.6rem;" /></div>
      <button class="action-btn danger" onclick="removePersonnel('${key}',${i})" style="margin:0;">Sil</button>
    </div>`).join('');

  panel.innerHTML = `
    <div class="dept-edit-section">
      <div class="dept-edit-section-title">Temel Bilgiler</div>
      <div class="form-group"><label>Departman Adı</label><input type="text" value="${d.name}" onchange="updateDeptField('${key}','name',this.value)" /></div>
      <div class="form-row">
        <div class="form-group"><label>Kısa Ad</label><input type="text" value="${d.short}" onchange="updateDeptField('${key}','short',this.value)" /></div>
        <div class="form-group"><label>Kategori Etiketi</label><input type="text" value="${d.tag}" onchange="updateDeptField('${key}','tag',this.value)" /></div>
      </div>
      <div class="form-group"><label>Açıklama</label><textarea onchange="updateDeptField('${key}','desc',this.value)">${d.desc}</textarea></div>
      <div class="form-group"><label>Görsel URL</label><input type="text" value="${d.img||''}" onchange="updateDeptField('${key}','img',this.value)" placeholder="https://i.imgur.com/..." /></div>
      <div class="form-group"><label>Durum</label>
        <select onchange="updateDeptField('${key}','status',this.value)">
          <option value="aktif" ${d.status==='aktif'?'selected':''}>Aktif</option>
          <option value="pasif" ${d.status==='pasif'?'selected':''}>Pasif</option>
          <option value="dolu" ${d.status==='dolu'?'selected':''}>Dolu</option>
        </select>
      </div>
      <button class="submit-btn" onclick="saveDeptChanges('${key}')">Değişiklikleri Kaydet</button>
    </div>
    <div class="dept-edit-section">
      <div class="dept-edit-section-title">Komuta Kademesi</div>
      <div id="ranks-editor-${key}">${ranksEditorHTML}</div>
    </div>
    <div class="dept-edit-section">
      <div class="dept-edit-section-title">Alt Birimler</div>
      <div id="units-editor-${key}">${unitsEditorHTML}</div>
      <button class="action-btn" onclick="addUnit('${key}')" style="margin-top:0.5rem;">+ Birim Ekle</button>
    </div>
    <div class="dept-edit-section">
      <div class="dept-edit-section-title">Personel</div>
      <div id="personnel-editor-${key}">${personnelEditorHTML}</div>
      <button class="action-btn" onclick="addPersonnel('${key}')" style="margin-top:0.5rem;">+ Personel Ekle</button>
    </div>
  `;
}

function updateDeptField(key, field, value) {
  const d = departments.find(x => x.key === key);
  if (d) d[field] = value;
}
function updateRank(key, i, field, value) {
  const d = departments.find(x => x.key === key);
  if (d && d.ranks[i]) d.ranks[i][field] = value;
}
function updateUnit(key, i, field, value) {
  const d = departments.find(x => x.key === key);
  if (d && d.units[i]) d.units[i][field] = field === 'count' ? parseInt(value)||0 : value;
}
function addUnit(key) {
  const d = departments.find(x => x.key === key);
  if (!d) return;
  if (!d.units) d.units = [];
  d.units.push({ name:'Yeni Birim', count:0 });
  selectDeptForEdit(key);
}
function removeUnit(key, i) {
  const d = departments.find(x => x.key === key);
  if (d) { d.units.splice(i, 1); selectDeptForEdit(key); }
}
function updatePersonnel(key, i, field, value) {
  const d = departments.find(x => x.key === key);
  if (d && d.personnel[i]) d.personnel[i][field] = value;
}
function addPersonnel(key) {
  const d = departments.find(x => x.key === key);
  if (!d) return;
  if (!d.personnel) d.personnel = [];
  d.personnel.push({ name:'[ İsim ]', rank:'[ Rütbe ]', photo:'' });
  selectDeptForEdit(key);
}
function removePersonnel(key, i) {
  const d = departments.find(x => x.key === key);
  if (d) { d.personnel.splice(i, 1); selectDeptForEdit(key); }
}
function saveDeptChanges(key) {
  renderDepartmentTabs();
  addLog(`"${key.toUpperCase()}" departmanı güncellendi.`);
  alert('✅ Departman güncellendi!');
}

// ======================================================
// FORM TABS
// ======================================================
function formTab(id) {
  document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('form-' + id).classList.add('active');
}

// ======================================================
// FORM SUBMIT
// ======================================================
function submitForm(type) {
  let data = {};
  if (type === 'lsb') {
    data = {
      oyunAdi: document.getElementById('lsb-oyunadi').value,
      discord: document.getElementById('lsb-discord').value,
      gorev: document.getElementById('lsb-gorev').value,
      sure: document.getElementById('lsb-sure').value,
      dept: document.getElementById('lsb-dept').value,
      neden: document.getElementById('lsb-neden').value,
      deneyim: document.getElementById('lsb-deneyim').value
    };
  } else if (type === 'ds') {
    data = {
      oyunAdi: document.getElementById('ds-oyunadi').value,
      discord: document.getElementById('ds-discord').value,
      dept: document.getElementById('ds-dept').value,
      tur: document.getElementById('ds-tur').value,
      aciklama: document.getElementById('ds-aciklama').value
    };
  } else if (type === 'lss') {
    data = {
      sik: document.getElementById('lss-sik').value,
      discord: document.getElementById('lss-discord').value,
      edilen: document.getElementById('lss-edilen').value,
      tarih: document.getElementById('lss-tarih').value,
      aciklama: document.getElementById('lss-aciklama').value,
      kanit: document.getElementById('lss-kanit').value
    };
  }
  const hasData = Object.values(data).some(v => v);
  if (!hasData) return;
  data._type = type;
  data._date = new Date().toLocaleString('tr-TR');
  submissions[type].push(data);
  document.getElementById(type + '-form').style.display = 'none';
  document.getElementById(type + '-success').style.display = 'block';
  updateAdminLists();
  updateFormCount();
}

function updateFormCount() {
  let total = submissions.lsb.length + submissions.ds.length + submissions.lss.length;
  const el = document.getElementById('adash-forms');
  if (el) el.textContent = total;
}

function updateAdminLists() {
  ['lsb','ds','lss'].forEach(type => {
    const list = document.getElementById('list-' + type);
    if (!list) return;
    if (!submissions[type].length) {
      list.innerHTML = '<div class="empty-state">Henüz kayıt yok.</div>';
      return;
    }
    list.innerHTML = submissions[type].map((s, i) => {
      const fields = Object.entries(s).filter(([k]) => k !== '_type' && k !== '_date').map(([k,v]) => `<span style="color:var(--gray-light)">${v}</span>`).join(' · ');
      return `<div class="sub-item">
        <div>
          <h4>${typeLabel(type)} #${i+1}</h4>
          <p>${fields}</p>
          <div class="sub-meta">${s._date}</div>
          <button class="action-btn danger" onclick="deleteSubmission('${type}',${i})">Sil</button>
        </div>
        <span class="sub-badge new">Yeni</span>
      </div>`;
    }).join('');
  });
}

function deleteSubmission(type, idx) {
  submissions[type].splice(idx, 1);
  updateAdminLists();
  updateFormCount();
  addLog(`${typeLabel(type)} #${idx+1} silindi.`);
}

function typeLabel(t) {
  return { lsb:'Sup Başvurusu', ds:'Dept Şikayeti', lss:'Sup Şikayeti' }[t] || t;
}

// EXPORT
function exportSubmissions(type) {
  if (!submissions[type].length) { alert('Dışa aktarılacak kayıt yok.'); return; }
  const text = submissions[type].map((s, i) => {
    const lines = [`=== ${typeLabel(type)} #${i+1} — ${s._date} ===`];
    Object.entries(s).filter(([k]) => k !== '_type' && k !== '_date').forEach(([k,v]) => lines.push(`${k}: ${v}`));
    return lines.join('\n');
  }).join('\n\n');
  navigator.clipboard.writeText(text).then(() => alert('✅ Metin panoya kopyalandı!')).catch(() => alert(text));
  addLog(`${typeLabel(type)} listesi dışa aktarıldı.`);
}

// Populate dept selects in forms
function populateDeptSelects() {
  ['lsb-dept','ds-dept'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const current = sel.value;
    while (sel.options.length > 1) sel.remove(1);
    departments.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.short;
      opt.textContent = d.short + ' — ' + d.name;
      sel.appendChild(opt);
    });
    sel.value = current;
  });
}

// ======================================================
// DRIVE / KURALLAR
// ======================================================
function saveDriveLinks() {
  driveLinks.rules = document.getElementById('rules-url-input').value.trim();
  driveLinks.ceza = document.getElementById('ceza-url-input').value.trim();
  renderDriveButtons();
  localStorage.setItem('jl_drive_rules', driveLinks.rules);
  localStorage.setItem('jl_drive_ceza', driveLinks.ceza);
  addLog('Kurallar/Drive linkleri güncellendi.');
  alert('✅ Linkler kaydedildi!');
}
function loadDriveLinks() {
  driveLinks.rules = localStorage.getItem('jl_drive_rules') || '';
  driveLinks.ceza = localStorage.getItem('jl_drive_ceza') || '';
  if (driveLinks.rules) document.getElementById('rules-url-input').value = driveLinks.rules;
  if (driveLinks.ceza) document.getElementById('ceza-url-input').value = driveLinks.ceza;
  renderDriveButtons();
}
function renderDriveButtons() {
  const rw = document.getElementById('rules-btn-wrap');
  const cw = document.getElementById('ceza-btn-wrap');
  if (rw) rw.innerHTML = driveLinks.rules ? `<a class="open-doc-btn" href="${driveLinks.rules}" target="_blank"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 2L2 19h20L12 2z"/></svg> Belgeyi Aç</a>` : '<span style="font-size:0.8rem;color:var(--gray);">Doküman henüz yüklenmedi.</span>';
  if (cw) cw.innerHTML = driveLinks.ceza ? `<a class="open-doc-btn" href="${driveLinks.ceza}" target="_blank"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 2L2 19h20L12 2z"/></svg> Belgeyi Aç</a>` : '<span style="font-size:0.8rem;color:var(--gray);">Doküman henüz yüklenmedi.</span>';
}

// ======================================================
// ADMIN
// ======================================================
function adminLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  const acc = accounts.find(a => a.user === u && a.pass === p);
  if (acc) {
    currentAdmin = acc;
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dash').classList.add('shown');
    document.getElementById('welcome-name').textContent = acc.name;
    document.getElementById('login-err').style.display = 'none';
    renderAccounts();
    renderAdminDeptSelector();
    updateAdminLists();
    updateFormCount();
    renderActivityLog();
    addLog(`${acc.name} giriş yaptı.`);
  } else {
    document.getElementById('login-err').style.display = 'block';
  }
}
document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') adminLogin(); });

function adminLogout() {
  if (currentAdmin) addLog(`${currentAdmin.name} çıkış yaptı.`);
  currentAdmin = null;
  document.getElementById('admin-login').style.display = 'flex';
  document.getElementById('admin-dash').classList.remove('shown');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

function adminSection(id, el) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById('asec-' + id).classList.add('active');
  if (el) el.classList.add('active');
  if (id === 'dept-editor') { renderAdminDeptSelector(); }
}

// ACCOUNTS
function createAccount() {
  const u = document.getElementById('new-user').value.trim();
  const p = document.getElementById('new-pass').value;
  const r = document.getElementById('new-role').value;
  const n = document.getElementById('new-name').value.trim();
  if (!u || !p || !n) return;
  if (accounts.find(a => a.user === u)) { alert('Bu kullanıcı adı zaten mevcut.'); return; }
  accounts.push({ user:u, pass:p, role:r, name:n });
  renderAccounts();
  addLog(`Yeni hesap oluşturuldu: ${n} (${r})`);
  document.getElementById('acc-msg').style.display = 'block';
  setTimeout(() => document.getElementById('acc-msg').style.display = 'none', 3000);
  ['new-user','new-pass','new-name'].forEach(id => document.getElementById(id).value = '');
}
function renderAccounts() {
  const grid = document.getElementById('accounts-grid');
  grid.innerHTML = accounts.map((a, i) => `
    <div class="account-card">
      <div class="ac-name">${a.name}</div>
      <div class="ac-role ${a.role==='manager'?'ac-manager':'ac-sup'}">${a.role==='manager'?'Legal Manager':'Legal Sup'}</div>
      <p>@${a.user}</p>
      ${i===0 ? '<button class="action-btn" disabled>Silinemez</button>' : `<button class="action-btn danger" onclick="deleteAccount(${i})">Sil</button>`}
    </div>`).join('');
}
function deleteAccount(i) {
  addLog(`Hesap silindi: ${accounts[i].name}`);
  accounts.splice(i, 1);
  renderAccounts();
}

// PASSWORD CHANGE
function changePassword() {
  const oldPass = document.getElementById('cp-old').value;
  const newPass = document.getElementById('cp-new').value;
  const msg = document.getElementById('cp-msg');
  if (!currentAdmin) return;
  if (currentAdmin.pass !== oldPass) {
    msg.style.display = 'block'; msg.style.color = 'var(--danger)'; msg.textContent = 'Mevcut şifre hatalı.'; return;
  }
  if (!newPass || newPass.length < 4) {
    msg.style.display = 'block'; msg.style.color = 'var(--danger)'; msg.textContent = 'Yeni şifre en az 4 karakter olmalı.'; return;
  }
  const acc = accounts.find(a => a.user === currentAdmin.user);
  if (acc) { acc.pass = newPass; currentAdmin.pass = newPass; }
  msg.style.display = 'block'; msg.style.color = 'var(--success)'; msg.textContent = '✅ Şifre değiştirildi.';
  document.getElementById('cp-old').value = '';
  document.getElementById('cp-new').value = '';
  addLog('Şifre değiştirildi.');
  setTimeout(() => msg.style.display = 'none', 3000);
}

// ======================================================
// WEEK (HAFTA)
// ======================================================
function saveWeek() {
  const name = document.getElementById('we-name').value || '[ İsim ]';
  const role = document.getElementById('we-role').value || '[ Görev ]';
  const tenure = document.getElementById('we-tenure').value || '—';
  const msg = document.getElementById('we-msg').value || 'Tebrikler!';
  const num = document.getElementById('we-num').value || 'Hafta #1';
  const photo = document.getElementById('we-photo').value || '';

  // Archive current before overwriting
  const curName = document.getElementById('week-name').textContent;
  const curRole = document.getElementById('week-role').textContent;
  const curNum = document.getElementById('week-num-display').textContent;
  if (curName && curName !== '[ İsim Soyisim ]') {
    weekHistory.unshift({ name: curName, role: curRole, num: curNum, date: new Date().toLocaleDateString('tr-TR') });
    renderWeekArchive();
  }

  document.getElementById('week-name').textContent = name;
  document.getElementById('week-role').textContent = role;
  document.getElementById('week-tenure').textContent = 'Görev Süreci: ' + tenure;
  document.getElementById('week-msg').textContent = msg;
  document.getElementById('week-num-display').textContent = num;

  const photoInner = document.getElementById('week-photo-inner');
  if (photo) {
    photoInner.innerHTML = `<img src="${photo}" alt="${name}" style="width:100%;height:100%;object-fit:cover;" />`;
  } else {
    photoInner.innerHTML = `<div class="week-photo-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span style="font-size:0.7rem;letter-spacing:2px;text-transform:uppercase;">Fotoğraf</span></div>`;
  }

  addLog(`Haftanın memuru güncellendi: ${name}`);
  alert('✅ Haftanın memuru güncellendi!');
}

function renderWeekArchive() {
  const arc = document.getElementById('week-archive');
  const list = document.getElementById('archive-list');
  if (!weekHistory.length) { arc.style.display = 'none'; return; }
  arc.style.display = 'block';
  list.innerHTML = weekHistory.map(w => `
    <div class="archive-item">
      <span class="arch-week">${w.num}</span>
      <div><div class="arch-name">${w.name}</div><div class="arch-role">${w.role}</div></div>
    </div>`).join('');
}

// ======================================================
// STATS
// ======================================================
function saveStats() {
  const p = document.getElementById('se-personel').value;
  const b = document.getElementById('se-birim').value;
  const d = document.getElementById('se-dept').value;
  if (p) { document.getElementById('stat-personel').textContent = p; document.getElementById('adash-personel').textContent = p; }
  if (b) { document.getElementById('stat-birim').textContent = b; document.getElementById('adash-birim').textContent = b; }
  if (d) { document.getElementById('stat-dept').textContent = d; document.getElementById('adash-dept').textContent = d; }
  addLog(`İstatistikler güncellendi: Personel=${p||'-'}, Birim=${b||'-'}, Dept=${d||'-'}`);
  alert('✅ İstatistikler güncellendi!');
}

// ======================================================
// ACTIVITY LOG
// ======================================================
function addLog(msg) {
  const time = new Date().toLocaleString('tr-TR');
  const user = currentAdmin ? currentAdmin.name : 'Misafir';
  activityLog.unshift({ user, msg, time });
  if (activityLog.length > 200) activityLog.pop();
  renderActivityLog();
}
function renderActivityLog() {
  const list = document.getElementById('activity-list');
  if (!list) return;
  if (!activityLog.length) { list.innerHTML = '<div class="empty-state">Henüz aktivite yok.</div>'; return; }
  list.innerHTML = `<div class="submissions-list" style="background:rgba(255,255,255,0.02);border:1px solid rgba(201,168,76,0.08);border-radius:8px;overflow:hidden;">${activityLog.map(l=>`<div class="log-item"><span class="log-time">${l.time}</span><span class="log-msg"><span class="log-user">${l.user}:</span> ${l.msg}</span></div>`).join('')}</div>`;
}
function clearLog() {
  if (confirm('Aktivite logu temizlensin mi?')) { activityLog = []; renderActivityLog(); }
}

// ======================================================
// INIT
// ======================================================
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initVisitor();
  renderDepartmentTabs();
  populateDeptSelects();
  loadAnnouncement();
  loadDriveLinks();
});
