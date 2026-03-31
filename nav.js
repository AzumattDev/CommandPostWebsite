// Command Post - Shared Navigation
// Add <script src="nav.js"></script> to any page to inject the nav bar
(function(){
const NAV_LINKS = [
  {label:'Home', href:'index.html', icon:'🏠'},
  {label:'Guides', children:[
    {label:'Alliance Duel Planner', href:'alliance-duel-planner.html'},
    {label:'Power Progression', href:'power-progression.html'},
    {label:'Waterfall Training', href:'waterfall-training.html'},
    {label:'Squad Builder', href:'squad-builder.html'},
    {label:'Research Priority', href:'research-priority-path.html'},
    {label:'VIP & Diamonds', href:'vip-diamond-guide.html'},
    {label:'Gear Upgrade', href:'gear-upgrade-guide.html'},
    {label:'Drone Priority', href:'drone-upgrade-guide.html'},
  ]},
  {label:'Territory', children:[
    {label:'Hex Warzone Planner', href:'hex-warzone-planner.html'},
    {label:'City Capture Planner', href:'city-capture-planner.html'},
    {label:'Hive Strategy', href:'hive-strategy-guide.html'},
  ]},
  {label:'Tools', children:[
    {label:'Hero EXP Calculator', href:'hero-exp-calculator.html'},
    {label:'Server Day Tracker', href:'server-day-tracker.html'},
  ]},
];

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

const style = document.createElement('style');
style.textContent = `
.cp-nav{position:sticky;top:0;z-index:9999;background:rgba(10,11,14,.92);backdrop-filter:blur(12px);border-bottom:1px solid #262838;padding:0 1rem;font-family:'DM Sans',sans-serif}
.cp-nav-inner{max-width:960px;margin:0 auto;display:flex;align-items:center;height:48px;gap:4px}
.cp-brand{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:.9rem;color:#34d399;text-decoration:none;margin-right:auto;white-space:nowrap;display:flex;align-items:center;gap:6px}
.cp-brand:hover{color:#6ee7b7}
.cp-brand span{font-size:.65rem;color:#6b6980;font-family:'JetBrains Mono',monospace;font-weight:400}
.cp-links{display:flex;align-items:center;gap:2px}
.cp-link{color:#9d9baf;text-decoration:none;font-size:.8rem;padding:6px 10px;border-radius:6px;transition:all .15s;position:relative;cursor:pointer;white-space:nowrap;border:none;background:none;font-family:inherit}
.cp-link:hover{color:#e8e6f0;background:rgba(255,255,255,.05)}
.cp-link.active{color:#a78bfa;background:rgba(167,139,250,.08)}
.cp-dropdown{position:absolute;top:100%;left:0;background:#14151b;border:1px solid #262838;border-radius:10px;padding:6px;min-width:200px;display:none;box-shadow:0 8px 32px rgba(0,0,0,.4)}
.cp-link:hover .cp-dropdown,.cp-link:focus-within .cp-dropdown{display:block}
.cp-dd-item{display:block;color:#9d9baf;text-decoration:none;font-size:.78rem;padding:7px 10px;border-radius:6px;transition:all .12s;white-space:nowrap}
.cp-dd-item:hover{color:#e8e6f0;background:rgba(255,255,255,.05)}
.cp-dd-item.active{color:#a78bfa;background:rgba(167,139,250,.06)}
.cp-arrow{font-size:.55rem;margin-left:3px;opacity:.5}
.cp-hamburger{display:none;background:none;border:none;color:#9d9baf;font-size:1.2rem;cursor:pointer;padding:6px}
.cp-mobile-menu{display:none;position:fixed;inset:0;top:48px;background:rgba(10,11,14,.97);z-index:9998;padding:1rem;overflow-y:auto}
.cp-mobile-menu.open{display:block}
.cp-mob-section{margin-bottom:12px}
.cp-mob-label{font-size:.68rem;color:#6b6980;text-transform:uppercase;letter-spacing:.08em;padding:4px 8px;font-family:'JetBrains Mono',monospace}
.cp-mob-link{display:block;color:#9d9baf;text-decoration:none;font-size:.88rem;padding:10px 12px;border-radius:8px;transition:all .12s}
.cp-mob-link:hover,.cp-mob-link.active{color:#e8e6f0;background:rgba(255,255,255,.04)}
.cp-mob-link.active{color:#a78bfa}
@media(max-width:700px){.cp-links{display:none}.cp-hamburger{display:block}}
`;
document.head.appendChild(style);

function isActive(href){ return currentPage === href; }
function isGroupActive(children){ return children.some(c => currentPage === c.href); }

let navHTML = `<nav class="cp-nav"><div class="cp-nav-inner">`;
navHTML += `<a class="cp-brand" href="index.html">⬡ Command Post <span>Last War</span></a>`;
navHTML += `<div class="cp-links">`;

NAV_LINKS.forEach(item => {
  if(item.children){
    const groupActive = isGroupActive(item.children);
    navHTML += `<div class="cp-link${groupActive?' active':''}" tabindex="0">${item.label}<span class="cp-arrow">▼</span>`;
    navHTML += `<div class="cp-dropdown">`;
    item.children.forEach(c => {
      navHTML += `<a class="cp-dd-item${isActive(c.href)?' active':''}" href="${c.href}">${c.label}</a>`;
    });
    navHTML += `</div></div>`;
  } else {
    navHTML += `<a class="cp-link${isActive(item.href)?' active':''}" href="${item.href}">${item.icon||''} ${item.label}</a>`;
  }
});

navHTML += `</div>`;
navHTML += `<button class="cp-hamburger" onclick="document.getElementById('cpMobile').classList.toggle('open')" aria-label="Menu">☰</button>`;
navHTML += `</div></nav>`;

// Mobile menu
navHTML += `<div class="cp-mobile-menu" id="cpMobile">`;
NAV_LINKS.forEach(item => {
  if(item.children){
    navHTML += `<div class="cp-mob-section"><div class="cp-mob-label">${item.label}</div>`;
    item.children.forEach(c => {
      navHTML += `<a class="cp-mob-link${isActive(c.href)?' active':''}" href="${c.href}" onclick="document.getElementById('cpMobile').classList.remove('open')">${c.label}</a>`;
    });
    navHTML += `</div>`;
  } else {
    navHTML += `<div class="cp-mob-section"><a class="cp-mob-link${isActive(item.href)?' active':''}" href="${item.href}" onclick="document.getElementById('cpMobile').classList.remove('open')">${item.icon||''} ${item.label}</a></div>`;
  }
});
navHTML += `</div>`;

document.body.insertAdjacentHTML('afterbegin', navHTML);
})();
