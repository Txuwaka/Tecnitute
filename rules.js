'use strict';
// Tute por parejas: reglas puras. La interfaz y la IA no pueden saltarse las jugadas legales.
const TuteRules=(()=>{
 const ids=['jugador1','jugador4','jugador3','jugador2'];
 const sides={jugador1:'nosotros',jugador3:'nosotros',jugador4:'ellos',jugador2:'ellos'};
 const suits=['Oros','Copas','Espadas','Bastos'];
 const ranks=[2,4,5,6,7,10,11,12,3,1],values={1:11,3:10,12:4,11:3,10:2};
 const key=c=>c.palo+'-'+c.numero,points=c=>values[c.numero]||0,strength=c=>ranks.indexOf(c.numero);
 const next=id=>ids[(ids.indexOf(id)+1)%4],order=id=>ids.map((_,i)=>ids[(ids.indexOf(id)+i)%4]);
 const deck=()=>suits.flatMap(palo=>ranks.map(numero=>({palo,numero})));
 function beats(a,b,trump){if(a.palo===b.palo)return strength(a)>strength(b);return a.palo===trump&&b.palo!==trump;}
 function winner(trick,trump){return trick.reduce((best,play)=>!best||beats(play.card,best.card,trump)?play:best,null);}
 function legal(hand,trick,trump){
  if(!trick.length)return hand.slice();
  const lead=trick[0].card.palo,top=winner(trick,trump).card,following=hand.filter(c=>c.palo===lead);
  if(following.length){const higher=following.filter(c=>beats(c,top,trump));return higher.length?higher:following;}
  const trumps=hand.filter(c=>c.palo===trump);
  if(!trumps.length)return hand.slice();
  const higher=trumps.filter(c=>beats(c,top,trump));
  // Si no se puede pisar un triunfo, está permitido el contrafallo.
  return higher.length?higher:hand.slice();
 }
 function chants(hand,trump,used=[]){
  const available=suits.filter(p=>!used.includes(p)&&hand.some(c=>c.palo===p&&c.numero===12)&&hand.some(c=>c.palo===p&&c.numero===11));
  return available.includes(trump)?[trump]:available;
 }
 function tute(hand){return [12,11].find(n=>suits.every(p=>hand.some(c=>c.numero===n&&c.palo===p)))||null;}
 function pick(hand,trick,trump,id,used=[]){
  const valid=legal(hand,trick,trump),top=winner(trick,trump),pairSuits=chants(hand,trump,used);
  const cost=c=>points(c)*3+strength(c)+(pairSuits.includes(c.palo)&&[11,12].includes(c.numero)?35:0)+(c.palo===trump?8:0);
  const sorted=valid.slice().sort((a,b)=>cost(a)-cost(b));
  if(!top){const ace=valid.find(c=>c.numero===1&&c.palo!==trump);return ace||sorted[0];}
  if(sides[top.id]===sides[id]){
   const feeding=valid.filter(c=>!beats(c,top.card,trump));
   if(feeding.length)return feeding.sort((a,b)=>(points(b)*3-cost(b)/5)-(points(a)*3-cost(a)/5))[0];
  }
  const wins=sorted.filter(c=>beats(c,top.card,trump));return wins[0]||sorted[0];
 }
 class Game{
  constructor(random=Math.random){this.random=random;this.match={nosotros:0,ellos:0};this.handNo=0;this.dealer=ids[Math.floor(random()*4)];this.deal();}
  deal(){
   const cards=deck();for(let i=cards.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
   this.handNo++;this.mano=next(this.dealer);this.actor=this.mano;this.hands=Object.fromEntries(ids.map(id=>[id,[]]));
   for(let r=0;r<10;r++)for(const id of order(this.mano))this.hands[id].push(cards.pop());
   this.trumpCard={...this.hands[this.dealer].at(-1)};this.trump=this.trumpCard.palo;
   for(const id of ids)this.hands[id].sort((a,b)=>suits.indexOf(a.palo)-suits.indexOf(b.palo)||strength(b)-strength(a));
   this.stage='playing';this.trick=[];this.trickNo=1;this.lastWinner=null;this.nextLeader=null;this.singers=[];this.singerIndex=0;
   this.used=Object.fromEntries(ids.map(id=>[id,[]]));this.captured={nosotros:[],ellos:[]};this.scores={nosotros:0,ellos:0};
   this.breakdown={nosotros:{cards:0,chants:0,last:0},ellos:{cards:0,chants:0,last:0}};
   this.history=[];this.calls={};this.result=null;this.chantLog=[];
  }
  legal(id){return this.stage==='playing'&&id===this.actor?legal(this.hands[id],this.trick,this.trump):[];}
  play(id,cardKey){
   if(!this.legal(id).some(c=>key(c)===cardKey))return false;
   const index=this.hands[id].findIndex(c=>key(c)===cardKey),card=this.hands[id].splice(index,1)[0];
   this.trick.push({id,card});this.calls[id]=card.numero+' de '+card.palo;
   if(this.trick.length===4){this.stage='trick-complete';this.actor=null;}else this.actor=next(id);
   return true;
  }
  resolve(){
   if(this.stage!=='trick-complete')return false;
   const win=winner(this.trick,this.trump),side=sides[win.id],earned=this.trick.reduce((sum,p)=>sum+points(p.card),0);
   this.captured[side].push(this.trick.map(p=>({...p})));this.breakdown[side].cards+=earned;this.scores[side]+=earned;this.lastWinner=win.id;this.nextLeader=win.id;
   this.history.push({number:this.trickNo,winner:win.id,points:earned,plays:this.trick.map(p=>({...p}))});
   this.calls[win.id]='¡BAZA! +'+earned;
   if(this.trickNo===10){this.breakdown[side].last=10;this.scores[side]+=10;this.finish(null,'points');return true;}
   this.stage='singing';this.singers=order(win.id).filter(id=>sides[id]===side);this.singerIndex=0;this.advanceSinger();return true;
  }
  available(id){return this.stage==='singing'&&this.actor===id?chants(this.hands[id],this.trump,this.used[id]):[];}
  canTute(id){return this.stage==='singing'&&this.actor===id?tute(this.hands[id]):null;}
  advanceSinger(){
   while(this.singerIndex<this.singers.length){const id=this.singers[this.singerIndex];
    if(chants(this.hands[id],this.trump,this.used[id]).length||tute(this.hands[id])){this.actor=id;return;}
    this.singerIndex++;
   }
   this.trick=[];this.trickNo++;this.stage='playing';this.actor=this.nextLeader;this.calls={};
  }
  sing(id,suit){
   if(!this.available(id).includes(suit))return false;
   const amount=suit===this.trump?40:20,side=sides[id];this.used[id].push(suit);this.scores[side]+=amount;this.breakdown[side].chants+=amount;
   this.chantLog.push({id,suit,amount,trick:this.trickNo});this.calls[id]='¡'+amount+' EN '+suit.toUpperCase()+'!';this.singerIndex++;this.advanceSinger();return true;
  }
  skip(id){if(this.stage!=='singing'||id!==this.actor)return false;this.singerIndex++;this.advanceSinger();return true;}
  declareTute(id){const n=this.canTute(id);if(!n)return false;this.calls[id]='¡TUTE DE '+(n===12?'REYES':'CABALLOS')+'!';this.finish(sides[id],n===12?'tute-reyes':'tute-caballos');return true;}
  finish(forced,reason){
   if(this.result)return;
   const side=forced||(this.scores.nosotros===this.scores.ellos?sides[this.lastWinner]:this.scores.nosotros>this.scores.ellos?'nosotros':'ellos');
   this.result={side,reason,tie:this.scores.nosotros===this.scores.ellos};this.match[side]++;
   this.stage=this.match[side]>=3?'match-over':'hand-over';this.actor=null;
  }
  nextHand(){if(this.stage!=='hand-over')return false;this.dealer=next(this.dealer);this.deal();return true;}
 }
 return {ids,sides,suits,ranks,key,points,strength,next,order,deck,beats,winner,legal,chants,tute,pick,Game};
})();
if(typeof module!=='undefined')module.exports=TuteRules;
