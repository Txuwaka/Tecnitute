const assert=require('node:assert/strict'),R=require('../rules.js');
const c=(numero,palo='Oros')=>({numero,palo}),p=(id,numero,palo)=>({id,card:c(numero,palo)}),keys=cs=>cs.map(R.key).sort();
assert.equal(R.deck().length,40);assert.equal(new Set(keys(R.deck())).size,40);assert.equal(R.deck().reduce((n,c)=>n+R.points(c),0),120);
assert(R.beats(c(1),c(3),'Copas'));assert(!R.beats(c(2),c(12),'Copas'));assert(R.beats(c(2,'Copas'),c(1),'Copas'));
assert.deepEqual(keys(R.legal([c(2),c(1),c(3,'Bastos')],[p('jugador1',12,'Oros')],'Copas')),['Oros-1']);
assert.deepEqual(keys(R.legal([c(2),c(1),c(3,'Bastos')],[p('jugador1',12,'Oros'),p('jugador4',2,'Copas')],'Copas')),['Oros-1','Oros-2']);
assert.deepEqual(keys(R.legal([c(2,'Copas'),c(3,'Bastos')],[p('jugador1',12,'Oros')],'Copas')),['Copas-2']);
assert.deepEqual(keys(R.legal([c(2,'Copas'),c(1,'Copas'),c(3,'Bastos')],[p('jugador1',12,'Oros'),p('jugador4',3,'Copas')],'Copas')),['Copas-1']);
assert.equal(R.legal([c(2,'Copas'),c(3,'Bastos')],[p('jugador1',12,'Oros'),p('jugador4',3,'Copas')],'Copas').length,2);
assert.deepEqual(R.chants([c(12),c(11),c(12,'Copas'),c(11,'Copas')],'Copas'),['Copas']);
assert.deepEqual(R.chants([c(12),c(11)],'Copas',['Oros']),[]);assert.equal(R.tute(R.suits.map(s=>c(12,s))),12);
let g=new R.Game();assert.equal(g.play(R.next(g.actor),R.key(g.hands[R.next(g.actor)][0])),false);assert.equal(g.resolve(),false);assert.equal(g.declareTute(g.actor),false);
// Both partners may sing once after their partnership wins; forty has priority.
g.stage='singing';g.trump='Copas';g.singers=['jugador1','jugador3'];g.singerIndex=0;g.actor='jugador1';g.nextLeader='jugador1';g.hands.jugador1=[c(12),c(11),c(12,'Copas'),c(11,'Copas')];g.hands.jugador3=[c(12,'Bastos'),c(11,'Bastos')];
assert.equal(g.sing('jugador1','Oros'),false);assert(g.sing('jugador1','Copas'));assert.equal(g.actor,'jugador3');assert(g.sing('jugador3','Bastos'));assert.equal(g.scores.nosotros,60);assert.equal(g.stage,'playing');assert.equal(g.actor,'jugador1');
g.stage='singing';g.actor='jugador1';g.hands.jugador1=R.suits.map(s=>c(11,s));assert(g.declareTute('jugador1'));assert.equal(g.result.reason,'tute-caballos');assert.equal(g.match.nosotros,1);g.finish('nosotros','points');assert.equal(g.match.nosotros,1);
g=new R.Game();g.scores={nosotros:65,ellos:65};g.lastWinner='jugador2';g.finish(null,'points');assert.equal(g.result.side,'ellos');
let hands=0,cantos=0;
for(let seed=1;seed<=100;seed++){
 let s=seed;const random=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);g=new R.Game(random);
 while(g.stage!=='match-over'){
  let steps=0;const dealer=g.dealer,mano=g.mano;assert.equal(R.next(dealer),mano);assert(g.hands[dealer].some(c=>R.key(c)===R.key(g.trumpCard)));
  while(!g.result){assert(++steps<150);if(g.stage==='playing'){const id=g.actor,card=R.pick(g.hands[id],g.trick,g.trump,id,g.used[id]);assert(g.legal(id).some(c=>R.key(c)===R.key(card)));assert(g.play(id,R.key(card)));assert(!g.play(id,R.key(card)));}
   else if(g.stage==='trick-complete'){assert.equal(g.trick.length,4);assert(g.resolve());assert(!g.resolve());}
   else if(g.stage==='singing'){const suit=g.available(g.actor)[0];if(suit){cantos++;assert(g.sing(g.actor,suit));}else assert(g.skip(g.actor));}
   else throw Error(g.stage);
  }
  hands++;assert.equal(g.history.length,10);assert.equal(g.breakdown.nosotros.cards+g.breakdown.ellos.cards,120);assert.equal(g.breakdown.nosotros.last+g.breakdown.ellos.last,10);assert.equal(g.scores.nosotros+g.scores.ellos,130+g.chantLog.reduce((sum,c)=>sum+c.amount,0));
  const played=g.history.flatMap(h=>h.plays.map(p=>R.key(p.card)));assert.equal(new Set(played).size,40);assert(Object.values(g.hands).every(h=>h.length===0));
  if(g.stage==='hand-over'){assert(g.nextHand());assert.equal(g.dealer,R.next(dealer));assert.equal(g.mano,R.next(mano));}
 }
 assert.equal(Math.max(...Object.values(g.match)),3);
}
console.log(`OK: reglas, obligaciones, cantes, tute, empate, rotación; ${hands} manos completas en 100 partidas, ${cantos} cantes.`);
