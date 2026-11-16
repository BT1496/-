(function gardenUI(root){
'use strict';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const worlds=[{name:'새싹 들판',sky:'#e9f7e4',glow:'#fff0aa',ink:'#25644c'},{name:'초록 숲',sky:'#d8efdf',glow:'#dcf49a',ink:'#24594a'},{name:'구름 정원',sky:'#e3edfd',glow:'#fff3b5',ink:'#4666a0'},{name:'별빛 하늘',sky:'#293a59',glow:'#e2dcff',ink:'#d8d9fa'}];
const labels={law:'산업안전보건법령',general:'산업안전일반',corp:'기업진단·지도'};
function mascot(color='#59b88d',label='콩나무 모험가'){
 return `<svg viewBox="0 0 80 96" role="img" aria-label="${escape(label)}"><path d="M25 78v9m30-9v9" fill="none" stroke="#284b40" stroke-width="8" stroke-linecap="round"/><path d="M15 56 7 65m58-9 8 7" stroke="#284b40" stroke-width="7" stroke-linecap="round"/><rect x="17" y="31" width="46" height="51" rx="19" fill="#f6f4ce" stroke="#284b40" stroke-width="3"/><path d="M40 30c-6-14-19-13-19-13 0 14 12 19 19 13m0 0c3-15 19-18 19-18 0 14-9 22-19 18" fill="#74bc67" stroke="#284b40" stroke-width="2"/><path d="M12 32a28 28 0 0 1 56 0v8H12z" fill="${color}" stroke="#284b40" stroke-width="3"/><path d="M40 8v21M9 40h62" stroke="#284b40" stroke-width="4" stroke-linecap="round"/><rect x="22" y="45" width="36" height="14" rx="7" fill="#fff" stroke="#284b40" stroke-width="2"/><path d="M30 50v3m20-3v3" stroke="#284b40" stroke-width="3" stroke-linecap="round"/><path d="M34 66q6 7 12 0" stroke="#284b40" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M23 76h34" stroke="${color}" stroke-width="9"/></svg>`;
}
function scene(v){
 const w=worlds[v.theme],height=40+(v.xp%500)/500*170,x=180+Math.sin(height/35)*27,y=254-height;
 let leaves='';
 for(let i=0;i<8;i++){const yy=266-i*27,xx=180+Math.sin(i*1.4)*12;leaves+=`<path d="M${xx} ${yy}q${i%2?55:-55} -38 ${i%2?64:-64} -13q${i%2?-30:30} 25 ${i%2?-64:64} 13" fill="${i%2?'#7dbb76':'#a4ce7d'}" stroke="#50855e" stroke-width="1.4"/>`;}
 return `<svg class="garden-scene" viewBox="0 0 360 300" role="img" aria-label="공부한 만큼 자라는 콩나무. 현재 레벨 ${v.level}">
 <rect width="360" height="300" rx="24" fill="${w.sky}"/><circle cx="296" cy="47" r="27" fill="${w.glow}"/><g fill="#fff" opacity=".8"><path d="M20 70c-9-16 15-25 25-13 11-24 40-13 37 4 22-4 29 19 9 21H20z"/><path d="M235 121c-9-15 9-23 20-14 6-17 29-13 31 1 22-9 29 15 15 20h-65z"/></g>
 ${v.theme===3?'<g fill="#fff5be"><path d="m70 28 3 7 8 2-8 3-3 8-3-8-8-3 8-2z"/><circle cx="282" cy="202" r="2"/><circle cx="98" cy="116" r="2"/></g>':''}
 <path d="M181 288c-38-38 36-63 0-96s-28-54 0-79 15-43 0-63" stroke="#467c55" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M179 285c-38-38 36-63 0-96s-28-54 0-79 15-43 0-63" stroke="#a9cf79" stroke-width="8" fill="none" stroke-linecap="round"/>${leaves}
 <g fill="#fff" stroke="#b8d4b4"><rect x="27" y="173" width="78" height="30" rx="15"/><rect x="253" y="78" width="80" height="30" rx="15"/></g><g fill="#50735d" font-size="11" font-family="system-ui" text-anchor="middle"><text x="66" y="192">한 문제, 한 칸</text><text x="293" y="97">다음은 구름!</text></g>
 <ellipse cx="180" cy="291" rx="117" ry="25" fill="#a9c794"/><g class="garden-explorer" transform="translate(${x-31},${y-60}) scale(.78)">${mascot(root.StudyGardenCore.HELMETS[v.equipped].color).replace(/<svg[^>]*>|<\/svg>/g,'')}</g>
 <g fill="${w.ink}" font-family="system-ui"><text x="22" y="29" font-size="10" font-weight="800" letter-spacing="2">CH.${String(Math.floor((v.level-1)/5)+1).padStart(2,'0')}</text><text x="22" y="48" font-size="15" font-weight="800">${w.name}</text></g></svg>`;
}
function create(options){
 const model=root.StudyGardenCore.create(options);
 function home(ctx={}){
  const v=model.view(),missions=model.missions(),mastery=[['첫걸음',v.badges.includes('first'),'✦'],['20문제 모험',v.badges.includes('twenty'),'⚑'],['3일의 불꽃',v.badges.includes('streak3'),'♨'],['복습 보스',v.badges.includes('boss'),'♜']];
  return `<div class="garden-home">
  <header class="garden-heading"><div><span class="garden-kicker">STUDY ADVENTURE</span><h1>마스터의 합격 콩나무</h1><p>오늘도 한 칸, 합격에 가까이.</p></div><span class="garden-streak" aria-label="연속 학습 ${v.streak}일">🔥 ${v.streak}일</span></header>
  <section class="garden-world"><div class="garden-world-top"><span class="garden-level">Lv.${v.level} <span>${['새싹 모험가','초록 탐험가','구름 수호자','별빛 지도사'][v.theme]}</span></span><span class="garden-coins">✧ ${v.coins} 코인</span></div>${scene(v)}
  <div class="garden-xp"><div><strong>다음 레벨까지 ${100-v.levelXp} XP</strong><span>${v.levelXp} / 100</span></div><div class="garden-meter" role="progressbar" aria-label="다음 레벨 진행도" aria-valuenow="${v.levelXp}" aria-valuemin="0" aria-valuemax="100"><i style="width:${v.levelXp}%"></i></div></div>
  <button class="garden-start" data-game-action="daily">${v.questions>=20?'모험을 더 이어가기':'오늘의 20문제 모험 시작'} <span aria-hidden="true">→</span></button><p class="garden-fine">1과목 → 2과목 → 3과목 순서 · 학습량 제한 없음</p></section>
  <div class="garden-quick"><button data-action="resume"><span>↪</span><strong>이어 풀기</strong></button><button data-nav="theory"><span>▤</span><strong>이론 탐험</strong></button><button data-game-action="boss"><span>♜</span><strong>복습 보스</strong></button><button data-action="all-questions"><span>▦</span><strong>문제은행</strong></button></div>
  <section class="garden-section"><div class="garden-section-title"><h2>오늘의 미션</h2><span>작은 성취를 모아 봐요</span></div><div class="garden-missions">${missions.map((m,i)=>`<article class="garden-mission ${m.claimed?'claimed':''}"><span class="garden-mission-icon">${['🌱','👾','💧'][i]}</span><div><h3>${m.name}</h3><p>${m.hint}</p><div class="garden-mission-progress"><i style="width:${Math.min(100,m.count/m.target*100)}%"></i></div><small>${Math.min(m.count,m.target)} / ${m.target} · +${m.xp} XP · ${m.coins} 코인</small></div><button data-game-action="claim" data-mission="${m.id}" ${m.ready?'':'disabled'}>${m.claimed?'완료':m.ready?'받기':'진행 중'}</button></article>`).join('')}</div></section>
  <button class="garden-boss" data-game-action="boss"><span class="garden-boss-figure">♜</span><span><small>REVIEW BATTLE</small><strong>오답 몬스터에게 재도전!</strong><span>복습 최대 5문제 · 60% 이상 맞히면 승리</span></span><span>→</span></button>
  <section class="garden-section"><div class="garden-section-title"><h2>나의 작은 훈장</h2><span>진짜 공부로 얻는 기록</span></div><div class="garden-badges">${mastery.map(([name,earned,icon])=>`<div class="${earned?'earned':''}"><span aria-hidden="true">${icon}</span><small>${name}</small><em>${earned?'달성':'도전 중'}</em></div>`).join('')}</div></section>
  <details class="garden-closet"><summary><span>🪖 캐릭터 꾸미기</span><span>모은 코인으로 나만의 안전모</span></summary><div class="garden-helmets">${Object.entries(root.StudyGardenCore.HELMETS).map(([id,h])=>`<article>${mascot(h.color,h.name)}<strong>${h.name}</strong><button data-game-action="equip" data-helmet="${id}" ${v.equipped===id?'disabled':''}>${v.equipped===id?'착용 중':v.owned.includes(id)?'착용하기':h.cost+' 코인'}</button></article>`).join('')}</div></details>
  <section class="garden-section"><div class="garden-section-title"><h2>모든 과목, 자유롭게</h2><span>기출 ${Number(ctx.questionCount||0).toLocaleString('ko-KR')}문제</span></div><div class="garden-subjects">${Object.entries(labels).map(([id,name],i)=>`<button data-subject="${id}"><span>0${i+1}</span><strong>${name}</strong><small>${Number(ctx.subjectCounts?.[id]||0)}문제 →</small></button>`).join('')}</div></section>
  <details class="garden-materials"><summary>개인교재·자료 및 학습기록</summary><p>교재 해설·법령 원문·강의는 기존 메뉴에서 그대로 공부할 수 있어요.</p><div class="row">${ctx.importHtml||''}<button data-action="settings">자료·설정</button><button data-action="laws">법령 원문·기준일</button><button data-nav="records">내 공부 기록</button></div><p>캐릭터와 성장 기록도 이 브라우저에 저장됩니다. 기록 내보내기로 함께 백업하세요.</p></details>
  <p class="garden-bottom-note">${v.storageFailed?'저장 공간이 부족합니다. 기록을 내보내 주세요.':v.migrated?'이전에 풀었던 '+v.migrated+'문제도 성장에 반영했어요.':'틀려도 괜찮아요. 다시 이해하고 맞히는 과정도 성장입니다.'}</p>
  ${ctx.error?`<p class="error">${escape(ctx.error)}</p>`:''}</div>`;
 }
 function hud(run){
  const v=model.view(),index=run?run.index+1:0,total=run?.ids.length||0;
  return `<section class="garden-hud"><span class="garden-hud-avatar">${mascot(root.StudyGardenCore.HELMETS[v.equipped].color)}</span><div><strong>${run?(run.mode==='boss'?'♜ 복습 보스전':'🌱 오늘의 모험'):'콩나무 성장 중'}</strong><small>${run?`${index} / ${total}문제 · 정답 확인 후 다음 칸으로`:`Lv.${v.level} · 다음 레벨까지 ${100-v.levelXp} XP`}</small><div class="garden-meter"><i style="width:${run?(index-1)/total*100:v.levelXp}%"></i></div></div><button data-game-action="home" class="garden-home-button">정원</button></section>`;
 }
 function reward(r){
  const title=r.levelUp?'레벨 업! Lv.'+r.level:r.duplicate?'복습도 성장의 일부예요':r.correct?'좋아요! 한 칸 더 올라갔어요.':'도전 완료! 해설로 한 번 더 확인해요.';
  return `<div class="garden-reward ${r.levelUp?'level-up':''}" role="status"><span class="garden-reward-spark" aria-hidden="true">${r.levelUp?'✦':'🌱'}</span><div><strong>${title}</strong><small>${r.duplicate?'이 문제의 오늘 보상은 이미 받았어요.':`+${r.xp} XP${r.coins?' · +'+r.coins+' 코인':''}${r.combo>=3?' · '+r.combo+'연속 정답!':''}`}</small></div>${r.levelUp?'<i class="garden-confetti" aria-hidden="true">✧ ✦ ✧</i>':''}</div>`;
 }
 function summary(run,result){
  const correct=Object.values(run.answers).filter(Boolean).length,bonus=result.xp||0;
  return `<section class="garden-summary"><div class="garden-summary-art">${mascot(root.StudyGardenCore.HELMETS[model.view().equipped].color)}</div><span class="garden-kicker">${run.mode==='boss'?'REVIEW BATTLE':'QUEST COMPLETE'}</span><h1>${run.mode==='boss'?(result.won?'오답 몬스터를 물리쳤어요!':'한 번 더 도전하면 돼요!'):'오늘도 콩나무가 자랐어요!'}</h1><p>${run.ids.length}문제 모험 완료 · 정답 ${correct}개<br><small>첫 번째 선택 기준으로 기록했어요.</small></p><div class="garden-summary-stats"><div><strong>+${run.xp+bonus}</strong><span>획득 XP</span></div><div><strong>${Math.round(correct/run.ids.length*100)}%</strong><span>정답률</span></div><div><strong>Lv.${model.view().level}</strong><span>나의 레벨</span></div></div>${bonus?`<p class="garden-summary-bonus">보스 격파 보너스 +${bonus} XP · +${result.coins} 코인</p>`:''}<button class="garden-start" data-game-action="home">정원으로 · 미션 보상 받기 →</button><button class="wide" data-game-action="${run.mode==='boss'?'boss':'daily'}">모험 한 번 더</button><button class="wide" data-action="wrong">오답 다시 보기</button></section>`;
 }
 return {...model,home,hud,reward,summary};
}
const api={create,mascot};root.StudyGarden=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
