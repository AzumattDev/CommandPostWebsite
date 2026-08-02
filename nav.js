(function(){

// ── Last War Theme bootstrap ──────────────────────────────────────────────
(function lwThemeInit(){
  const saved = localStorage.getItem('lw-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  // Inject theme CSS after nav's own inline style so our selectors win
  const lk = document.createElement('link');
  lk.rel = 'stylesheet'; lk.href = 'theme-lastwar.css';
  document.head.appendChild(lk);
})();

window.lwToggleTheme = function(){
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('lw-theme', next);
  const btn = document.querySelector('.lw-theme-toggle');
  if(btn){
    const icon = btn.querySelector('.lw-tt-icon');
    const lbl  = btn.querySelector('.lw-tt-lbl');
    if(icon) icon.textContent = next === 'dark' ? '🌙' : '🌤';
    if(lbl)  lbl.textContent  = next === 'dark' ? 'Dark' : 'Light';
  }
};

const NAV_LINKS = [
  {label:'Home', href:'index.html', icon:'images/home_icon.png'},
  {label:'Events', children:[
    {label:'Desert Storm Planner', href:'desert-storm-planner.html', icon:'images/allianceduel/vs_combat.png'},
    {label:'Canyon Storm Planner', href:'canyon-storm-planner.html', icon:'images/allianceduel/vs_combat.png'},
  ]},
  {label:'Alliance', children:[
    {label:'Alliance Merge Planner', href:'alliance-merge-planner.html', icon:'images/ui/alliancecity_level.png'},
    {label:'Train Conductor Scheduler', href:'train.html', icon:'images/resources/res_time.png'},
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
    {label:'Season 1 Map Planner', href:'season-1-map-planner.html', icon:'images/ui/capitol.png'},
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
  { title:'Train Conductor Scheduler', url:'train.html', tags:'train conductor scheduler weekly rotation R4 R3 MVP casino discord webhook schedule planner VIP boarding' },
  { title:'Capital War Planner', url:'capital-war-planner.html', tags:'capital war planner cannon assault rally burn squad garrison president occupation' },
  { title:'Pre-Season Map Planner', url:'preseason-map-planner.html', tags:'preseason map planner territory zone alliance village chemical plant power town metropolis military base capitol' },
  { title:'Season 1 Map Planner', url:'season-1-map-planner.html', tags:'season 1 map planner territory zone alliance border farm trade post agricultural gateway stronghold rebel house nobles royal palace crimson plague' },
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
.cp-brand{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:.9rem;color:#f97316;text-decoration:none;margin-right:auto;white-space:nowrap;display:flex;align-items:center;gap:6px}
.cp-brand:hover{color:#fb923c}
.cp-brand span{font-size:.65rem;color:#8a889e;font-family:'JetBrains Mono',monospace;font-weight:400}
.cp-links{display:flex;align-items:center;gap:2px}
.cp-link{color:#9d9baf;text-decoration:none;font-size:.8rem;padding:6px 10px;border-radius:6px;transition:all .15s;position:relative;cursor:pointer;white-space:nowrap;border:none;background:none;font-family:inherit;display:inline-flex;align-items:center;gap:5px}
.cp-link:hover{color:#e8e6f0;background:rgba(255,255,255,.05)}
.cp-link.active{color:#f97316;background:rgba(249,115,22,.08)}
.cp-dropdown{position:absolute;top:100%;left:0;background:#14151b;border:1px solid #262838;border-radius:10px;padding:6px;min-width:200px;display:none;box-shadow:0 8px 32px rgba(0,0,0,.4)}
.cp-link:hover .cp-dropdown,.cp-link:focus-within .cp-dropdown{display:block}
.cp-dd-item{display:flex;align-items:center;gap:7px;color:#9d9baf;text-decoration:none;font-size:.78rem;padding:7px 10px;border-radius:6px;transition:all .12s;white-space:nowrap}
.cp-dd-item:hover{color:#e8e6f0;background:rgba(255,255,255,.05)}
.cp-dd-item.active{color:#f97316;background:rgba(249,115,22,.06)}
.cp-arrow{font-size:.55rem;margin-left:3px;opacity:.5}
.cp-search-btn{background:none;border:1px solid #262838;border-radius:6px;color:#8a889e;font-size:.75rem;padding:5px 10px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .15s;font-family:'DM Sans',sans-serif;white-space:nowrap}
.cp-search-btn:hover{color:#9d9baf;border-color:#3a3b4e}
.cp-search-btn kbd{font-size:.65rem;background:#1a1b23;border:1px solid #3a3b4e;border-radius:3px;padding:1px 4px;font-family:'JetBrains Mono',monospace;color:#8a889e}
.cp-hamburger{display:none;background:none;border:none;color:#9d9baf;font-size:1.2rem;cursor:pointer;padding:6px}
.cp-mobile-menu{display:none;position:fixed;inset:0;top:48px;background:rgba(10,11,14,.97);z-index:9998;padding:1rem;overflow-y:auto}
.cp-mobile-menu.open{display:block}
.cp-mob-section{margin-bottom:12px}
.cp-mob-label{font-size:.68rem;color:#8a889e;text-transform:uppercase;letter-spacing:.08em;padding:4px 8px;font-family:'JetBrains Mono',monospace}
.cp-mob-link{display:flex;align-items:center;gap:9px;color:#9d9baf;text-decoration:none;font-size:.88rem;padding:10px 12px;border-radius:8px;transition:all .12s}
.cp-mob-link:hover,.cp-mob-link.active{color:#e8e6f0;background:rgba(255,255,255,.04)}
.cp-mob-link.active{color:#f97316}
@media(max-width:700px){.cp-links{display:none}.cp-hamburger{display:block}}

/* Search overlay */
.cp-search-overlay{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);align-items:flex-start;justify-content:center;padding-top:80px}
.cp-search-overlay.open{display:flex}
.cp-search-box{background:#14151b;border:1px solid #3a3b4e;border-radius:14px;width:100%;max-width:560px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.6)}
.cp-search-input-wrap{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #262838}
.cp-search-icon{color:#8a889e;font-size:1rem;flex-shrink:0}
.cp-search-input{flex:1;background:none;border:none;color:#e8e6f0;font-size:.95rem;font-family:'DM Sans',sans-serif;outline:none}
.cp-search-input::placeholder{color:#7a7896}
.cp-search-esc{font-size:.65rem;background:#1a1b23;border:1px solid #3a3b4e;border-radius:3px;padding:2px 6px;font-family:'JetBrains Mono',monospace;color:#8a889e;cursor:pointer}
.cp-search-results{max-height:360px;overflow-y:auto}
.cp-search-result{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;text-decoration:none;transition:background .1s;border-bottom:1px solid #1e1f2a}
.cp-search-result:hover,.cp-search-result.focused{background:rgba(249,115,22,.06)}
.cp-search-result:last-child{border-bottom:none}
.cp-sr-title{font-size:.88rem;color:#e8e6f0;font-weight:500}
.cp-sr-url{font-size:.7rem;color:#8a889e;font-family:'JetBrains Mono',monospace;margin-top:1px}
.cp-search-empty{padding:2rem;text-align:center;color:#7a7896;font-size:.88rem}
.cp-search-hint{padding:8px 16px;font-size:.7rem;color:#7a7896;border-top:1px solid #1e1f2a;display:flex;justify-content:space-between}
.cp-timebar{border-top:1px solid #262838;padding:0 1rem}
.cp-timebar-inner{max-width:960px;margin:0 auto;display:flex;align-items:center;height:56px;gap:0}
.cp-tb-seg{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:3px;padding:0 1.75rem;flex:1}
.cp-tb-divider{width:1px;height:30px;background:#31334a;flex-shrink:0}
.cp-tb-label{font-family:'JetBrains Mono',monospace;font-size:.6rem;text-transform:uppercase;letter-spacing:.1em;color:#7a7896;white-space:nowrap}
.cp-tb-val{font-family:'JetBrains Mono',monospace;font-size:1.05rem;font-weight:600;line-height:1.1;white-space:nowrap}
.cp-tb-sub{font-family:'JetBrains Mono',monospace;font-size:.6rem;color:#7a7896;white-space:nowrap;margin-top:1px}
.cp-tb-reset{color:#fbbf24}
.cp-tb-local{color:#9d9baf}
.cp-tb-srv{color:#f97316}
@media(max-width:700px){
  .cp-timebar{padding:0 .5rem}
  .cp-timebar-inner{height:auto;min-height:44px;padding:5px 0}
  .cp-tb-seg{padding:0 .5rem;gap:1px;overflow:hidden}
  .cp-tb-val{font-size:.8rem}
  .cp-tb-label{font-size:.48rem;letter-spacing:0}
  .cp-tb-sub{display:none}
  .cp-tb-divider{height:20px}
}
`;
document.head.appendChild(style);

function isActive(href){ return currentPage === href; }
function isGroupActive(children){ return children.some(c => currentPage === c.href); }

let navHTML = `<nav class="cp-nav"><div class="cp-nav-inner">`;
navHTML += `<a class="cp-brand" href="index.html">⬡ Ash Masters <span>Command Post</span></a>`;
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

// Theme toggle — label/icon reflects current state
const _curTheme = document.documentElement.getAttribute('data-theme') || 'dark';
navHTML += `<button class="lw-theme-toggle" onclick="lwToggleTheme()" title="Toggle light/dark mode">
  <span class="lw-tt-icon">${_curTheme === 'dark' ? '🌙' : '🌤'}</span>
  <span class="lw-tt-lbl">${_curTheme === 'dark' ? 'Dark' : 'Light'}</span>
</button>`;
navHTML += `<button class="cp-search-btn" onclick="cpSearchOpen()" title="Search (Ctrl+K)">
  <span class="cp-search-icon">⌕</span> Search <kbd>Ctrl K</kbd>
</button>`;
navHTML += `</div>`;
navHTML += `<button class="cp-hamburger" onclick="cpToggleMobile()" aria-label="Menu">☰</button>`;
navHTML += `</div>`;
navHTML += `<div class="cp-timebar"><div class="cp-timebar-inner">`;
navHTML += `<div class="cp-tb-seg"><div class="cp-tb-label">Next Reset</div><div class="cp-tb-val cp-tb-reset" id="cpTbReset">--:--:--</div><div class="cp-tb-sub">server midnight (00:00 UTC−2)</div></div>`;
navHTML += `<div class="cp-tb-divider"></div>`;
navHTML += `<div class="cp-tb-seg"><div class="cp-tb-label">Local Time</div><div class="cp-tb-val cp-tb-local" id="cpTbLocal">--:--:--</div><div class="cp-tb-sub" id="cpTbLocalTz">---</div></div>`;
navHTML += `<div class="cp-tb-divider"></div>`;
navHTML += `<div class="cp-tb-seg"><div class="cp-tb-label">Server (UTC−2)</div><div class="cp-tb-val cp-tb-srv" id="cpTbSrv">--:--:--</div><div class="cp-tb-sub" id="cpTbSrvDate">---</div></div>`;
navHTML += `</div></div>`;
navHTML += `</nav>`;

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

const PAGE_HERO_MAP = {
  'index.html':                  'hero_icon_Monica.png',
  'alliance-duel-planner.html':  'hero_icon_Monica.png',
  'alliance-merge-planner.html': 'hero_icon_Fiona.png',
  'desert-storm-planner.html':   'hero_icon_Katyusha.png',
  'canyon-storm-planner.html':   'hero_icon_Morrison.png',
  'train.html':                  'hero_icon_Rick.png',
  'capital-war-planner.html':    'hero_icon_Audie_Murphy.png',
  'preseason-map-planner.html':  'hero_icon_Nimitz.png',
  'season-1-map-planner.html':   'hero_icon_David_Stirling.png',
  'waterfall-training.html':     'hero_icon_Adam.png',
  'squad-builder.html':          'hero_icon_Aldridge.png',
  'research-priority-path.html': 'hero_icon_Einstein.png',
  'hq-upgrade-planner.html':     'hero_icon_Stetman.png',
  'hero-exp-calculator.html':    'hero_icon_Lucius.png',
  'speedup-calculator.html':     'hero_icon_Tesla.png',
  'gear-upgrade-guide.html':     'hero_icon_Basilone.png',
  'drone-upgrade-guide.html':    'hero_icon_Alex.png',
  'stamina-roi-guide.html':      'hero_icon_Gump.png',
  'power-progression.html':      'hero_icon_Cage.png',
  'vip-diamond-guide.html':      'hero_icon_MissHot.png',
  'server-tracker.html':         'hero_icon_richard.png',
};

const _LW_HEROES = [
  'hero_icon_Monica.png','hero_icon_Audie_Murphy.png','hero_icon_Morrison.png',
  'hero_icon_Fiona.png','hero_icon_Lucius.png','hero_icon_dva.png',
  'hero_icon_Tesla.png','hero_icon_Carly.png','hero_icon_Katyusha.png',
  'hero_icon_Adam.png','hero_icon_Stetman.png','hero_icon_Rick.png',
  'hero_icon_Gump.png','hero_icon_Alex.png','hero_icon_Ewan_McGregor.png',
  'hero_icon_Einstein.png','hero_icon_Nimitz.png','hero_icon_Sally_Ride.png',
  'hero_icon_David_Stirling.png','hero_icon_Aldridge.png','hero_icon_Basilone.png',
  'hero_icon_Tom.png','hero_icon_Yuriko.png','hero_icon_richard.png',
  'hero_icon_sara.png','hero_icon_MissHot.png','hero_icon_Farhad.png',
  'hero_icon_black_widow.png','hero_icon_Revenger.png','hero_icon_hager.png',
  'hero_icon_Cruzo.png','hero_icon_Cage.png','hero_icon_lambo.png',
  'hero_icon_Rockfield.png','hero_icon_Doctor_Poison.png','hero_icon_elsa.png',
];

// Keyword → [hero1, hero2] pairs for section-header auto-decoration
const SECTION_KW = [
  [['research','tech','science'],          ['hero_icon_Einstein.png','hero_icon_Stetman.png']],
  [['waterfall','troop','training'],        ['hero_icon_Adam.png','hero_icon_Aldridge.png']],
  [['squad','formation','lineup'],          ['hero_icon_Adam.png','hero_icon_Morrison.png']],
  [['desert storm','desert'],              ['hero_icon_Katyusha.png','hero_icon_Morrison.png']],
  [['canyon'],                             ['hero_icon_Morrison.png','hero_icon_Katyusha.png']],
  [['duel','vs','weekly event'],           ['hero_icon_Monica.png','hero_icon_Fiona.png']],
  [['capital war','capitol war','capital'],['hero_icon_Audie_Murphy.png','hero_icon_Nimitz.png']],
  [['map','territory','preseason','season'],['hero_icon_Nimitz.png','hero_icon_David_Stirling.png']],
  [['alliance','merge','member','roster'], ['hero_icon_Monica.png','hero_icon_Fiona.png']],
  [['hero exp','hero level','hero'],       ['hero_icon_Lucius.png','hero_icon_Monica.png']],
  [['gear','equipment','craft'],           ['hero_icon_Basilone.png','hero_icon_Adam.png']],
  [['drone','component','chip'],           ['hero_icon_Alex.png','hero_icon_Tesla.png']],
  [['hq','headquarter','building'],        ['hero_icon_Stetman.png','hero_icon_Rick.png']],
  [['vip','diamond','spend'],              ['hero_icon_MissHot.png','hero_icon_Cage.png']],
  [['speedup','speed','time'],             ['hero_icon_Tesla.png','hero_icon_Gump.png']],
  [['power','progression','milestone'],    ['hero_icon_Cage.png','hero_icon_Adam.png']],
  [['train','conductor','schedule'],       ['hero_icon_Rick.png','hero_icon_Gump.png']],
  [['stamina','roi','resource'],           ['hero_icon_Gump.png','hero_icon_Tesla.png']],
];

function _lwPickSectionHeroes(text) {
  const t = text.toLowerCase();
  for (const [keys, heroes] of SECTION_KW) {
    if (keys.some(k => t.includes(k))) return heroes;
  }
  // fallback — two random from the list
  const a = _LW_HEROES[Math.floor(Math.random() * _LW_HEROES.length)];
  let b = _LW_HEROES[Math.floor(Math.random() * _LW_HEROES.length)];
  if (b === a) b = _LW_HEROES[(Math.floor(Math.random() * _LW_HEROES.length) + 1) % _LW_HEROES.length];
  return [a, b];
}

function _lwInjectSectionHeroes() {
  document.querySelectorAll('.section-header').forEach(header => {
    if (header.querySelector('.section-heroes')) return; // already decorated (index.html)
    const tag = header.querySelector('.section-tag');
    if (!tag) return;
    const heroes = _lwPickSectionHeroes(tag.textContent);
    const div = document.createElement('div');
    div.className = 'section-heroes';
    heroes.forEach(h => {
      const img = document.createElement('img');
      img.src = 'images/game/heroes/' + h;
      img.alt = '';
      div.appendChild(img);
    });
    tag.insertAdjacentElement('afterend', div);
  });
}

document.addEventListener('DOMContentLoaded', _lwInjectSectionHeroes);

function _lwInjectHeroArt() {
  const hero = PAGE_HERO_MAP[currentPage] || _LW_HEROES[Math.floor(Math.random() * _LW_HEROES.length)];
  const a = document.createElement('div');
  a.className = 'lw-page-hero-art';
  a.setAttribute('aria-hidden', 'true');
  a.style.backgroundImage = `url('images/game/heroes/${hero}')`;
  document.body.appendChild(a);
}

if (document.body) {
  document.body.insertAdjacentHTML('afterbegin', navHTML);
  _lwInjectHeroArt();
} else {
  document.addEventListener('DOMContentLoaded', function() {
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    _lwInjectHeroArt();
  });
}

// ── Search logic ──────────────────────────────────────────────────────────────
let cpFocusIdx = -1;

window.cpToggleMobile = function() {
  const menu = document.getElementById('cpMobile');
  const nav = document.querySelector('.cp-nav');
  menu.style.top = nav.offsetHeight + 'px';
  menu.classList.toggle('open');
};

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

function cpTickClock(){
  const now=new Date();
  const sn=new Date(Date.now()-2*60*60*1000);
  const p2=n=>String(n).padStart(2,'0');
  const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const rt=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),2,0,0));
  const nr=rt>now?rt:new Date(rt.getTime()+86400000);
  const diff=nr-now;
  const rh=Math.floor(diff/3600000);
  const rm=Math.floor((diff%3600000)/60000);
  const rs=Math.floor((diff%60000)/1000);
  const re=document.getElementById('cpTbReset');
  if(re) re.textContent=`${p2(rh)}:${p2(rm)}:${p2(rs)}`;

  const le=document.getElementById('cpTbLocal');
  if(le) le.textContent=`${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}`;
  const ltz=document.getElementById('cpTbLocalTz');
  if(ltz){try{ltz.textContent=Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g,' ');}catch(e){ltz.textContent='Local';}}

  const se=document.getElementById('cpTbSrv');
  if(se) se.textContent=`${p2(sn.getUTCHours())}:${p2(sn.getUTCMinutes())}:${p2(sn.getUTCSeconds())}`;
  const sd=document.getElementById('cpTbSrvDate');
  if(sd) sd.textContent=`${DAYS[sn.getUTCDay()]} ${sn.getUTCFullYear()}-${p2(sn.getUTCMonth()+1)}-${p2(sn.getUTCDate())} UTC−2`;
}
setInterval(cpTickClock,1000);
cpTickClock();

})();
