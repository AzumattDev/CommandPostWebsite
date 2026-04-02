// data/buildings.js — HQ upgrade planner building cost data
// Resources in millions. Time in minutes.
// v:true = in-game verified; otherwise estimated from scaling.

const BD = {};
function d(b,l,ir,fo,go,oi,t,v){
  if(!BD[b])BD[b]={};
  BD[b][l]={r:[ir,fo,go,oi],t:t,v:!!v};
}

// HQ — verified: Lv22 = 110M/110M/35M/0 · 8d14h (12360 min)
d('HQ',15, 13,13,4,0,   1500);
d('HQ',16, 18,18,5.5,0, 2040);
d('HQ',17, 24,24,7.5,0, 2760);
d('HQ',18, 33,33,10,0,  3720);
d('HQ',19, 44,44,14,0,  5040);
d('HQ',20, 60,60,19,0,  6780);
d('HQ',21, 81,81,26,0,  9160);
d('HQ',22, 110,110,35,0,12360, true);
d('HQ',23, 149,149,47,0,16680);
d('HQ',24, 201,201,63,0,22500);
d('HQ',25, 271,271,85,0,30360);
d('HQ',26, 366,366,115,4,   41040);
d('HQ',27, 494,494,155,5.5, 55440);
d('HQ',28, 667,667,209,7.5, 74880);
d('HQ',29, 900,900,282,10,  101040);
d('HQ',30, 1215,1215,381,13.5,136440);

// Tech Center — verified: Lv21 = 73M/73M/23M/0 · 5d18h (8280 min)
d('Tech Center',14, 9,9,3,0,    1020);
d('Tech Center',15, 12,12,4,0,  1380);
d('Tech Center',16, 16,16,5.5,0,1860);
d('Tech Center',17, 22,22,7.5,0,2520);
d('Tech Center',18, 30,30,10,0, 3360);
d('Tech Center',19, 40,40,13,0, 4560);
d('Tech Center',20, 54,54,17,0, 6120);
d('Tech Center',21, 73,73,23,0, 8280, true);
d('Tech Center',22, 99,99,31,0,    11160);
d('Tech Center',23, 134,134,42,0,  15060);
d('Tech Center',24, 181,181,57,0,  20340);
d('Tech Center',25, 244,244,77,0,  27480);
d('Tech Center',26, 329,329,104,3.5,37080);
d('Tech Center',27, 444,444,140,4.8,50040);
d('Tech Center',28, 599,599,189,6.5,67560);
d('Tech Center',29, 809,809,255,8.8,91200);

// Drill Ground — verified: Lv21 = 14M iron / 42M food / 11M gold · 3d7h (4740 min)
// DG is food-heavy (iron:food ~1:3)
d('Drill Ground',14, 1.6,5.5,1.5,0, 600);
d('Drill Ground',15, 2.2,7.5,2,0,   810);
d('Drill Ground',16, 3,10,2.5,0,   1080);
d('Drill Ground',17, 4,13,3.5,0,   1440);
d('Drill Ground',18, 5.5,17,4.5,0, 1920);
d('Drill Ground',19, 7.5,23,6,0,   2580);
d('Drill Ground',20, 10,31,8,0,    3480);
d('Drill Ground',21, 14,42,11,0,   4740, true);
d('Drill Ground',22, 19,57,15,0,   6420);
d('Drill Ground',23, 26,77,20,0,   8640);
d('Drill Ground',24, 35,104,27,0, 11640);
d('Drill Ground',25, 47,140,36,0, 15720);
d('Drill Ground',26, 63,189,49,3, 21240);
d('Drill Ground',27, 85,255,66,4, 28680);
d('Drill Ground',28, 115,344,89,5.5,38700);
d('Drill Ground',29, 155,464,120,7.5,52200);

// Prerequisites: to upgrade HQ to level N, you need TC at N-1 and DG at N-1
function getPrereqs(n) {
  return [
    { b:'Tech Center', l:n-1 },
    { b:'Drill Ground', l:n-1 },
    { b:'HQ', l:n }
  ].filter(p => BD[p.b] && BD[p.b][p.l]);
}
