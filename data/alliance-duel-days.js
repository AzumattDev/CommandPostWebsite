// data/alliance-duel-days.js — Alliance Duel VS daily planner content
// Each entry: { tab, name, theme, value, icons[], quicklist[], announce, today[], prep[], tips[], points[] }
// today/prep/tips items: { t: title, d: description, pts?: badge, warn?: bool }

const days = [
  {
    tab: "Sun", name: "Sunday", theme: "Preparation day — no scoring", value: null,
    icons: [],
    quicklist: [
      "Stack radar missions — complete every one, but DO NOT claim any rewards yet",
      "Send ALL squads to resource tiles NOW — gold tiles first. Time returns to land AFTER Monday reset",
      "Queue your longest buildings right now (HQ, Barracks, Tech Center) — see the timing table in the card below",
      "Start a 1–2 day research — you will finish it with speedups on Wednesday",
      "Save everything — nothing scores on Sunday, no spending today",
    ],
    announce: "📋 PREP DAY: Stack radar (NO claiming — aim 30+). Send ALL squads to gold tiles, returns AFTER midnight reset. Queue longest buildings + start 2-day research. SAVE THIS WEEK: Mon=Drone/Stamina | Tue=Build speedups | Wed=Tech+Valor Badges | Thu=Hero XP/Shards | Fri=Train speedups | Sat=Healing speedups",
    today: [
      { t: "Stack radar tasks (DO NOT claim)", d: "Complete radar missions but leave all rewards unclaimed. Aim for 30–35 stacked before Monday reset. This is your Monday point burst." },
      { t: "Send ALL squads to gather", d: "Send every squad to resource tiles NOW — gold tiles give the most points. Watch the <strong>Action Timer</strong> above (Monday reset countdown): squads must land AFTER that reset to count as Monday gathering points. Aim for gather times that bring them home 30–60 minutes after reset — not before." },
      { t: "Start your longest buildings NOW", d: "Queue HQ, Barracks, Tech Center — the longest ones first. You'll use speedups to finish them on Tuesday (Base Expansion). The build only needs to be <em>in progress</em>, not done — but it must be running before Tuesday reset.<br><br><strong>When to start based on build duration:</strong><table class='pts-table'><thead><tr><th>Build duration</th><th>Start by</th></tr></thead><tbody><tr><td>Under 12 hours</td><td class='pts-val'>Monday — any time</td></tr><tr><td>12 h – 1 day</td><td class='pts-val'>Monday morning</td></tr><tr><td>1 – 2 days</td><td class='pts-vs'>Sunday (today) ←</td></tr><tr><td>2 – 4 days</td><td class='pts-other'>Friday – Saturday</td></tr><tr><td>4 – 7 days</td><td class='pts-lost'>Last Wed–Thu — already behind</td></tr><tr><td>7 – 10 days</td><td class='pts-lost'>Last Sunday — must already be running</td></tr><tr><td>10+ days</td><td class='pts-lost'>Long-term planning; use a speedup to get it started now</td></tr></tbody></table>The <strong>Action Timer</strong> above shows exact time until Tuesday. Any build longer than that countdown must already be in your queue." },
      { t: "Queue a long research", d: "Start a research that takes 1–2 days. You'll finish it with speedups on Wednesday to score Tech Power + Tech Speed." },
    ],
    prep: [
      { t: "This week's save list — know what goes where", d: "<strong>Monday:</strong> Drone Parts, Drone Data, Stamina, Chip Chests, Gather resources.<br><strong>Tuesday:</strong> Building speedups, Generic speedups, UR Trucks, Survivor Tickets.<br><strong>Wednesday:</strong> Tech speedups, Valor Badges, Drone Component Chests. Keep stacking radar from Monday.<br><strong>Thursday:</strong> Hero XP, Hero Shards, Skill Medals, Recruit Tickets, Weapon Shards.<br><strong>Friday:</strong> Training speedups, Generic speedups.<br><strong>Saturday:</strong> Healing speedups, Legend Tasks, remaining UR Truck contracts, all leftover speedups." },
    ],
    tips: [
      { t: "5-minute reset gap", d: "After daily server reset, there's a 5–7 minute window where points don't register. Wait it out before spending any resources." },
      { t: "Win condition reminder", d: "7 points wins the week. Win Mon–Thu and you clinch it before Saturday's risky combat day. Saturday's 4 pts is your fallback if it's close." },
    ],
    points: []
  },
  {
    tab: "Mon", name: "Monday", theme: "Day 1 — Radar Training", value: "1 pt",
    icons: [
      {img:'radartask.png', label:'Radar Task'},
      {img:'stamina_green.png', label:'Stamina'},
      {img:'heroxp.png', label:'Hero XP'},
      {img:'dronedata.png', label:'Drone Data'},
      {img:'dronepart.png', label:'Drone Part'},
      {img:'gathergold.png', label:'Gather Gold'},
      {img:'gatheriron.png', label:'Gather Iron'},
      {img:'gatherfood.png', label:'Gather Food'},
      {img:'chipchests.png', label:'Chip Chest', note:'Day 85+'},
    ],
    quicklist: [
      "Claim ALL stacked radar tasks immediately — biggest single point burst of the day",
      "Use ALL Drone Parts + ALL Drone Data — your #1 point source today, dump every last one",
      "Use ALL Stamina on radar missions, attacks, and rallies",
      "Collect returning gatherers → send ALL squads back out to resource tiles immediately",
      "Open all Drone Chip Chests (Day 85+ only)",
    ],
    announce: "📡 MONDAY — Radar Training (1 pt): CLAIM all stacked radar first. Dump ALL Drone Parts + Drone Data. Use ALL Stamina. Collect gatherers → resend. Open Chip Chests (Day 85+). DO NOT spend tech speedups, hero resources, or training speedups — they score more on their day. Keep stacking radar without claiming.",
    today: [
      { t: "Claim all stacked radar rewards", pts: "~25k pts/task", d: "First action after reset — collect every pending radar task saved from Sunday. This is your biggest single point burst of the day." },
      { t: "Spend ALL stamina", pts: "~300 pts/stamina", d: "Use every stamina point on radar missions, attacks, and rallies. Overlaps with Arms Race: Drone Upgrade for double rewards." },
      { t: "Use ALL Drone Parts + Drone Data", pts: "~10 pts/data unit", d: "Dump your entire week's stock of both. These are the #1 point source on Monday — don't hold any back." },
      { t: "Collect returning gatherers", pts: "~40 pts/100 gathered", d: "Squads sent Sunday should return now — collect gold, iron, and food for gathering points. Send them back out immediately after." },
      { t: "Open all Drone Chip Chests", pts: "~2k pts/chest (Day 85+)", d: "Open every saved skill chip chest (Legendary, Epic, Rare, Common). Available from Day 85+ only." },
    ],
    prep: [
      { t: "Immediately start stacking radar again", d: "The moment you've claimed Monday's rewards, start completing new radar missions without claiming them. Stack all week — they'll be claimed on Wednesday." },
      { t: "Save ALL building speedups for Tuesday", d: "Do not touch a single building speedup today. Every one you save now is Tuesday points." },
      { t: "Save ALL tech speedups for Wednesday", d: "Don't start any research completions. Tech speedups and Valor Badges are Wednesday's fuel." },
      { t: "Save ALL hero resources for Thursday", d: "Don't level heroes, use shards, or spend skill medals. Thursday is hero day — everything is worth more then." },
    ],
    tips: [
      { t: "Hero XP: Monday scores it, Thursday maximizes it", d: "Hero XP is a valid Monday scoring item but earns more points per item on Thursday. Save it for Thursday unless you're very close to a chest threshold." },
      { t: "Ration Drone resources if opponent is weak", d: "Spend just enough to hit all 9 individual chests. Bank the rest for next week." },
    ],
    points: ["Radar tasks", "Stamina", "Hero XP", "Drone Data", "Drone Parts", "Gather Gold/Iron/Food", "Chip Chests"]
  },
  {
    tab: "Tue", name: "Tuesday", theme: "Day 2 — Base Expansion", value: "2 pts",
    icons: [
      {img:'buildingpower.png', label:'Building Power'},
      {img:'buildingspeed.png', label:'Building Speed'},
      {img:'genericspeed.png', label:'Generic Speed'},
      {img:'urtruck.png', label:'UR Truck'},
      {img:'legendtask.png', label:'Legend Task'},
      {img:'survivorticket.png', label:'Survivor Recruit'},
    ],
    quicklist: [
      "Use ALL building speedups + ALL generic speedups to finish constructions",
      "Send ONLY UR (orange) Trade Contract trucks — skip green, blue, and purple rarities entirely",
      "Complete all starred Legend Tasks saved in Secret Command Post",
      "Unpack any gift-boxed buildings for extra Building Power points",
      "Use Survivor Recruitment tickets",
    ],
    announce: "🏗️ TUESDAY — Base Expansion (2 pts): Use ALL building speedups + generics. Send ONLY UR (orange) trucks. Finish starred Legend Tasks. Unpack gift boxes. STILL SAVE: tech speedups + Valor Badges for Wed, all hero resources for Thu, training speedups for Fri. Queue a research tonight if not already running.",
    today: [
      { t: "Blast through buildings with speedups", pts: "~120 pts/speedup", d: "Use building speedups to complete all queued constructions. Generic (universal) speedups count toward Building Speed here too — dump any non-specific speedups today. Aim for 10–14 days' worth across 2–3 major buildings." },
      { t: "Unpack any gift-boxed buildings", pts: "~21 pts/power increase", d: "Open buildings left in gift state. Each one increases Building Power for extra points." },
      { t: "Send UR (orange) trucks only", pts: "~200k pts/truck", d: "Use Trade Contracts to refresh until you get Legendary rarity trucks. Lower rarity trucks score poorly — only send orange ones." },
      { t: "Complete Legendary Secret Tasks", pts: "~150k pts/task", d: "Run orange tasks in the Secret Command Post. Use Secret Orders to refresh for more. Save starred tasks for Saturday." },
      { t: "Use Survivor Recruitment Tickets", pts: "~3k pts/ticket", d: "Use all saved Survivor Tickets in the Tavern. Easy points that are often forgotten at higher levels." },
      { t: "Use Armament Materials (S4+)", d: "Season 4+ only: invest Armament Materials and Cores for T11 troop upgrades." },
    ],
    prep: [
      { t: "Keep stacking radar — do NOT claim", d: "Continue completing radar missions without claiming rewards. Stack all the way through to Wednesday morning." },
      { t: "Save ALL tech speedups for tomorrow", d: "Don't complete a single research today. Wednesday is tech day — every research speedup you hold now is Wednesday points." },
      { t: "Save ALL Valor Badges for tomorrow", d: "Don't spend any badges today. Wednesday is their day — they'll be used on Alliance Duel research for up to 150% point multiplier." },
      { t: "Save Drone Component Chests for tomorrow", d: "Hold all Lv.1–7 Drone Component Chests. They only score on Wednesday." },
      { t: "Save hero resources for Thursday", d: "Keep holding all Hero XP, Hero Shards, Skill Medals, and Recruit Tickets. Thursday is hero day." },
    ],
    tips: [
      { t: "Arms Race overlap", d: "Building speedups and power overlap with Arms Race: City Building. Run both simultaneously for double credit." },
      { t: "Starred secret tasks are Saturday's ammo", d: "Leave star-marked legend tasks pending all week. Saturday is when they score best." },
    ],
    points: ["Building Power", "Building Speed", "Generic speedups", "UR Trucks", "Legend Tasks", "Survivor Recruits"]
  },
  {
    tab: "Wed", name: "Wednesday", theme: "Day 3 — Age of Science", value: "2 pts",
    icons: [
      {img:'radartask.png', label:'Radar Task'},
      {img:'techpower.png', label:'Tech Power'},
      {img:'techspeed.png', label:'Tech Speed'},
      {img:'genericspeed.png', label:'Generic Speed'},
      {img:'valorbadge.png', label:'Valor Badge'},
      {img:'dronechest.png', label:'Drone Chest'},
    ],
    quicklist: [
      "Claim ALL stacked radar tasks (stacked since Monday) — first action of the day",
      "Use ALL tech speedups + ALL generic speedups to finish every research you have",
      "Spend ALL Valor Badges — Duel research tree first, then trucks and special forces branches",
      "Open ALL Drone Component Chests (Lv.1–7) — these ONLY score on Wednesday, never another day",
      "Queue troop training in all barracks tonight for Friday's promotion burst",
    ],
    announce: "🔬 WEDNESDAY — Age of Science (2 pts): Claim stacked radar. Use ALL tech speedups + generics. Spend ALL Valor Badges (Duel research tree first). Open ALL Drone Component Chests (only score today). STILL SAVE: Hero XP/Shards for Thu, training speedups for Fri. Queue troop training in barracks tonight — Friday needs troops mid-queue.",
    today: [
      { t: "Claim stacked radar rewards", pts: "~23k pts/task", d: "First action — collect all radar tasks stacked since Monday. Instant point injection to start the day strong." },
      { t: "Finish ALL research with speedups", pts: "~120 pts/speedup · ~21 pts/research", d: "Spend every tech speedup to complete research. Generic (universal) speedups count toward Tech Speed too — use them all. Don't leave completed research sitting — it blocks your Tech Center." },
      { t: "Spend ALL Valor Badges", pts: "~600 pts/badge", d: "This is the only day to spend badges efficiently. Priority order: Alliance Duel research tree first (unlocks point multipliers), then Trucks and Special Forces branches." },
      { t: "Open all Drone Component Chests", d: "Open every saved Lv.1–7 component chest now. These only score on Wednesday — don't hold them past today." },
    ],
    prep: [
      { t: "Save ALL Hero XP for tomorrow", d: "Don't level any heroes today. Every XP book is worth more points on Thursday." },
      { t: "Save ALL Hero Shards + Skill Medals for tomorrow", d: "Hold all Universal Shards, Overlord Shards, and Skill Medals for Thursday." },
      { t: "Save ALL Recruit Tickets for tomorrow", d: "Legendary, New Era, and Hero's Return tickets — all for Thursday's Elite Recruitment." },
      { t: "Save Weapon Shards for tomorrow (S1+)", d: "If you're in Season 1+, hold all Exclusive Weapon Shards for Thursday." },
      { t: "Stack radar again — don't claim", d: "Start fresh radar missions without claiming. These build up through Thursday and get claimed on Friday." },
      { t: "Save ALL training speedups for Friday", d: "Don't touch training speedups. Friday is troop training day — save everything." },
      { t: "Save healing speedups for Saturday", d: "Start setting aside healing speedups now. Saturday combat injures troops — fast healing = extra Saturday points." },
    ],
    tips: [
      { t: "Alliance Duel research is a force multiplier", d: "Upgrading the Duel research tree increases your points per action by up to 150%. 'Advanced Reward' and 'Super Reward' nodes unlock better chests — prioritize these above all other badge spending." },
      { t: "Arms Race overlap", d: "Overlaps with Arms Race: Tech Research. Run both together for double credit." },
    ],
    points: ["Radar tasks", "Tech Power", "Tech Speed", "Generic speedups", "Valor Badges", "Drone Component Chests"]
  },
  {
    tab: "Thu", name: "Thursday", theme: "Day 4 — Train Heroes", value: "2 pts",
    icons: [
      {img:'herorecruitticket.png', label:'Hero Recruit'},
      {img:'heroxp.png', label:'Hero XP'},
      {img:'heroshards.png', label:'Hero Shard'},
      {img:'skillmedal.png', label:'Skill Medal'},
      {img:'weaponshard.png', label:'Weapon Shard', note:'From S1'},
    ],
    quicklist: [
      "Use ALL Hero XP books — level every hero you own",
      "Use ALL Hero Shards — Universal, Hero-specific, and Overlord Universal",
      "Use ALL Skill Medals — upgrade every hero skill you can",
      "Use ALL Recruit Tickets — Legendary, New Era, and Hero's Return",
      "Use ALL Exclusive Weapon Shards (Season 1+ only)",
    ],
    announce: "⚔️ THURSDAY — Train Heroes (2 pts): Use ALL Hero XP, ALL Hero Shards, ALL Skill Medals, ALL Recruit Tickets. Weapon Shards if S1+. Hold nothing back. Queue troop training in all barracks now — Friday speedups will promote them for max points. Save training speedups (Fri) and healing speedups (Sat).",
    today: [
      { t: "Use ALL Hero XP", pts: "~6 pts/660 XP", d: "Level up every hero with the full week's stock of XP books. Overlaps with Arms Race: Hero Upgrade for double credit." },
      { t: "Use ALL Hero Shards", pts: "~20k (gold) · ~7k (purple) · ~2k (blue)", d: "Promote hero stars using every saved Universal Shard, Hero-specific Shard, and Overlord Universal Shard." },
      { t: "Use ALL Skill Medals", pts: "~20 pts/medal", d: "Upgrade hero skills with every saved medal. Increases combat power and earns Duel points." },
      { t: "Elite Recruitment", pts: "~3.75k pts/recruit", d: "Use every saved Legendary, New Era, and Hero's Return ticket in the Tavern. Don't hold any back." },
      { t: "Use ALL Weapon Shards (S1+)", pts: "~20k pts/shard", d: "Season 1+ only: use every Exclusive Weapon Shard to upgrade hero weapons. Each shard scores separately." },
    ],
    prep: [
      { t: "Stack radar — do NOT claim", d: "Complete radar missions without claiming rewards. Stack as many as possible for Friday morning's burst." },
      { t: "Queue troop training in all barracks", d: "Start training soldiers now so they're mid-queue on Friday. You'll use speedups Friday to finish and promote them for maximum points." },
      { t: "Save ALL training speedups for tomorrow", d: "Don't touch a single training speedup today. Friday's troop training is your main Friday scoring engine." },
      { t: "Save healing speedups for Saturday", d: "Keep holding healing speedups. Saturday combat will injure your troops — quick healing = extra Saturday points." },
      { t: "Save UR Truck contracts for Friday + Saturday", d: "Keep Trade Contracts in reserve. You'll dispatch trucks again on Friday and need more for Saturday morning." },
    ],
    tips: [
      { t: "Most straightforward day of the week", d: "Thursday is simple — just dump every hero resource you've been saving. No complex decisions." },
      { t: "Don't buy pulls", d: "Only use tickets you've been saving all week. Don't spend diamonds on pulls just for Duel points unless you're very close to a chest threshold." },
    ],
    points: ["Hero Recruit", "Hero XP", "Hero Shards", "Skill Medals", "Weapon Shards (S1+)"]
  },
  {
    tab: "Fri", name: "Friday", theme: "Day 5 — Total Mobilization", value: "2 pts",
    icons: [
      {img:'radartask.png', label:'Radar Task'},
      {img:'buildingpower.png', label:'Building Power'},
      {img:'buildingspeed.png', label:'Building Speed'},
      {img:'techpower.png', label:'Tech Power'},
      {img:'techspeed.png', label:'Tech Speed'},
      {img:'trainunit.png', label:'Train Unit'},
      {img:'trainspeed.png', label:'Train Speed'},
      {img:'genericspeed.png', label:'Generic Speed'},
      {img:'overlordshard.png', label:'Overlord Shard', note:'From S2'},
      {img:'overlordgbook.png', label:'Overlord GBook', note:'From S2'},
      {img:'overlordcert.png', label:'Overlord Cert', note:'From S2'},
      {img:'overlordbbadge.png', label:'Overlord BBadge', note:'From S2'},
      {img:'overlordsbadge.png', label:'Overlord SBadge', note:'From S2'},
    ],
    quicklist: [
      "Claim ALL stacked radar tasks immediately — first action after reset",
      "Use ALL training speedups + generics to train and promote troops — higher tier = far more points per troop",
      "Finish leftover buildings + research with any remaining speedups",
      "Shield: be online at Saturday reset and shield within 5 minutes. If sleeping through reset, apply 24h shield NOW",
      "Recall ALL squads off resource tiles before Saturday reset — open squads are free kills",
    ],
    announce: "🚀 FRIDAY — Total Mobilization (2 pts): Claim radar. Use ALL training speedups — promote troops for max points. Finish leftover buildings + research. SHIELD: Be online at midnight reset, shield within 5 min. If sleeping through reset, apply 24h shield NOW. Recall ALL squads before reset. Save healing speedups for tomorrow.",
    today: [
      { t: "Claim stacked radar rewards", pts: "~23k pts/task", d: "First action — collect all radar tasks stacked since Thursday. Do this immediately after reset." },
      { t: "Train troops (main focus)", pts: "~122 pts/speedup · points scale with tier", d: "Use all training speedups and generic/universal speedups to train and promote troops. Your #1 point source today. Promoting existing troops to higher tiers earns far more than training fresh — see tier table below." },
      { t: "Troop tier points — promote, don't train from scratch", d: "<table class='pts-table'><thead><tr><th>Tier</th><th>Pts per troop trained/promoted</th></tr></thead><tbody><tr><td>T1</td><td class='pts-val'>~46</td></tr><tr><td>T2</td><td class='pts-val'>~70</td></tr><tr><td>T3</td><td class='pts-val'>~93</td></tr><tr><td>T4</td><td class='pts-val'>~117</td></tr><tr><td>T5</td><td class='pts-val'>~140</td></tr><tr><td>T6</td><td class='pts-val'>~164</td></tr><tr><td>T7</td><td class='pts-val'>~197</td></tr><tr><td>T8</td><td class='pts-val'>~211</td></tr><tr><td>T9</td><td class='pts-val'>~234</td></tr><tr><td>T10</td><td class='pts-val'>~258</td></tr></tbody></table>Points are based on the troop's <strong>arrival tier</strong>. Promoting T4→T5 earns T5 points — same as training T5 from scratch. Stack cheap low-tier troops all week, then promote them in bulk today." },
      { t: "Finish leftover buildings", pts: "~120 pts/speedup · ~21 pts/power", d: "Use any remaining construction speedups. Unpack gift boxes. Building Power and Building Speed both score today." },
      { t: "Finish leftover research", pts: "~120 pts/speedup · ~21 pts/research", d: "Complete any remaining tech with spare speedups. Tech Power and Tech Speed both score today." },
      { t: "Overlord upgrades (S2+)", d: "Season 2+ only: use Overlord Shards, Guidebooks, Certificates, Bronze Badges, and Star Badges. All five item types score as separate categories — use every one you have." },
    ],
    prep: [
      { t: "Shield timing — know the difference", d: "<strong>Primary (best):</strong> Be online at Saturday reset (server midnight — see Action Timer above) and apply your shield within the first 5 minutes. An 8h, 12h, or 24h shield applied <em>at</em> reset covers the entire Saturday combat window.<br><br><strong>Backup only — if you cannot be online at reset:</strong> Apply a 24h shield before sleeping Friday night. A shorter shield (8h/12h) applied Friday night may expire mid-Saturday and leave you exposed. Only do this if you genuinely cannot be there for reset.<br><br>Either way — do NOT go into Saturday morning without a shield active.", warn: true },
      { t: "Save healing speedups for tomorrow", d: "Don't use any healing speedups tonight. You'll need them Saturday after combat to score Healing Speed points." },
      { t: "Save Legend Tasks for tomorrow", d: "Don't finish any starred Secret Command Post tasks tonight. Legend Tasks are a clean Saturday point source." },
      { t: "Save remaining UR Truck contracts for tomorrow", d: "Hold any leftover Trade Contracts for Saturday morning truck dispatches." },
      { t: "Recall all squads", d: "Pull every squad off of resource tiles before you sleep. Any troops out Saturday morning are free kills for the enemy." },
    ],
    tips: [
      { t: "Arms Race overlap", d: "Troop training overlaps with Arms Race: Unit Progression. Run both at the same time for double rewards." },
      { t: "Waterfall method for max train points", d: "Train cheap low-tier troops all week, then promote them through each barracks tier on Friday. Each promotion step scores separately for far more points than direct high-tier training." },
    ],
    points: ["Radar tasks", "Train Unit", "Train Speed", "Building Power/Speed", "Tech Power/Speed", "Generic speedups", "Overlord items (S2+)"]
  },
  {
    tab: "Sat", name: "Saturday", theme: "Day 6 — Enemy Buster", value: "4 pts",
    icons: [
      {img:'urtruck.png', label:'UR Truck'},
      {img:'legendtask.png', label:'Legend Task'},
      {img:'buildingspeed.png', label:'Building Speed'},
      {img:'techspeed.png', label:'Tech Speed'},
      {img:'trainspeed.png', label:'Train Speed'},
      {img:'healingspeed.png', label:'Healing Speed'},
      {img:'genericspeed.png', label:'Generic Speed'},
      {img:'unitkilled.png', label:'Unit Killed'},
    ],
    quicklist: [
      "Check shield first — if online at reset, shield within 5 min. If you slept through it, verify it is still active and not expiring",
      "Send UR (orange) trucks immediately — guaranteed points with zero combat risk",
      "Complete ALL saved Legend Tasks from Secret Command Post",
      "Dump EVERY remaining speedup — building, tech, train, healing, and generic all score as separate categories",
      "Kill VS opponent troops for 5× points — read alliance chat and coordinate before attacking anyone",
    ],
    announce: "💥 SATURDAY — Enemy Buster (4 pts): CHECK SHIELD FIRST. Send UR trucks. Complete all Legend Tasks. Dump EVERY remaining speedup. Kill VS opponent troops (5x points — coordinate in chat). Empty defense lineup before combat. Spend EVERYTHING — nothing carries over after tonight's reset.",
    today: [
      { t: "Shield check — first thing at reset", d: "If you are online at Saturday reset: apply your shield within the first 5 minutes so it covers the full combat window. If you shielded before sleep (backup method): verify it is still active and check the expiry time. Re-apply immediately if it dropped or will expire before Duel ends. A lapsed shield Saturday morning means your base gets zeroed before you can respond." },
      { t: "Send UR Trucks", pts: "~200k pts/truck", d: "Guaranteed points with zero combat risk. Use Trade Contracts to refresh for UR (orange) trucks. Only send orange — lower rarity isn't worth it." },
      { t: "Complete all saved Legend Tasks", pts: "~150k pts/task", d: "Finish every starred legendary task you've been holding from the Secret Command Post. These were saved specifically for today." },
      { t: "Dump ALL remaining speedups", pts: "~120 pts/speedup", d: "Building Speed, Tech Speed, Train Speed, Healing Speed, and Generic (universal) speedups each score as separate categories. Use absolutely every speedup you have left — nothing carries over usefully." },
      { t: "Kill enemy units", d: "Unit kills score directly. Killing your VS opponent's units gives 5× more points than killing anyone else. Follow alliance coordination for attack targets and timing." },
      { t: "Unit kill & loss point values by tier", d: "<table class='pts-table'><thead><tr><th>Tier</th><th class='pts-vs'>VS opponent kill</th><th class='pts-val'>Any kill</th><th>Lost (yours)</th></tr></thead><tbody><tr><td>T1</td><td class='pts-vs'>25</td><td class='pts-val'>5</td><td>6</td></tr><tr><td>T2</td><td class='pts-vs'>38</td><td class='pts-val'>8</td><td>8</td></tr><tr><td>T3</td><td class='pts-vs'>50</td><td class='pts-val'>10</td><td>10</td></tr><tr><td>T4</td><td class='pts-vs'>63</td><td class='pts-val'>13</td><td>13</td></tr><tr><td>T5</td><td class='pts-vs'>75</td><td class='pts-val'>15</td><td>15</td></tr><tr><td>T6</td><td class='pts-vs'>88</td><td class='pts-val'>18</td><td>18</td></tr><tr><td>T7</td><td class='pts-vs'>100</td><td class='pts-val'>20</td><td>20</td></tr><tr><td>T8</td><td class='pts-vs'>113</td><td class='pts-val'>23</td><td>20</td></tr><tr><td>T9</td><td class='pts-vs'>125</td><td class='pts-val'>25</td><td class='pts-lost'>—</td></tr><tr><td>T10</td><td class='pts-vs'>138</td><td class='pts-val'>28</td><td class='pts-lost'>—</td></tr></tbody></table>VS opponent kills are worth 5× more — always prioritize their troops over anyone else's." },
    ],
    prep: [
      { t: "Remove your defense lineup before combat", d: "Wall → Defense Lineup → uncheck all squads. If enemies breach your base with an empty lineup, only idle drill-ground troops die instead of your best heroes. Re-enable after Duel ends.", warn: true },
      { t: "After Duel ends: reset immediately for next week", d: "Saturday night when the Duel resets — start stacking radar tasks right away. Send gatherers before you sleep. Queue your longest buildings and research to run overnight so they're ready for Tuesday and Wednesday." },
      { t: "Note what ran dry", d: "If you exhausted Drone Parts mid-week, or had nothing left for Saturday, note it now. Next week: hoard that resource more aggressively and spend less outside of its designated day." },
    ],
    tips: [
      { t: "Read alliance chat before acting", d: "Leadership may call a NAP (non-aggression pact), full attack, or shielded hold. Follow orders before doing anything independently." },
      { t: "If the opponent is too strong — stay shielded", d: "Score your safe points (trucks, legend tasks, speedups) and don't feed them kills. A shielded loss still beats a zeroed base." },
      { t: "Last-minute dump tactic", d: "Against a strong opponent, hold all remaining resources until the final minutes before reset. One coordinated mass dump prevents them from adjusting their score in response." },
      { t: "Never gather on Saturday", d: "Any squad on a resource tile Saturday is a free kill for the enemy. Recall everyone before combat starts." },
    ],
    points: ["UR Trucks", "Legend Tasks", "Building Speed", "Tech Speed", "Train Speed", "Healing Speed", "Generic speedups", "Unit Kills (5x vs VS)"]
  }
];
