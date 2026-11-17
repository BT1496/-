const assert=require('node:assert/strict');
require('../shared-v9/blank-game.js');
const api=globalThis.StudyBlankGame,mem={};
const storage={getItem:k=>mem[k]||null,setItem:(k,v)=>mem[k]=v};
let game=api.create({storage,random:()=>0.4});
for(const q of api.bank){assert.equal(q.prompt.split('[ ]').length,2);assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.answer));}
game.handle('start','general');
assert.equal(game.snapshot().round.ids.length,10);
for(let i=0;i<10;i++){
 const q=api.bank.find(q=>q.id===game.snapshot().round.ids[i]);
 assert.equal(q.subject,'general');
 const choices=[...game.render().matchAll(/data-blank-choice="(\d+)"[^>]*>([^<]*)<\/button>/g)];
 const choice=choices.find(m=>m[2]===q.answer)[1];
 game.handle('answer',null,choice);
 const score=game.snapshot().score;
 game.handle('answer',null,choice);assert.equal(game.snapshot().score,score);
 assert.ok(!game.render().includes('class="blank-explanation"'));
 game=api.create({storage});assert.equal(game.snapshot().pending,true);
 game.handle('explain');assert.ok(game.render().includes('class="blank-explanation"'));
 game.handle('next');
}
assert.equal(game.snapshot().score,1600);assert.equal(game.snapshot().correct,10);
assert.ok(game.render().includes('빈칸 숲 정복'));
game.handle('start','corp');
for(let i=0;i<10;i++){game.handle('skip');game.handle('next');}
assert.equal(game.snapshot().score,0);game.handle('retry');
assert.equal(game.snapshot().round.review,true);assert.equal(game.snapshot().round.ids.length,10);
game.handle('skip');game.handle('next');game=api.create({storage});
assert.equal(game.snapshot().pending,false);assert.equal(game.snapshot().round.answers.length,1);
console.log('Blank game: bank, round, scoring, duplicate guard, explanation, resume and retry passed.');
