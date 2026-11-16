(function(root){
'use strict';
const KEY='jidosa-garden-v1',SUBJECTS=['law','general','corp'];
const HELMETS={mint:{name:'새싹 안전모',cost:0,color:'#59b88d'},sun:{name:'햇살 안전모',cost:24,color:'#f3bf4f'},berry:{name:'딸기 안전모',cost:36,color:'#ed86a1'},night:{name:'별빛 안전모',cost:48,color:'#9388d7'}};
const integer=(v,max=10000000)=>Number.isSafeInteger(v)&&v>=0&&v<=max?v:0;
const dict=()=>Object.create(null),validId=v=>typeof v==='string'&&v.length>0&&v.length<=160&&!['__proto__','constructor','prototype'].includes(v);
function dayKey(date){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
function addDays(day,n){return new Date(Date.parse(day+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);}
function fresh(){return {version:1,xp:0,coins:0,streak:0,lastDay:'',seeded:false,migrated:0,badges:[],equipped:'mint',owned:['mint'],days:dict(),progress:dict(),lessonAwards:dict()};}
function clean(raw){
 const s=fresh();if(!raw||raw.version!==1)return s;
 for(const k of ['xp','coins','streak','migrated'])s[k]=integer(raw[k]);
 s.badges=[...new Set((Array.isArray(raw.badges)?raw.badges:[]).filter(x=>['first','twenty','streak3','boss'].includes(x)))];s.seeded=raw.seeded===true;s.lastDay=/^\d{4}-\d{2}-\d{2}$/.test(raw.lastDay||'')?raw.lastDay:'';
 s.owned=[...new Set(['mint',...(Array.isArray(raw.owned)?raw.owned:[]).filter(k=>HELMETS[k])])];
 s.equipped=s.owned.includes(raw.equipped)?raw.equipped:'mint';
 for(const [day,d]of Object.entries(raw.days||{}).slice(-120)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!d||typeof d!=='object')continue;
  const b={questions:dict(),lessons:dict(),claims:dict(),combo:integer(d.combo,5000),best:integer(d.best,5000),boss:d.boss===true};
  for(const [id,q]of Object.entries(d.questions||{}).slice(0,3000))if(validId(id)&&q&&typeof q==='object')b.questions[id]={correct:q.correct===true,review:q.review===true};
  for(const id of Object.keys(d.lessons||{}).slice(0,1000))if(validId(id))b.lessons[id]=true;
  for(const id of ['study','review','theory'])if(d.claims?.[id]===true)b.claims[id]=true;
  s.days[day]=b;
 }
 for(const [id,p]of Object.entries(raw.progress||{}).slice(0,3000))if(validId(id)&&p&&/^\d{4}-\d{2}-\d{2}$/.test(p.due||''))s.progress[id]={box:Math.min(5,integer(p.box,5)),due:p.due};
 for(const id of Object.keys(raw.lessonAwards||{}).slice(0,1000))if(validId(id))s.lessonAwards[id]=true;
 return s;
}
function create(options={}){
 const now=options.now||(()=>new Date()),random=options.random||Math.random,storage=options.storage;let s=fresh(),storageFailed=false;
 try{s=clean(JSON.parse(storage?.getItem(KEY)||'null'));}catch(e){}
 function save(){const badges=new Set(s.badges);if(s.xp>0)badges.add('first');if(Object.keys(s.progress).length>=20||s.migrated>=20)badges.add('twenty');if(s.streak>=3)badges.add('streak3');if(Object.values(s.days).some(d=>d.boss))badges.add('boss');s.badges=[...badges];try{storage?.setItem(KEY,JSON.stringify(s));storageFailed=false;}catch(e){storageFailed=true;}}
 function today(){const day=dayKey(now());if(!s.days[day])s.days[day]={questions:dict(),lessons:dict(),claims:dict(),combo:0,best:0,boss:false};return s.days[day];}
 function active(){const day=dayKey(now());if(s.lastDay!==day){s.streak=s.lastDay===addDays(day,-1)?s.streak+1:1;s.lastDay=day;}const cutoff=addDays(day,-120);for(const k of Object.keys(s.days))if(k<cutoff)delete s.days[k];}
 function view(){
  const d=today(),q=Object.values(d.questions),level=Math.floor(s.xp/100)+1,theme=Math.floor((level-1)/5)%4;
  return {xp:s.xp,coins:s.coins,streak:(s.lastDay===dayKey(now())||s.lastDay===addDays(dayKey(now()),-1))?s.streak:0,level,levelXp:s.xp%100,theme,equipped:s.equipped,owned:s.owned.slice(),migrated:s.migrated,badges:s.badges.slice(),storageFailed,questions:q.length,correct:q.filter(x=>x.correct).length,reviews:q.filter(x=>x.review).length,lessons:Object.keys(d.lessons).length,combo:d.combo,best:d.best,boss:d.boss,claims:{...d.claims},mastered:Object.values(s.progress).filter(p=>p.box>=2).length};
 }
 function seed(records={}){
  if(s.seeded)return 0;let points=0,count=0;
  for(const [id,r]of Object.entries(records)){if(!validId(id)||!r?.attempts)continue;points+=r.correct?8:2;count++;}
  s.xp+=points;s.migrated=count;s.seeded=true;save();return points;
 }
 function answer(id,correct,wasWrong=false){
  if(!validId(String(id)))return {xp:0,coins:0,duplicate:true};
  id=String(id);correct=correct===true;const d=today(),before=view().level,previous=d.questions[id];let xp=0,coins=0;
  if(!previous){d.questions[id]={correct,review:correct&&wasWrong};xp=correct?10:2;if(correct){coins=1;d.combo++;d.best=Math.max(d.best,d.combo);if(d.combo%3===0)xp+=2;}else d.combo=0;}
  else if(correct&&!previous.correct){previous.correct=true;previous.review=true;xp=8;coins=1;}
  const old=s.progress[id]||{box:0,due:dayKey(now())};
  if(!previous||correct&&!previous.correct||!correct){const box=correct?Math.min(5,old.box+1):0;s.progress[id]={box,due:addDays(dayKey(now()),correct?[1,1,3,7,14,30][box]:0)};}
  // A corrected retry still advances the review schedule exactly once.
  if(previous&&correct&&xp>0)s.progress[id]={box:Math.min(5,old.box+1),due:addDays(dayKey(now()),1)};
  s.xp+=xp;s.coins+=coins;active();save();return {xp,coins,correct,duplicate:xp===0,levelUp:view().level>before,level:view().level,combo:d.combo};
 }
 function lesson(id){if(!validId(id))return {xp:0};const d=today();if(d.lessons[id])return {xp:0,duplicate:true};d.lessons[id]=true;const xp=s.lessonAwards[id]?0:15;s.lessonAwards[id]=true;s.xp+=xp;active();save();return {xp};}
 function missions(){const v=view();return [{id:'study',name:'콩나무 20칸 오르기',hint:'서로 다른 기출 20문제 풀기',count:v.questions,target:20,xp:25,coins:8},{id:'review',name:'오답 몬스터 물리치기',hint:'틀렸던 문제 5개 다시 맞히기',count:v.reviews,target:5,xp:20,coins:8},{id:'theory',name:'지식의 물 주기',hint:'이론 1단원 학습완료',count:v.lessons,target:1,xp:10,coins:4}].map(m=>({...m,claimed:!!v.claims[m.id],ready:m.count>=m.target&&!v.claims[m.id]}));}
 function claim(id){const m=missions().find(m=>m.id===id);if(!m?.ready)return {xp:0,coins:0};today().claims[id]=true;s.xp+=m.xp;s.coins+=m.coins;save();return {xp:m.xp,coins:m.coins};}
 function equip(id){const h=HELMETS[id];if(!h)return {ok:false,message:'선택할 수 없는 안전모입니다.'};if(!s.owned.includes(id)){if(s.coins<h.cost)return {ok:false,message:'코인을 조금 더 모아 주세요.'};s.coins-=h.cost;s.owned.push(id);}s.equipped=id;save();return {ok:true,message:h.name+'를 착용했어요.'};}
 function dueIds(){const day=dayKey(now());return Object.keys(s.progress).filter(id=>s.progress[id].due<=day);}
 function plan(bank,mode='daily',records={}){
  const day=today(),due=new Set(dueIds()),eligible=bank.filter(q=>q.answer!=null),shuffled=xs=>{xs=xs.slice();for(let i=xs.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[xs[i],xs[j]]=[xs[j],xs[i]];}return xs;};
  let chosen=[];
  if(mode==='boss'){chosen=shuffled(eligible.filter(q=>records[q.id]?.correct===false||due.has(String(q.id)))).slice(0,5);}
  else{const fresh=eligible.filter(q=>!day.questions[String(q.id)]),pool=fresh.length?fresh:eligible;for(const [i,subject]of SUBJECTS.entries()){const items=shuffled(pool.filter(q=>q.subject===subject));items.sort((a,b)=>Number(due.has(String(b.id)))-Number(due.has(String(a.id))));chosen.push(...items.slice(0,[7,7,6][i]));}if(chosen.length<Math.min(20,pool.length)){const ids=new Set(chosen.map(q=>String(q.id)));chosen.push(...shuffled(pool.filter(q=>!ids.has(String(q.id)))).slice(0,20-chosen.length));}}
  return chosen.sort((a,b)=>SUBJECTS.indexOf(a.subject)-SUBJECTS.indexOf(b.subject)).map(q=>String(q.id));
 }
 function finish(mode,correct,total){const d=today(),won=mode==='boss'&&total>=3&&correct>=Math.ceil(total*.6);let xp=0,coins=0;if(won&&!d.boss){d.boss=true;xp=15;coins=5;s.xp+=xp;s.coins+=coins;save();}return {won,xp,coins};}
 function restore(raw){if(!raw||raw.version!==1)throw new Error('성장 기록 형식이 올바르지 않습니다.');const extra=clean(raw);s.xp=Math.max(s.xp,extra.xp);s.coins=Math.max(s.coins,extra.coins);s.streak=Math.max(s.streak,extra.streak);if(extra.lastDay>s.lastDay)s.lastDay=extra.lastDay;s.badges=[...new Set([...s.badges,...extra.badges])];s.seeded=s.seeded||extra.seeded;s.migrated=Math.max(s.migrated,extra.migrated);s.owned=[...new Set([...s.owned,...extra.owned])];if(s.owned.includes(extra.equipped))s.equipped=extra.equipped;for(const [day,b]of Object.entries(extra.days)){if(!s.days[day])s.days[day]=b;else{const target=s.days[day];for(const [id,q]of Object.entries(b.questions)){const own=target.questions[id];target.questions[id]={correct:q.correct||!!own?.correct,review:q.review||!!own?.review};}Object.assign(target.lessons,b.lessons);Object.assign(target.claims,b.claims);target.boss=target.boss||b.boss;}}for(const [id,p]of Object.entries(extra.progress))if(!s.progress[id]||p.box>s.progress[id].box)s.progress[id]=p;Object.assign(s.lessonAwards,extra.lessonAwards);save();}
 return {view,seed,answer,lesson,missions,claim,equip,dueIds,plan,finish,restore,export:()=>JSON.parse(JSON.stringify(s))};
}
const api={create,dayKey,addDays,HELMETS};root.StudyGardenCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
