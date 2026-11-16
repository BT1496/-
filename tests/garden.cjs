const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function load(key){return fs.readFileSync(path.join(__dirname,'..',key.replace(/^game(?:New|Source):/,'')),'utf8');}
async function integrationTest(layout,withGarden=true){
 const data={'jidosa-study-v9':JSON.stringify({records:{'2026-1':{attempts:2,correct:false,note:'기존 메모',starred:true}},lessonDone:{},videoDone:{}})},storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v};
 let html='',click;const errors=[],classes=new Set(),frames=[],element={classList:{add(){},remove(){},toggle(){}},textContent:'',value:'',focus(){},setSelectionRange(){},showModal(){},close(){}},main={get innerHTML(){return html;},set innerHTML(v){html=v;}};
 const document={body:{dataset:{layout},classList:{add:x=>classes.add(x)}},querySelector:s=>s==='#main'?main:element,querySelectorAll:()=>[],addEventListener:(type,fn)=>{if(type==='click')click=fn;}};
 const window={addEventListener(){},scrollTo(){},STUDY_HISTORY_READY:Promise.resolve(null),STUDY_COURSE:{title:'기존 과정',questions:Array.from({length:90},(_,i)=>({id:'2026-'+(i+1),year:2026,no:i+1,subject:['law','general','corp'][Math.floor(i/30)],text:'실제 과정과 같은 5지선다 형식의 테스트 문항',options:['선택지1','선택지2','선택지3','선택지4','선택지5'],answer:1,explanation:'정답해설\n근거 설명을 그대로 유지합니다.\n오답분석\n각 선지의 이유를 설명합니다.'})),theory:{law:[{title:'안전보건교육',body:'관련 법과 시행령, 시행규칙 본문',trap:'주체와 교육시간 구별'}],general:[],corp:[]},videos:[]}};
 const root={};new Function('globalThis','module',load('gameSource:shared-v9/core.js'))(root,{exports:{}});
 if(withGarden){new Function('globalThis','module',load('gameNew:shared-v9/garden-core.js'))(root,{exports:{}});new Function('globalThis','module',load('gameNew:shared-v9/garden-ui.js'))(root,{exports:{}});window.StudyGarden=root.StudyGarden;window.StudyGarden3D={mount:(host,state)=>frames.push(state.climb)};}
 await new Function('window','StudyCore','document','localStorage','indexedDB','navigator','location','console','setTimeout','clearTimeout','return '+load('gameNew:shared-v9/app.js'))(window,root.StudyCore,document,storage,{open(){throw new Error('test no IndexedDB')}},{},{protocol:'https:'},{error:e=>errors.push(String(e))},()=>0,()=>{});
 function assert(c,m){if(!c)throw new Error(layout+': '+m);}
 async function press(dataset){await click({target:{closest:()=>({dataset,disabled:false})}});assert(!errors.length,errors.join(';'));}
 const state=()=>JSON.parse(data['jidosa-garden-v1']||'null');
 if(layout==='pc'||!withGarden){assert(html.includes('나만의 공부 공간')&&!html.includes('마스터의 합격 콩나무'),'legacy home fallback');await press({question:'2026-1'});await press({choice:'1'});await press({action:'grade'});assert(html.includes('정답입니다'),'legacy grading');assert(!state(),'desktop does not award growth');return {layout,withGarden,result:'passed'};}
 assert(html.includes('마스터의 합격 콩나무'),'game home mounted');assert(classes.has('garden-enabled'),'game style enabled');
 await press({gameAction:'daily'});assert(html.includes('1 / 60문제'),'quest HUD');assert(!html.includes('garden-reward '),'no reward before grading');
 await press({action:'next-question'});assert(html.includes('1 / 60문제'),'unanswered question cannot skip quest');
 await press({choice:'2'});await press({action:'grade'});let xp=state().xp;const originalHeight=state().climb;assert(frames.length>0,'3D scene receives growth state');assert(html.includes('data-garden-3d'),'3D scene mounted in question view');assert(html.includes('+2 XP'),'wrong answer gets encouragement');assert(html.includes('선택지5'),'five choices preserved');
 await press({action:'grade'});assert(state().xp===xp,'double grade cannot award twice');
 await press({action:'retry'});await press({choice:'1'});await press({action:'grade'});assert(state().xp===xp+8,'correcting wrong answer awards only remaining points');assert(state().climb===originalHeight+1,'correct answer advances one 3D platform');
 xp=state().xp;await press({action:'retry'});await press({choice:'1'});await press({action:'grade'});assert(state().xp===xp,'correct answer retry has no duplicate XP');assert(state().climb===originalHeight+1,'repeated answer cannot farm altitude');
 const subjects=['law'];
 for(let i=1;i<60;i++){await press({action:'next-question'});const metadata=html.match(/<div class="metadata">([\s\S]*?)<\/div>/)?.[1]||'';subjects.push(metadata.includes('산업안전보건법령')?'law':metadata.includes('산업안전일반')?'general':'corp');await press({choice:'1'});await press({action:'grade'});}
 assert(subjects.length===60&&subjects.slice(0,20).every(x=>x==='law')&&subjects.slice(20,40).every(x=>x==='general')&&subjects.slice(40).every(x=>x==='corp'),'exact 20 questions per subject in 1 to 3 order');await press({action:'next-question'});assert(html.includes('오늘도 콩나무가 자랐어요!'),'quest completion screen');assert(html.includes('98%'),'first attempt accuracy retained despite retry');
 await press({gameAction:'home'});assert(html.includes('60 / 60'),'daily mission progress');
 xp=state().xp;await press({gameAction:'claim',mission:'study60'});assert(state().xp===xp+75,'mission reward granted');await press({gameAction:'claim',mission:'study60'});assert(state().xp===xp+75,'mission cannot double claim');
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
 assert.equal(g.answer('one',false,false,'law').xp,2);assert.equal(g.answer('one',false,false,'law').xp,0);
 assert.equal(g.answer('one',true,false,'law').xp,8);assert.equal(g.answer('one',true,false,'law').xp,0);
 assert.equal(g.view().questions,1);assert.equal(g.view().reviews,1);
 assert.equal(g.export().progress.one.due,'2026-11-18');
 for(let i=2;i<=60;i++)g.answer('q'+i,true,false,['law','general','corp'][Math.floor((i-1)/20)]);
 assert.ok(g.missions()[0].ready);assert.equal(g.claim('study60').xp,75);assert.equal(g.claim('study60').xp,0);
 g.lesson('law-0');assert.equal(g.lesson('law-0').xp,0);
 const poor=G.create({now:()=>clock});const before=poor.view().coins;assert.equal(poor.equip('night').ok,false);assert.equal(poor.view().coins,before);
 assert.equal(G.create({storage,now:()=>clock}).view().xp,g.view().xp);
 clock=new Date('2026-11-18T00:00:00Z');g.answer('one',true,false,'law');
 assert.equal(g.view().streak,2);assert.equal(g.view().questions,1);assert.equal(g.export().progress.one.due,'2026-11-21');
 clock=new Date('2026-11-20T00:00:00Z');assert.equal(g.view().streak,0);g.lesson('law-1');assert.equal(g.view().streak,1);assert.ok(g.view().badges.includes('twenty'));
 assert.equal(g.answer('__proto__',true).xp,0);
 const bank=Array.from({length:90},(_,i)=>({id:'b'+i,subject:['law','general','corp'][Math.floor(i/30)],answer:1}));
 const plan=g.plan(bank);assert.equal(plan.length,60);assert.equal(new Set(plan).size,60);
 assert.ok(plan.slice(0,20).every(id=>bank.find(q=>q.id===id).subject==='law'));
 assert.ok(plan.slice(20,40).every(id=>bank.find(q=>q.id===id).subject==='general'));
 assert.equal(g.finish('boss',5,5).xp,15);assert.equal(g.finish('boss',5,5).xp,0);assert.ok(g.view().badges.includes('boss'));
 const backup=g.export(),xp=g.view().xp;g.restore(backup);g.restore(backup);assert.equal(g.view().xp,xp);assert.equal(g.claim('study60').xp,0);
 const partial=G.create({now:()=>clock,random:()=>.4});for(let i=0;i<7;i++)partial.answer('b'+i,true,false,'law');const remaining=partial.plan(bank);assert.equal(remaining.length,53);assert.equal(remaining.filter(id=>bank.find(q=>q.id===id).subject==='law').length,13);
 const unbalanced=G.create({now:()=>clock});for(let i=0;i<60;i++)unbalanced.answer('law-only-'+i,true,false,'law');assert.equal(unbalanced.missions()[0].count,20);assert.equal(unbalanced.missions()[0].ready,false);
 const legacy=G.create({storage:{getItem:()=>JSON.stringify({version:1,seeded:true,days:{'2026-11-20':{questions:{b0:{correct:true}},claims:{study:true}}}}),setItem(){ }},now:()=>clock});legacy.syncSubjects(bank);assert.equal(legacy.view().subjectCounts.law,1);assert.equal(legacy.missions()[0].claimed,false);
 const oldHeight=g.view().climb;g.answer('3d-test',false,false,'law');assert.equal(g.view().climb,oldHeight);g.answer('3d-test',true,true,'law');assert.equal(g.view().climb,oldHeight+1);g.answer('3d-test',true,true,'law');assert.equal(g.view().climb,oldHeight+1);
 assert.equal(G.dayKey(new Date('2026-11-17T15:01:00Z')),'2026-11-18');
 return 'growth, mission, review spacing, streak, backup and shop invariants passed';
}
(async()=>{console.log(rendererTests(load('gameNew:shared-v9/garden-3d.js')));console.log(modelTests());console.log(await integrationTest('mobile'));console.log(await integrationTest('pc'));console.log(await integrationTest('mobile',false));})().catch(e=>{console.error(e);process.exitCode=1;});

