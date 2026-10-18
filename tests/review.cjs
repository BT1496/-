const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
async function run(layout,imported=false,legacy=false){
 let html='',click;const errors=[],storage={};
 const element={classList:{add(){},remove(){},toggle(){}},textContent:'',value:'',focus(){},setSelectionRange(){},showModal(){},close(){}};
 const main={get innerHTML(){return html},set innerHTML(v){html=v}};
 const document={body:{dataset:{layout},classList:{add(){}}},querySelector:s=>s==='#main'?main:element,querySelectorAll:()=>[],addEventListener:(t,f)=>{if(t==='click')click=f}};
 const localStorage={getItem:()=>JSON.stringify({records:{'2025-1':{attempts:3,correct:false,note:'기존 메모',starred:true}},lessonDone:{'law-3':true},videoDone:{GPXlYZoTpDM:true}}),setItem:(k,v)=>storage[k]=v};
 const saved=imported?{title:'오래된 개인자료',questions:[{id:'2014-7',year:2014,no:7,subject:'law',text:'옛 자료',answer:[1,2,3,4,5],options:['1','2','3','4','5'],explanation:'옛 해설',sourceKind:'textbook',explanationImages:legacy?['data:image/png;base64,YQ==']:[],...(legacy?{}:{textbookExplanationImages:['data:image/png;base64,YQ==']})}]}:null;
 const indexedDB={open(){const req={};queueMicrotask(()=>{req.result={transaction(){return {objectStore(){return {get(){const r={};queueMicrotask(()=>{r.result=saved;r.onsuccess()});return r}}}}}};req.onsuccess()});return req}};
 const ctx={window:{addEventListener(){},scrollTo(){}},document,localStorage,indexedDB,navigator:{},location:{protocol:'http:'},console:{error:e=>errors.push(String(e))},setTimeout,clearTimeout,Blob,Response,DecompressionStream,Uint8Array,atob,Map,Set,Date,URL};vm.createContext(ctx);
 for(const file of ['core.js','course.js','laws.js','history.js','annexes.js'])vm.runInContext(fs.readFileSync(path.join(root,'shared-v9',file),'utf8'),ctx);
 const history=await ctx.window.STUDY_HISTORY_READY;
 assert.equal(Object.keys(history.patches).length,459);assert.equal(Object.keys(history.theoryPatches.law).length,53);
 for(let y=2013;y<=2026;y++){const qs=[...history.history,...ctx.window.STUDY_COURSE.questions].filter(q=>q.year===y);assert.equal(qs.length,75);assert.equal(qs.filter(q=>q.subject==='law'&&history.patches[q.id]?.lawReview==='verified').length,25)}
 for(const [id,p]of Object.entries(history.patches)){assert.ok(p.references,id);assert.ok(p.explanation?.length>60,id);assert.equal(p.explanationImages.length,0,id);if(p.options)assert.equal(p.options.length,5,id);if(!id.startsWith('2026-'))assert.equal((p.questionImages||[]).length,0,id);if(p.lawAdapted)assert.ok(p.originalAnswer!=null,id);}
 assert.equal(history.patches['2014-7'].answer,2);assert.equal(history.patches['2023-7'].answer,5);assert.equal(history.patches['2014-7'].originalAnswer.length,5);assert.deepEqual([...history.patches['2014-72'].answer],[1,4]);assert.match(history.patches['2026-24'].options[0],/第56|제56조제5항/);assert.match(history.patches['2016-3'].text,/제57조제3항/);assert.match(history.patches['2018-2'].text,/제57조제3항/);assert.match(history.patches['2022-36'].options.join(' '),/시작하기 전|작업.*전/);assert.match(history.patches['2023-71'].references,/2026-산업안전보건연구원-127/);
 const app=fs.readFileSync(path.join(root,'shared-v9/app.js'),'utf8');await vm.runInContext(app,ctx);
 assert.match(html,/1,050|1050/);assert.ok(!errors.length,errors.join('\n'));
 async function press(dataset){await click({target:{closest:()=>({dataset,disabled:false})}});assert.ok(!errors.length,errors.join('\n'));return html}
 await press({question:'2014-7'});assert.doesNotMatch(html,/옛 자료|옛 해설/);assert.doesNotMatch(html,/<details[^>]*open/);assert.ok(!html.includes('<summary>2026년 기준 풀이·해설 보기</summary>'));assert.ok(!html.includes('data:image/png;base64,YQ=='));
 await press({choice:'1'});await press({action:'grade'});assert.match(html,/<span class="answer-num">②<\/span>/);assert.match(html,/<details class="disclosure"><summary>2026년 기준 풀이·해설 보기/);assert.doesNotMatch(html,/<details[^>]*open/);assert.doesNotMatch(html,/판단 옳음|판단 틀림/);
 assert.match(html,/<summary>개인교재 원본 해설 보기/);if(imported){assert.match(html,/data:image\/png;base64,YQ==/);assert.match(html,/교재 원본의 문제·정답/)}
 await press({action:'retry'});await press({choice:'2'});await press({action:'grade'});assert.match(html,/정답입니다/);assert.doesNotMatch(html,/<details[^>]*open/);
 await press({question:'2025-20'});assert.match(html,/<table/);assert.match(html,/ㄱ: 2/);assert.match(html,/같은 대표 근거조문/);
 await press({lesson:'3',lessonSubject:'law'});assert.match(html,/제37조의4/);assert.match(html,/최초로 작업을 시작하기 전까지/);
 await press({lesson:'4',lessonSubject:'law'});assert.match(html,/산업안전보건법 시행령/);assert.match(html,/data-annex-host="enforcement-rule-4"/);assert.match(html,/data-annex-host="enforcement-rule-5"/);assert.doesNotMatch(html,/별표·별지는 공식 원문 확인/);
 await press({lesson:'40',lessonSubject:'law'});assert.match(html,/data-annex-host="enforcement-rule-24"/);assert.match(html,/특수건강진단의 시기 및 주기/);
 await press({lesson:'26',lessonSubject:'law'});assert.match(html,/data-annex-host="safety-standards-18"/);
 await press({nav:'laws'});assert.match(html,/459/);assert.match(html,/2027년 1월 1일/);assert.match(html,/2028년 1월 1일/);await press({law:'law'});assert.match(html,/제117조/);assert.match(html,/제36조/);
 await press({nav:'videos'});assert.equal((html.match(/class="caption">도사 안땅 ·/g)||[]).length,23);assert.match(html,/안전25시/);
 await press({question:'2025-1'});assert.match(html,/기존 메모/);
 assert.ok(!errors.length);console.log(layout+(imported?' with stale private import':'')+': passed');
}
(async()=>{await run('pc');await run('mobile');await run('mobile',true);await run('pc',true,true)})().catch(e=>{console.error(e);process.exit(1)});

const C=require('../shared-v9/core.js');assert.throws(()=>C.validateCourse({questions:[{id:'bad',year:2025,no:1,subject:'law',textbookExplanationImages:['javascript:alert(1)']}]}));
