const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function load(key){return fs.readFileSync(path.join(__dirname,'..',key.replace(/^game(?:New|Source):/,'')),'utf8');}
async function integrationTest(layout,withGarden=true){
 const data={'jidosa-study-v9':JSON.stringify({records:{'2026-1':{attempts:2,correct:false,note:'기존 메모',starred:true}},lessonDone:{},videoDone:{}})},storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v};
 let html='',click;const errors=[],classes=new Set(),element={classList:{add(){},remove(){},toggle(){}},textContent:'',value:'',focus(){},setSelectionRange(){},showModal(){},close(){}},main={get innerHTML(){return html;},set innerHTML(v){html=v;}};
 const document={body:{dataset:{layout},classList:{add:x=>classes.add(x)}},querySelector:s=>s==='#main'?main:element,querySelectorAll:()=>[],addEventListener:(type,fn)=>{if(type==='click')click=fn;}};
 const window={addEventListener(){},scrollTo(){},STUDY_HISTORY_READY:Promise.resolve(null),STUDY_COURSE:{title:'기존 과정',questions:Array.from({length:90},(_,i)=>({id:'2026-'+(i+1),year:2026,no:i+1,subject:['law','general','corp'][Math.floor(i/30)],text:'실제 과정과 같은 5지선다 형식의 테스트 문항',options:['선택지1','선택지2','선택지3','선택지4','선택지5'],answer:1,explanation:'정답해설\n근거 설명을 그대로 유지합니다.\n오답분석\n각 선지의 이유를 설명합니다.'})),theory:{law:[{title:'안전보건교육',body:'관련 법과 시행령, 시행규칙 본문',trap:'주체와 교육시간 구별'}],general:[],corp:[]},videos:[]}};
 const root={};new Function('globalThis','module',load('gameSource:shared-v9/core.js'))(root,{exports:{}});
 if(withGarden){new Function('globalThis','module',load('gameNew:shared-v9/garden-core.js'))(root,{exports:{}});new Function('globalThis','module',load('gameNew:shared-v9/garden-ui.js'))(root,{exports:{}});window.StudyGarden=root.StudyGarden;}
 await new Function('window','StudyCore','document','localStorage','indexedDB','navigator','location','console','setTimeout','clearTimeout','return '+load('gameNew:shared-v9/app.js'))(window,root.StudyCore,document,storage,{open(){throw new Error('test no IndexedDB')}},{},{protocol:'https:'},{error:e=>errors.push(String(e))},()=>0,()=>{});
 function assert(c,m){if(!c)throw new Error(layout+': '+m);}
 async function press(dataset){await click({target:{closest:()=>({dataset,disabled:false})}});assert(!errors.length,errors.join(';'));}
 const state=()=>JSON.parse(data['jidosa-garden-v1']||'null');
 if(layout==='pc'||!withGarden){assert(html.includes('나만의 공부 공간')&&!html.includes('마스터의 합격 콩나무'),'legacy home fallback');await press({question:'2026-1'});await press({choice:'1'});await press({action:'grade'});assert(html.includes('정답입니다'),'legacy grading');assert(!state(),'desktop does not award growth');return {layout,withGarden,result:'passed'};}
 assert(html.includes('마스터의 합격 콩나무'),'game home mounted');assert(classes.has('garden-enabled'),'game style enabled');
 await press({gameAction:'daily'});assert(html.includes('1 / 20문제'),'quest HUD');assert(!html.includes('garden-reward '),'no reward before grading');
 await press({action:'next-question'});assert(html.includes('1 / 20문제'),'unanswered question cannot skip quest');
 await press({choice:'2'});await press({action:'grade'});let xp=state().xp;assert(html.includes('+2 XP'),'wrong answer gets encouragement');assert(html.includes('선택지5'),'five choices preserved');
 await press({action:'grade'});assert(state().xp===xp,'double grade cannot award twice');
 await press({action:'retry'});await press({choice:'1'});await press({action:'grade'});assert(state().xp===xp+8,'correcting wrong answer awards only remaining points');
 xp=state().xp;await press({action:'retry'});await press({choice:'1'});await press({action:'grade'});assert(state().xp===xp,'correct answer retry has no duplicate XP');
 const subjects=[];
 for(let i=1;i<20;i++){await press({action:'next-question'});subjects.push(html.includes('산업안전보건법령')?'law':html.includes('산업안전일반')?'general':'corp');await press({choice:'1'});await press({action:'grade'});}
 await press({action:'next-question'});assert(html.includes('오늘도 콩나무가 자랐어요!'),'quest completion screen');assert(html.includes('95%'),'first attempt accuracy retained despite retry');
 await press({gameAction:'home'});assert(html.includes('20 / 20'),'daily mission progress');
 xp=state().xp;await press({gameAction:'claim',mission:'study'});assert(state().xp===xp+25,'mission reward granted');await press({gameAction:'claim',mission:'study'});assert(state().xp===xp+25,'mission cannot double claim');
 const coins=state().coins;await press({gameAction:'equip',helmet:'sun'});assert(state().equipped==='sun'&&state().coins===coins-24,'helmet purchase and equipment');
 await press({gameAction:'equip',helmet:'sun'});assert(state().coins===coins-24,'owned helmet is not charged again');
 await press({lesson:'0',lessonSubject:'law'});assert(html.includes('관련 법과 시행령'),'original theory preserved');await press({action:'lesson-done'});xp=state().xp;await press({action:'lesson-done'});await press({action:'lesson-done'});assert(state().xp===xp,'lesson toggle cannot farm XP');
 assert(JSON.parse(data['jidosa-study-v9']).records['2026-1'].note==='기존 메모','existing notes retained');
 return {layout,withGarden,result:'passed',xp:state().xp};
}
function modelTests(){
 const root={};new Function('globalThis','module',load('gameNew:shared-v9/garden-core.js'))(root,{exports:{}});
 const G=root.StudyGardenCore;let saved=null,clock=new Date('2026-11-17T00:00:00Z');
 const storage={getItem:()=>saved,setItem:(k,v)=>saved=v},g=G.create({storage,now:()=>clock,random:()=>.4});
 assert.equal(g.answer('one',false).xp,2);assert.equal(g.answer('one',false).xp,0);
 assert.equal(g.answer('one',true).xp,8);assert.equal(g.answer('one',true).xp,0);
 assert.equal(g.view().questions,1);assert.equal(g.view().reviews,1);
 assert.equal(g.export().progress.one.due,'2026-11-18');
 for(let i=2;i<=20;i++)g.answer('q'+i,true);
 assert.ok(g.missions()[0].ready);assert.equal(g.claim('study').xp,25);assert.equal(g.claim('study').xp,0);
 g.lesson('law-0');assert.equal(g.lesson('law-0').xp,0);
 const before=g.view().coins;assert.equal(g.equip('night').ok,false);assert.equal(g.view().coins,before);
 assert.equal(G.create({storage,now:()=>clock}).view().xp,g.view().xp);
 clock=new Date('2026-11-18T00:00:00Z');g.answer('one',true);
 assert.equal(g.view().streak,2);assert.equal(g.view().questions,1);assert.equal(g.export().progress.one.due,'2026-11-21');
 clock=new Date('2026-11-20T00:00:00Z');assert.equal(g.view().streak,0);g.lesson('law-1');assert.equal(g.view().streak,1);assert.ok(g.view().badges.includes('twenty'));
 assert.equal(g.answer('__proto__',true).xp,0);
 const bank=Array.from({length:90},(_,i)=>({id:'b'+i,subject:['law','general','corp'][Math.floor(i/30)],answer:1}));
 const plan=g.plan(bank);assert.equal(plan.length,20);assert.equal(new Set(plan).size,20);
 assert.ok(plan.slice(0,7).every(id=>bank.find(q=>q.id===id).subject==='law'));
 assert.ok(plan.slice(7,14).every(id=>bank.find(q=>q.id===id).subject==='general'));
 assert.equal(g.finish('boss',5,5).xp,15);assert.equal(g.finish('boss',5,5).xp,0);assert.ok(g.view().badges.includes('boss'));
 const backup=g.export(),xp=g.view().xp;g.restore(backup);g.restore(backup);assert.equal(g.view().xp,xp);assert.equal(g.claim('study').xp,0);
 assert.equal(G.dayKey(new Date('2026-11-17T15:01:00Z')),'2026-11-18');
 return 'growth, mission, review spacing, streak, backup and shop invariants passed';
}
(async()=>{console.log(modelTests());console.log(await integrationTest('mobile'));console.log(await integrationTest('pc'));console.log(await integrationTest('mobile',false));})().catch(e=>{console.error(e);process.exitCode=1;});
