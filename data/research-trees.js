// data/research-trees.js — Research tree data
// ⚠ ALL costs/bonuses are PLACEHOLDERS — replace with real in-game values.
// Cost format: { food, iron, gold (0 if none), time (seconds), bonus (string) }
// Alliance Duel nodes use Valor Badges in-game — placeholder food/iron values here.

// Helper: generates n placeholder levels.
// bf=baseFood, gr=growth multiplier per level, bs=bonusStart, bStep=bonusStep, bu=bonusUnit
function _pl(n, bf, gr, bs, bStep, bu) {
  return Array.from({ length: n }, (_, i) => ({
    food:  Math.round(bf * Math.pow(gr, i) / 1000) * 1000,
    iron:  Math.round(bf * Math.pow(gr, i) / 1000) * 1000,
    gold:  i >= 4 ? Math.round(bf * Math.pow(gr, i) * 0.006 / 100) * 100 : 0,
    time:  Math.round(3600 * Math.pow(1.9, i)),
    bonus: `+${+(bs + bStep * i).toFixed(1)}${bu}`
  }));
}

const TREES = [
  // ────────────────────────────────────────────────────────
  // DEVELOPMENT
  // Layout matches in-game tree (image reference: Dev tree screenshot)
  // ────────────────────────────────────────────────────────
  {
    id: 'development', name: 'Development', cols: 3,
    nodes: [
      { id:'dev_cs',  name:'Construction\nSpeed',  row:0, col:1, prereqs:[],              maxLevel:10, stat:'Building Speed',   icon:'🔨', levels:_pl(10,50000,1.8,2,2,'%') },
      { id:'dev_cp',  name:'City\nPlanning',        row:1, col:0, prereqs:['dev_cs'],      maxLevel:5,  stat:'Building Power',   icon:'🏙️', levels:_pl(5, 80000,2.0,3,3,'%') },
      { id:'dev_mr',  name:'Medic\nRecovery',       row:1, col:2, prereqs:['dev_cs'],      maxLevel:5,  stat:'Healing Speed',    icon:'⚕️', levels:_pl(5, 80000,2.0,3,3,'%') },
      { id:'dev_rs',  name:'Research\nSpeed',       row:2, col:1, prereqs:['dev_cp','dev_mr'], maxLevel:10, stat:'Research Speed', icon:'🔬', levels:_pl(10,60000,1.8,2,2,'%') },
      { id:'dev_cpo', name:'Construction\nPower',   row:3, col:0, prereqs:['dev_rs'],      maxLevel:5,  stat:'Building Power',   icon:'🏗️', levels:_pl(5,200000,2.0,3,3,'%') },
      { id:'dev_mp',  name:'Medic\nPower',          row:3, col:2, prereqs:['dev_rs'],      maxLevel:5,  stat:'Healing Power',    icon:'💊', levels:_pl(5,200000,2.0,3,3,'%') },
    ]
  },

  // ────────────────────────────────────────────────────────
  // ECONOMY
  // ────────────────────────────────────────────────────────
  {
    id: 'economy', name: 'Economy', cols: 3,
    nodes: [
      { id:'eco_fp',  name:'Food\nProduction',  row:0, col:0, prereqs:[],               maxLevel:10, stat:'Food Production',   icon:'🌾', levels:_pl(10,40000,1.8,2,2,'%') },
      { id:'eco_ip',  name:'Iron\nProduction',  row:0, col:1, prereqs:[],               maxLevel:10, stat:'Iron Production',   icon:'⚙️', levels:_pl(10,40000,1.8,2,2,'%') },
      { id:'eco_gp',  name:'Gold\nProduction',  row:0, col:2, prereqs:[],               maxLevel:10, stat:'Gold Production',   icon:'💰', levels:_pl(10,40000,1.8,2,2,'%') },
      { id:'eco_fs',  name:'Food\nStorage',     row:1, col:0, prereqs:['eco_fp'],       maxLevel:5,  stat:'Food Capacity',     icon:'🏪', levels:_pl(5, 70000,2.0,5,5,'%') },
      { id:'eco_is',  name:'Iron\nStorage',     row:1, col:2, prereqs:['eco_ip'],       maxLevel:5,  stat:'Iron Capacity',     icon:'📦', levels:_pl(5, 70000,2.0,5,5,'%') },
      { id:'eco_gs',  name:'Gather\nSpeed',     row:2, col:1, prereqs:['eco_fs','eco_is'], maxLevel:10, stat:'Gather Speed',   icon:'⚡', levels:_pl(10,50000,1.8,2,2,'%') },
      { id:'eco_ll',  name:'Load\nLimit',       row:3, col:0, prereqs:['eco_gs'],       maxLevel:5,  stat:'Troop Load',        icon:'🔋', levels:_pl(5,150000,2.0,5,5,'%') },
      { id:'eco_lr',  name:'Loss\nReduction',   row:3, col:2, prereqs:['eco_gs'],       maxLevel:5,  stat:'Resource Protection',icon:'🛡️', levels:_pl(5,150000,2.0,3,3,'%') },
    ]
  },

  // ────────────────────────────────────────────────────────
  // HERO
  // ────────────────────────────────────────────────────────
  {
    id: 'hero', name: 'Hero', cols: 3,
    nodes: [
      { id:'hero_rec', name:'Hero\nRecruit',   row:0, col:0, prereqs:[],                  maxLevel:10, stat:'Recruit Speed',     icon:'🎫', levels:_pl(10,60000,1.8,2,2,'%') },
      { id:'hero_xp',  name:'Hero\nEXP',       row:0, col:2, prereqs:[],                  maxLevel:10, stat:'Hero EXP Gain',     icon:'⭐', levels:_pl(10,60000,1.8,2,2,'%') },
      { id:'hero_sk',  name:'Hero\nSkill',      row:1, col:1, prereqs:['hero_rec','hero_xp'], maxLevel:10, stat:'Skill Medal Eff.', icon:'🎯', levels:_pl(10,80000,1.8,2,2,'%') },
      { id:'hero_sh',  name:'Hero\nShard',      row:2, col:0, prereqs:['hero_sk'],         maxLevel:5,  stat:'Star-up Bonus',     icon:'💎', levels:_pl(5,200000,2.0,3,3,'%') },
      { id:'hero_ol',  name:'Overlord\nEXP',   row:2, col:2, prereqs:['hero_sk'],         maxLevel:5,  stat:'Overlord EXP',      icon:'👑', levels:_pl(5,200000,2.0,3,3,'%') },
    ]
  },

  // ────────────────────────────────────────────────────────
  // UNITS
  // ────────────────────────────────────────────────────────
  {
    id: 'units', name: 'Units', cols: 3,
    nodes: [
      { id:'unit_ts',  name:'Training\nSpeed',     row:0, col:1, prereqs:[],                           maxLevel:10, stat:'Training Speed',   icon:'⏩', levels:_pl(10,80000,1.8,2,2,'%') },
      { id:'unit_ia',  name:'Infantry\nATK',        row:1, col:0, prereqs:['unit_ts'],                  maxLevel:10, stat:'Infantry Attack',  icon:'⚔️', levels:_pl(10,100000,1.8,2,2,'%') },
      { id:'unit_ta',  name:'Tank\nATK',             row:1, col:1, prereqs:['unit_ts'],                  maxLevel:10, stat:'Tank Attack',      icon:'🚂', levels:_pl(10,100000,1.8,2,2,'%') },
      { id:'unit_aa',  name:'Air\nATK',              row:1, col:2, prereqs:['unit_ts'],                  maxLevel:10, stat:'Air Attack',       icon:'✈️', levels:_pl(10,100000,1.8,2,2,'%') },
      { id:'unit_id',  name:'Infantry\nDEF',         row:2, col:0, prereqs:['unit_ia'],                  maxLevel:10, stat:'Infantry Defense', icon:'🛡️', levels:_pl(10,120000,1.8,2,2,'%') },
      { id:'unit_td',  name:'Tank\nDEF',             row:2, col:1, prereqs:['unit_ta'],                  maxLevel:10, stat:'Tank Defense',     icon:'🔩', levels:_pl(10,120000,1.8,2,2,'%') },
      { id:'unit_ad',  name:'Air\nDEF',              row:2, col:2, prereqs:['unit_aa'],                  maxLevel:10, stat:'Air Defense',      icon:'🌀', levels:_pl(10,120000,1.8,2,2,'%') },
      { id:'unit_tc',  name:'Troop\nCapacity',       row:3, col:1, prereqs:['unit_id','unit_td','unit_ad'], maxLevel:5, stat:'Troop Capacity', icon:'👥', levels:_pl(5,500000,2.0,500,500,' troops') },
    ]
  },

  // ────────────────────────────────────────────────────────
  // SQUAD 1 — INFANTRY
  // ────────────────────────────────────────────────────────
  {
    id: 'squad1', name: 'Squad 1\n(Infantry)', cols: 2,
    nodes: [
      { id:'s1_atk', name:'Infantry\nATK Bonus', row:0, col:0, prereqs:[],        maxLevel:10, stat:'Squad 1 ATK',   icon:'⚔️', levels:_pl(10,100000,1.8,3,3,'%') },
      { id:'s1_hp',  name:'Infantry\nHP',         row:1, col:0, prereqs:['s1_atk'], maxLevel:10, stat:'Squad 1 HP',  icon:'❤️', levels:_pl(10,120000,1.8,3,3,'%') },
      { id:'s1_rl',  name:'Rally\nCapacity',      row:1, col:1, prereqs:['s1_atk'], maxLevel:5,  stat:'Rally Size',  icon:'🚩', levels:_pl(5,150000,2.0,1000,1000,' troops') },
      { id:'s1_def', name:'Infantry\nDEF',         row:2, col:0, prereqs:['s1_hp'], maxLevel:10, stat:'Squad 1 DEF', icon:'🛡️', levels:_pl(10,150000,1.8,3,3,'%') },
      { id:'s1_frm', name:'Formation\nBonus',     row:3, col:0, prereqs:['s1_def'], maxLevel:5,  stat:'Formation Buff',icon:'⭐',levels:_pl(5,300000,2.0,2,2,'%') },
    ]
  },

  // ────────────────────────────────────────────────────────
  // SQUAD 2 — TANK
  // ────────────────────────────────────────────────────────
  {
    id: 'squad2', name: 'Squad 2\n(Tank)', cols: 2,
    nodes: [
      { id:'s2_atk', name:'Tank\nATK Bonus',  row:0, col:0, prereqs:[],         maxLevel:10, stat:'Squad 2 ATK',   icon:'🚂', levels:_pl(10,100000,1.8,3,3,'%') },
      { id:'s2_hp',  name:'Tank\nHP',          row:1, col:0, prereqs:['s2_atk'], maxLevel:10, stat:'Squad 2 HP',   icon:'❤️', levels:_pl(10,120000,1.8,3,3,'%') },
      { id:'s2_arm', name:'Tank\nArmor',       row:1, col:1, prereqs:['s2_atk'], maxLevel:5,  stat:'Tank Armor',   icon:'🔩', levels:_pl(5,150000,2.0,3,3,'%') },
      { id:'s2_def', name:'Tank\nDEF',         row:2, col:0, prereqs:['s2_hp'],  maxLevel:10, stat:'Squad 2 DEF',  icon:'🛡️', levels:_pl(10,150000,1.8,3,3,'%') },
      { id:'s2_spd', name:'Tank\nSpeed',       row:3, col:0, prereqs:['s2_def'], maxLevel:5,  stat:'Tank Speed',   icon:'⚡', levels:_pl(5,300000,2.0,2,2,'%') },
    ]
  },

  // ────────────────────────────────────────────────────────
  // SQUAD 3 — AIR
  // ────────────────────────────────────────────────────────
  {
    id: 'squad3', name: 'Squad 3\n(Air)', cols: 2,
    nodes: [
      { id:'s3_atk', name:'Air\nATK Bonus',  row:0, col:0, prereqs:[],         maxLevel:10, stat:'Squad 3 ATK',  icon:'✈️', levels:_pl(10,100000,1.8,3,3,'%') },
      { id:'s3_hp',  name:'Air\nHP',          row:1, col:0, prereqs:['s3_atk'], maxLevel:10, stat:'Squad 3 HP',  icon:'❤️', levels:_pl(10,120000,1.8,3,3,'%') },
      { id:'s3_ev',  name:'Air\nEvasion',     row:1, col:1, prereqs:['s3_atk'], maxLevel:5,  stat:'Air Evasion', icon:'🌀', levels:_pl(5,150000,2.0,2,2,'%') },
      { id:'s3_def', name:'Air\nDEF',         row:2, col:0, prereqs:['s3_hp'],  maxLevel:10, stat:'Squad 3 DEF', icon:'🛡️', levels:_pl(10,150000,1.8,3,3,'%') },
      { id:'s3_spd', name:'Air\nSpeed',       row:3, col:0, prereqs:['s3_def'], maxLevel:5,  stat:'Air Speed',   icon:'💨', levels:_pl(5,300000,2.0,2,2,'%') },
    ]
  },

  // ────────────────────────────────────────────────────────
  // SQUAD 4 — SPECIAL FORCES
  // ────────────────────────────────────────────────────────
  {
    id: 'squad4', name: 'Squad 4\n(Spec. Forces)', cols: 2,
    nodes: [
      { id:'s4_atk', name:'SF\nATK Bonus',    row:0, col:0, prereqs:[],         maxLevel:10, stat:'Squad 4 ATK',      icon:'🎖️', levels:_pl(10,100000,1.8,3,3,'%') },
      { id:'s4_hp',  name:'SF\nHP',            row:1, col:0, prereqs:['s4_atk'], maxLevel:10, stat:'Squad 4 HP',      icon:'❤️', levels:_pl(10,120000,1.8,3,3,'%') },
      { id:'s4_rng', name:'SF\nRange',         row:1, col:1, prereqs:['s4_atk'], maxLevel:5,  stat:'SF Range',         icon:'🎯', levels:_pl(5,150000,2.0,2,2,'%') },
      { id:'s4_def', name:'SF\nDEF',           row:2, col:0, prereqs:['s4_hp'],  maxLevel:10, stat:'Squad 4 DEF',     icon:'🛡️', levels:_pl(10,150000,1.8,3,3,'%') },
      { id:'s4_mt',  name:'Multi\nTarget',     row:3, col:0, prereqs:['s4_def'], maxLevel:5,  stat:'Multi-target Dmg', icon:'💥', levels:_pl(5,300000,2.0,2,2,'%') },
    ]
  },

  // ────────────────────────────────────────────────────────
  // ALLIANCE DUEL
  // Real costs use Valor Badges — placeholder food/iron values here.
  // Priority order for spending: Basic → Advanced → Super → VS/Final
  // ────────────────────────────────────────────────────────
  {
    id: 'allianceduel', name: 'Alliance\nDuel', cols: 3,
    nodes: [
      { id:'ad_br',  name:'Basic\nReward',      row:0, col:1, prereqs:[],              maxLevel:5,  stat:'Duel Points +%',    icon:'📊', levels:_pl(5, 30000,1.6,5,5,'%') },
      { id:'ad_ar',  name:'Advanced\nReward',   row:1, col:0, prereqs:['ad_br'],       maxLevel:5,  stat:'Chest Tier +1',     icon:'📈', levels:_pl(5, 60000,1.6,1,1,' tier') },
      { id:'ad_pm',  name:'Point\nMultiplier',  row:1, col:2, prereqs:['ad_br'],       maxLevel:5,  stat:'Point Multiplier',  icon:'✖️', levels:_pl(5, 60000,1.6,10,10,'%') },
      { id:'ad_sr',  name:'Super\nReward',      row:2, col:1, prereqs:['ad_ar','ad_pm'], maxLevel:5, stat:'Super Chest +1',   icon:'🏆', levels:_pl(5,120000,1.8,1,1,' tier') },
      { id:'ad_vb',  name:'VS\nBonus',          row:3, col:0, prereqs:['ad_sr'],       maxLevel:5,  stat:'VS Kill Points +%', icon:'⚡', levels:_pl(5,200000,2.0,10,10,'%') },
      { id:'ad_fr',  name:'Final\nReward',      row:3, col:2, prereqs:['ad_sr'],       maxLevel:5,  stat:'Final Chest Bonus', icon:'🎁', levels:_pl(5,200000,2.0,5,5,'%') },
    ]
  },

  // ────────────────────────────────────────────────────────
  // INTERCITY TRUCK
  // ────────────────────────────────────────────────────────
  {
    id: 'intercitytruck', name: 'Intercity\nTruck', cols: 2,
    nodes: [
      { id:'tr_cap', name:'Truck\nCapacity',       row:0, col:0, prereqs:[],                   maxLevel:10, stat:'Truck Load',         icon:'🚚', levels:_pl(10,70000,1.8,5,5,'%') },
      { id:'tr_spd', name:'Truck\nSpeed',          row:0, col:1, prereqs:[],                   maxLevel:10, stat:'Delivery Speed',     icon:'🏎️', levels:_pl(10,70000,1.8,5,5,'%') },
      { id:'tr_lb',  name:'Load\nBonus',           row:1, col:0, prereqs:['tr_cap'],            maxLevel:5,  stat:'Extra Load',         icon:'📦', levels:_pl(5,150000,2.0,10,10,'%') },
      { id:'tr_rt',  name:'Trade\nRoutes',         row:1, col:1, prereqs:['tr_spd'],            maxLevel:5,  stat:'Active Trucks +1',   icon:'🗺️', levels:_pl(5,150000,2.0,1,1,' slot') },
      { id:'tr_cd',  name:'Contract\nDiscount',    row:2, col:0, prereqs:['tr_lb','tr_rt'],     maxLevel:5,  stat:'Contract Cost',      icon:'💸', levels:_pl(5,300000,2.0,-5,-5,'%') },
    ]
  },
];