function rendererTests(source){
 const root={};new Function('globalThis','module',source)(root,{exports:{}});const R=root.StudyGarden3D,checks=[];
 function ok(v,name){if(!v)throw new Error(name);checks.push(name);}
 const near=(a,b)=>Math.abs(a-b)<1e-6,vec=(m,v)=>[0,1,2,3].map(r=>v.reduce((s,x,c)=>s+m[c*4+r]*x,0));
 ok(R.math.multiply(R.math.identity(),R.math.model(1,2,3,1,1,1)).every((x,i)=>near(x,R.math.model(1,2,3,1,1,1)[i])),'column-major matrix composition');
 const vp=R.math.multiply(R.math.perspective(.72,1,.1,50),R.math.lookAt([0,0,5],[0,0,0])),center=vec(vp,[0,0,0,1]);ok(near(center[0],0)&&near(center[1],0)&&center[3]>0,'perspective camera projects target in front');
 ok(R.math.pose(9,10,0).every((x,i)=>near(x,R.math.point(9)[i])),'jump starts on old platform');
 ok(R.math.pose(9,10,1).every((x,i)=>near(x,R.math.point(10)[i])),'jump lands on next platform');
 ok(R.math.pose(9,10,.5)[1]>(R.math.point(9)[1]+R.math.point(10)[1])/2,'jump has a visible arc');
 ok(R.math.pose(9,9,.5).every((x,i)=>near(x,R.math.point(9)[i])),'unchanged altitude does not jump');
 for(const [name,[positions,normals]]of Object.entries(R.meshes()))ok(positions.length===normals.length&&positions.length%9===0&&positions.every(Number.isFinite)&&normals.every(Number.isFinite),'valid 3D mesh '+name);
 let draws=0,matrices=0;
 const gl={};for(const [i,k]of ['VERTEX_SHADER','FRAGMENT_SHADER','COMPILE_STATUS','LINK_STATUS','ARRAY_BUFFER','STATIC_DRAW','DEPTH_TEST','CULL_FACE','FLOAT','TRIANGLES','COLOR_BUFFER_BIT','DEPTH_BUFFER_BIT'].entries())gl[k]=i+1;
 for(const name of ['createShader','createProgram','createBuffer'])gl[name]=()=>({});
 for(const name of ['shaderSource','compileShader','attachShader','linkProgram','useProgram','bindBuffer','bufferData','enable','disable','viewport','clearColor','clear','enableVertexAttribArray','vertexAttribPointer'])gl[name]=()=>{};
 gl.getShaderParameter=gl.getProgramParameter=()=>true;gl.getAttribLocation=()=>0;gl.getUniformLocation=(p,n)=>n;
 gl.uniformMatrix4fv=(u,t,m)=>{if(m.length!==16||!Array.from(m).every(Number.isFinite))throw new Error('invalid 4D transform');matrices++;};
 gl.uniformMatrix3fv=(u,t,m)=>{if(m.length!==9||!Array.from(m).every(Number.isFinite))throw new Error('invalid normal transform');};
 gl.uniform3fv=(u,c)=>{if(!Array.from(c).every(Number.isFinite))throw new Error('invalid color');};
 gl.drawArrays=(mode,start,count)=>{if(count%3||count<3)throw new Error('invalid triangles');draws++;};
 const frame=R.painter(gl);for(const height of [0,1,10,10000])frame({from:Math.max(0,height-1),to:height,phase:.5,yaw:0,time:550,theme:height%4,helmet:'#59b88d',width:640,height:420});
 ok(draws>150&&matrices>150,'WebGL renders depth-tested platforms, tree and character with finite transforms');

 const runtime={document:{createElement(){runtime.created++;return {width:0,height:0,setAttribute(){},addEventListener(){},getContext(){runtime.contexts++;return gl;}};}},created:0,contexts:0,performance:{now:()=>0},addEventListener(){},requestAnimationFrame(fn){runtime.frames.push(fn);return runtime.frames.length;},cancelAnimationFrame(){},frames:[]};
 new Function('globalThis','module',source)(runtime,{exports:{}});
 const host=()=>({dataset:{},isConnected:true,replaceChildren(){},getBoundingClientRect:()=>({width:360,height:190})}),a=host(),b=host();
 runtime.StudyGarden3D.mount(a,{climb:0,equipped:'mint'});runtime.frames[0](10);
 runtime.StudyGarden3D.mount(b,{climb:1,equipped:'sun'});runtime.frames[1](550);
 ok(runtime.created===1&&runtime.contexts===1,'one canvas and WebGL context reused across app rerenders');
 ok(b.dataset.jumping==='true','correct answer starts visible jump animation');
 runtime.frames[runtime.frames.length-1](1300);ok(b.dataset.jumping==='false','jump settles after landing');
 runtime.StudyGarden3D.mount(null,{});
 const fallbackRoot={document:{createElement:()=>({setAttribute(){},addEventListener(){},getContext:()=>null})},performance:{now:()=>0},addEventListener(){}};
 new Function('globalThis','module',source)(fallbackRoot,{exports:{}});const fallbackHost={innerHTML:''};fallbackRoot.StudyGarden3D.mount(fallbackHost,{climb:3,equipped:'mint'});ok(fallbackHost.innerHTML.includes('간편 3D 모드')&&fallbackHost.innerHTML.includes('3칸'),'unsupported WebGL has working 3D fallback');

 return checks;
}
