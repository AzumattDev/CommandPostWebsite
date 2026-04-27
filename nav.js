(function(){
const NAV_LINKS = [
  {label:'Home', href:'index.html', icon:'images/home_icon.png'},
  {label:'Events', children:[
    {label:'Desert Storm Planner', href:'desert-storm-planner.html', icon:'images/allianceduel/vs_combat.png'},
    {label:'Canyon Storm Planner', href:'canyon-storm-planner.html', icon:'images/allianceduel/vs_combat.png'},
  ]},
  {label:'Alliance', children:[
    {label:'Alliance Merge Planner', href:'alliance-merge-planner.html', icon:'images/ui/alliancecity_level.png'},
  ]},
  {label:'Guides', children:[
    {label:'Alliance Duel Planner', href:'alliance-duel-planner.html', icon:'images/allianceduel/vs_logo.png'},
    {label:'Stamina & Resource ROI', href:'stamina-roi-guide.html', icon:'images/resources/res_stamina.png'},
    {label:'Power Progression', href:'power-progression.html', icon:'images/troops/troop_t10.png'},
    {label:'Waterfall Training', href:'waterfall-training.html', icon:'images/troops/troop_t8.png'},
    {label:'Squad Builder', href:'squad-builder.html', icon:'images/formation.png'},
    {label:'Research Priority', href:'research-priority-path.html', icon:'images/research/sci_tree_specialforces.png'},
    {label:'VIP & Diamonds', href:'vip-diamond-guide.html', icon:'images/resources/res_diamonds.png'},
    {label:'Gear Upgrade', href:'gear-upgrade-guide.html', icon:'images/gear/quality_legendary.png'},
    {label:'Drone Priority', href:'drone-upgrade-guide.html', icon:'images/allianceduel/dronedata.png'},
  ]},
  {label:'Territory', children:[
    {label:'Capital War Planner', href:'capital-war-planner.html', icon:'images/ui/capitol.png'},
    {label:'Pre-Season Map Planner', href:'preseason-map-planner.html', icon:'images/ui/capitol.png'},
  ]},
  {label:'Tools', children:[
    {label:'Hero EXP Calculator', href:'hero-exp-calculator.html', icon:'images/allianceduel/heroxp.png'},
    {label:'Speedup Calculator', href:'speedup-calculator.html', icon:'images/resources/res_time.png'},
    {label:'Server Tracker', href:'server-tracker.html', icon:'images/resources/res_time.png'},
    {label:'HQ Upgrade Planner', href:'hq-upgrade-planner.html', icon:'images/headquarters.png'},
  ]},
];

// Search index — title, url, keywords
const SEARCH_INDEX = [
  { title:'Home', url:'index.html', tags:'home overview' },
  { title:'Alliance Merge Planner', url:'alliance-merge-planner.html', tags:'alliance merge planner roster 100 cap R5 R4 R3 R2 R1 warlord recruiter butler muse leadership roles cut list' },
  { title:'Capital War Planner', url:'capital-war-planner.html', tags:'capital war planner cannon assault rally burn squad garrison president occupation' },
  { title:'Pre-Season Map Planner', url:'preseason-map-planner.html', tags:'preseason map planner territory zone alliance village chemical plant power town metropolis military base capitol' },
  { title:'Desert Storm Planner', url:'desert-storm-planner.html', tags:'desert storm planner tactical map drag drop phase plan auto assign' },
  { title:'Canyon Storm Planner', url:'canyon-storm-planner.html', tags:'canyon storm planner rulebringers dawnbreakers faction viro lab phase plan' },
  { title:'Alliance Duel Planner', url:'alliance-duel-planner.html', tags:'alliance duel vs daily planner monday tuesday wednesday thursday friday saturday points' },
  { title:'Stamina & Resource ROI', url:'stamina-roi-guide.html', tags:'stamina resource roi return investment guide' },
  { title:'Power Progression', url:'power-progression.html', tags:'power progression milestones hq guide' },
  { title:'Waterfall Training', url:'waterfall-training.html', tags:'waterfall training troops guide' },
  { title:'Squad Builder', url:'squad-builder.html', tags:'squad builder tank air missile hybrid hero lineup' },
  { title:'Research Priority', url:'research-priority-path.html', tags:'research priority tech tree path guide' },
  { title:'VIP & Diamonds', url:'vip-diamond-guide.html', tags:'vip diamonds gems guide spending' },
  { title:'Gear Upgrade', url:'gear-upgrade-guide.html', tags:'gear upgrade equipment dps tank mythic guide' },
  { title:'Drone Priority', url:'drone-upgrade-guide.html', tags:'drone upgrade priority guide' },
  { title:'Hero EXP Calculator', url:'hero-exp-calculator.html', tags:'hero exp experience calculator level upgrade' },
  { title:'Speedup Calculator', url:'speedup-calculator.html', tags:'speedup calculator time build research hours days' },
  { title:'Server Tracker', url:'server-tracker.html', tags:'server tracker day count state timeline events' },
  { title:'HQ Upgrade Planner', url:'hq-upgrade-planner.html', tags:'hq upgrade planner headquarters resources buildings' },
];

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

const style = document.createElement('style');
style.textContent = `
.cp-nav{position:sticky;top:0;z-index:9999;background:rgba(10,11,14,.92);backdrop-filter:blur(12px);border-bottom:1px solid #262838;padding:0 1rem;font-family:'DM Sans',sans-serif}
.cp-nav-inner{max-width:960px;margin:0 auto;display:flex;align-items:center;height:48px;gap:4px}
.cp-brand{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:.9rem;color:#38bdf8;text-decoration:none;margin-right:auto;white-space:nowrap;display:flex;align-items:center;gap:6px}
.cp-brand:hover{color:#7dd3fc}
.cp-brand span{font-size:.65rem;color:#6b6980;font-family:'JetBrains Mono',monospace;font-weight:400}
.cp-links{display:flex;align-items:center;gap:2px}
.cp-link{color:#9d9baf;text-decoration:none;font-size:.8rem;padding:6px 10px;border-radius:6px;transition:all .15s;position:relative;cursor:pointer;white-space:nowrap;border:none;background:none;font-family:inherit;display:inline-flex;align-items:center;gap:5px}
.cp-link:hover{color:#e8e6f0;background:rgba(255,255,255,.05)}
.cp-link.active{color:#a78bfa;background:rgba(167,139,250,.08)}
.cp-dropdown{position:absolute;top:100%;left:0;background:#14151b;border:1px solid #262838;border-radius:10px;padding:6px;min-width:200px;display:none;box-shadow:0 8px 32px rgba(0,0,0,.4)}
.cp-link:hover .cp-dropdown,.cp-link:focus-within .cp-dropdown{display:block}
.cp-dd-item{display:flex;align-items:center;gap:7px;color:#9d9baf;text-decoration:none;font-size:.78rem;padding:7px 10px;border-radius:6px;transition:all .12s;white-space:nowrap}
.cp-dd-item:hover{color:#e8e6f0;background:rgba(255,255,255,.05)}
.cp-dd-item.active{color:#a78bfa;background:rgba(167,139,250,.06)}
.cp-arrow{font-size:.55rem;margin-left:3px;opacity:.5}
.cp-search-btn{background:none;border:1px solid #262838;border-radius:6px;color:#6b6980;font-size:.75rem;padding:5px 10px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .15s;font-family:'DM Sans',sans-serif;white-space:nowrap}
.cp-search-btn:hover{color:#9d9baf;border-color:#3a3b4e}
.cp-search-btn kbd{font-size:.65rem;background:#1a1b23;border:1px solid #3a3b4e;border-radius:3px;padding:1px 4px;font-family:'JetBrains Mono',monospace;color:#6b6980}
.cp-hamburger{display:none;background:none;border:none;color:#9d9baf;font-size:1.2rem;cursor:pointer;padding:6px}
.cp-mobile-menu{display:none;position:fixed;inset:0;top:48px;background:rgba(10,11,14,.97);z-index:9998;padding:1rem;overflow-y:auto}
.cp-mobile-menu.open{display:block}
.cp-mob-section{margin-bottom:12px}
.cp-mob-label{font-size:.68rem;color:#6b6980;text-transform:uppercase;letter-spacing:.08em;padding:4px 8px;font-family:'JetBrains Mono',monospace}
.cp-mob-link{display:flex;align-items:center;gap:9px;color:#9d9baf;text-decoration:none;font-size:.88rem;padding:10px 12px;border-radius:8px;transition:all .12s}
.cp-mob-link:hover,.cp-mob-link.active{color:#e8e6f0;background:rgba(255,255,255,.04)}
.cp-mob-link.active{color:#a78bfa}
@media(max-width:700px){.cp-links{display:none}.cp-hamburger{display:block}}

/* Search overlay */
.cp-search-overlay{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);align-items:flex-start;justify-content:center;padding-top:80px}
.cp-search-overlay.open{display:flex}
.cp-search-box{background:#14151b;border:1px solid #3a3b4e;border-radius:14px;width:100%;max-width:560px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.6)}
.cp-search-input-wrap{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #262838}
.cp-search-icon{color:#6b6980;font-size:1rem;flex-shrink:0}
.cp-search-input{flex:1;background:none;border:none;color:#e8e6f0;font-size:.95rem;font-family:'DM Sans',sans-serif;outline:none}
.cp-search-input::placeholder{color:#4a4b60}
.cp-search-esc{font-size:.65rem;background:#1a1b23;border:1px solid #3a3b4e;border-radius:3px;padding:2px 6px;font-family:'JetBrains Mono',monospace;color:#6b6980;cursor:pointer}
.cp-search-results{max-height:360px;overflow-y:auto}
.cp-search-result{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;text-decoration:none;transition:background .1s;border-bottom:1px solid #1e1f2a}
.cp-search-result:hover,.cp-search-result.focused{background:rgba(167,139,250,.06)}
.cp-search-result:last-child{border-bottom:none}
.cp-sr-title{font-size:.88rem;color:#e8e6f0;font-weight:500}
.cp-sr-url{font-size:.7rem;color:#6b6980;font-family:'JetBrains Mono',monospace;margin-top:1px}
.cp-search-empty{padding:2rem;text-align:center;color:#4a4b60;font-size:.88rem}
.cp-search-hint{padding:8px 16px;font-size:.7rem;color:#4a4b60;border-top:1px solid #1e1f2a;display:flex;justify-content:space-between}
`;
document.head.appendChild(style);

function isActive(href){ return currentPage === href; }
function isGroupActive(children){ return children.some(c => currentPage === c.href); }

let navHTML = `<nav class="cp-nav"><div class="cp-nav-inner">`;
navHTML += `<a class="cp-brand" href="index.html">⬡ Last Horizon <span>Command Post</span></a>`;
navHTML += `<div class="cp-links">`;

NAV_LINKS.forEach(item => {
  if(item.children){
    const groupActive = isGroupActive(item.children);
    navHTML += `<div class="cp-link${groupActive?' active':''}" tabindex="0">${item.label}<span class="cp-arrow">▼</span>`;
    navHTML += `<div class="cp-dropdown">`;
    item.children.forEach(c => {
      const icn = c.icon ? `<img src="${c.icon}" style="width:16px;height:16px;object-fit:contain;opacity:.85;flex-shrink:0" alt="">` : '';
      navHTML += `<a class="cp-dd-item${isActive(c.href)?' active':''}" href="${c.href}">${icn}${c.label}</a>`;
    });
    navHTML += `</div></div>`;
  } else {
    const icn = item.icon ? `<img src="${item.icon}" style="width:16px;height:16px;object-fit:contain;opacity:.85;flex-shrink:0" alt="">` : '';
    navHTML += `<a class="cp-link${isActive(item.href)?' active':''}" href="${item.href}">${icn}${item.label}</a>`;
  }
});

navHTML += `<button class="cp-search-btn" onclick="cpSearchOpen()" title="Search (Ctrl+K)">
  <span class="cp-search-icon">⌕</span> Search <kbd>Ctrl K</kbd>
</button>`;
navHTML += `</div>`;
navHTML += `<button class="cp-hamburger" onclick="document.getElementById('cpMobile').classList.toggle('open')" aria-label="Menu">☰</button>`;
navHTML += `</div></nav>`;

navHTML += `<div class="cp-mobile-menu" id="cpMobile">`;
NAV_LINKS.forEach(item => {
  if(item.children){
    navHTML += `<div class="cp-mob-section"><div class="cp-mob-label">${item.label}</div>`;
    item.children.forEach(c => {
      const micn = c.icon ? `<img src="${c.icon}" style="width:18px;height:18px;object-fit:contain;opacity:.85;flex-shrink:0" alt="">` : '';
      navHTML += `<a class="cp-mob-link${isActive(c.href)?' active':''}" href="${c.href}" onclick="document.getElementById('cpMobile').classList.remove('open')">${micn}${c.label}</a>`;
    });
    navHTML += `</div>`;
  } else {
    const micn = item.icon ? `<img src="${item.icon}" style="width:18px;height:18px;object-fit:contain;opacity:.85;flex-shrink:0" alt="">` : '';
    navHTML += `<div class="cp-mob-section"><a class="cp-mob-link${isActive(item.href)?' active':''}" href="${item.href}" onclick="document.getElementById('cpMobile').classList.remove('open')">${micn}${item.label}</a></div>`;
  }
});
navHTML += `</div>`;

// Search overlay
navHTML += `<div class="cp-search-overlay" id="cpSearchOverlay" onclick="cpSearchClose(event)">
  <div class="cp-search-box" onclick="event.stopPropagation()">
    <div class="cp-search-input-wrap">
      <span class="cp-search-icon">⌕</span>
      <input class="cp-search-input" id="cpSearchInput" placeholder="Search pages and tools…" oninput="cpSearchRender()" onkeydown="cpSearchKey(event)" autocomplete="off">
      <span class="cp-search-esc" onclick="cpSearchClose()">ESC</span>
    </div>
    <div class="cp-search-results" id="cpSearchResults"></div>
    <div class="cp-search-hint"><span>↑↓ navigate</span><span>↵ open</span></div>
  </div>
</div>`;

if (document.body) {
  document.body.insertAdjacentHTML('afterbegin', navHTML);
} else {
  document.addEventListener('DOMContentLoaded', function() {
    document.body.insertAdjacentHTML('afterbegin', navHTML);
  });
}

// ── Search logic ──────────────────────────────────────────────────────────────
let cpFocusIdx = -1;

window.cpSearchOpen = function() {
  document.getElementById('cpSearchOverlay').classList.add('open');
  setTimeout(() => document.getElementById('cpSearchInput').focus(), 30);
  cpFocusIdx = -1;
  cpSearchRender();
};

window.cpSearchClose = function(e) {
  if (e && e.target !== document.getElementById('cpSearchOverlay')) return;
  document.getElementById('cpSearchOverlay').classList.remove('open');
};

window.cpSearchRender = function() {
  const q = document.getElementById('cpSearchInput').value.trim().toLowerCase();
  const results = q
    ? SEARCH_INDEX.filter(p => p.title.toLowerCase().includes(q) || p.tags.toLowerCase().includes(q))
    : SEARCH_INDEX;

  cpFocusIdx = -1;
  if (!results.length) {
    document.getElementById('cpSearchResults').innerHTML = `<div class="cp-search-empty">No results for "${q}"</div>`;
    return;
  }
  document.getElementById('cpSearchResults').innerHTML = results.map((r, i) =>
    `<a class="cp-search-result" href="${r.url}" data-idx="${i}">
      <div><div class="cp-sr-title">${r.title}</div><div class="cp-sr-url">${r.url}</div></div>
    </a>`
  ).join('');
};

window.cpSearchKey = function(e) {
  const items = document.querySelectorAll('.cp-search-result');
  if (e.key === 'ArrowDown') { cpFocusIdx = Math.min(cpFocusIdx + 1, items.length - 1); cpFocusUpdate(items); e.preventDefault(); }
  if (e.key === 'ArrowUp')   { cpFocusIdx = Math.max(cpFocusIdx - 1, 0); cpFocusUpdate(items); e.preventDefault(); }
  if (e.key === 'Enter' && cpFocusIdx >= 0) { items[cpFocusIdx].click(); }
  if (e.key === 'Escape') { document.getElementById('cpSearchOverlay').classList.remove('open'); }
};

function cpFocusUpdate(items) {
  items.forEach((el, i) => el.classList.toggle('focused', i === cpFocusIdx));
  if (items[cpFocusIdx]) items[cpFocusIdx].scrollIntoView({ block:'nearest' });
}

document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    cpSearchOpen();
  }
});

})();
