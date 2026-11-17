const assert=require('node:assert/strict');
require('../shared-v9/blank-game.js');
const api=globalThis.StudyBlankGame,mem={};
const storage={getItem:k=>mem[k]||null,setItem:(k,v)=>mem[k]=v};
let game=api.create({storage,random:()=>0.4});
function choose(correct=true){
 const s=game.snapshot(),q=api.bank.find(q=>q.id===s.round.ids[s.round.answers.length]);
 const choices=[...game.render().matchAll(/data-blank-choice="(\d+)"[^>]*>([^<]*)<\/button>/g)];
 const choice=choices.find(m=>correct?m[2]===q.answer:m[2]!==q.answer);
 assert.ok(choice);game.handle('answer',null,choice[1]);
}
assert.equal(api.bank.length,36);
for(const subject of ['law','general','corp'])assert.equal(api.bank.filter(q=>q.subject===subject).length,12);
for(const q of api.bank){assert.equal(q.prompt.split('[ ]').length,2);assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.answer));if(q.subject==='law'){assert.ok(q.sourceUrl.startsWith('https://'));assert.equal(q.verifiedAt,'2026-11-17');}}
game.handle('start','law');
assert.equal(game.snapshot().round.ids.length,10);
assert.ok(game.snapshot().round.ids.every(id=>api.bank.find(q=>q.id===id).subject==='law'));
choose(false);
assert.equal(game.snapshot().gameOver,true);assert.equal(game.snapshot().score,0);
assert.ok(game.render().includes('게임 오버'));assert.ok(game.render().includes('최종 점수'));
assert.ok(!game.render().includes('data-blank-action="next"'));
assert.ok(!game.render().includes('class="blank-explanation"'));
game.handle('explain');assert.ok(game.render().includes('class="blank-explanation"'));assert.ok(game.render().includes('공식 법령 원문'));
const before=JSON.stringify(game.snapshot().round.answers);game.handle('answer',null,'0');game.handle('next');
assert.equal(JSON.stringify(game.snapshot().round.answers),before);
game=api.create({storage});assert.equal(game.snapshot().gameOver,true);assert.ok(!game.render().includes('class="blank-explanation"'));
game.handle('retry');assert.equal(game.snapshot().round.ids.length,1);assert.equal(game.snapshot().score,0);
choose();game.handle('next');assert.ok(game.render().includes('빈칸 숲 정복'));
game.handle('start','all');
for(let i=0;i<3;i++){choose();game.handle('next');}
choose(false);assert.equal(game.snapshot().score,360);assert.equal(game.snapshot().correct,3);
game=api.create({storage});assert.equal(game.snapshot().score,360);assert.equal(game.snapshot().gameOver,true);
game.handle('start','general');
for(let i=0;i<10;i++){choose();const score=game.snapshot().score;game.handle('answer',null,'0');assert.equal(game.snapshot().score,score);game=api.create({storage});assert.equal(game.snapshot().pending,true);game.handle('next');}
assert.equal(game.snapshot().score,1600);assert.equal(game.snapshot().gameOver,false);assert.ok(game.render().includes('빈칸 숲 정복'));
game.handle('start','corp');game.handle('skip');assert.equal(game.snapshot().gameOver,true);assert.equal(game.snapshot().score,0);assert.ok(game.render().includes('건너뛰어'));
assert.equal(game.snapshot().best,1600);
const safe=api.create({storage:{getItem:()=>'{',setItem:()=>{throw Error('blocked');}}});safe.handle('start','all');safe.handle('skip');assert.equal(safe.snapshot().gameOver,true);assert.ok(safe.render().includes('저장하지 못했습니다'));
console.log('36 bank entries; immediate game over, final score, duplicate guard, hidden explanations, law filter, retry, success, skip, resume and storage failure passed.');
