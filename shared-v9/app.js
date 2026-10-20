(async function(){
 'use strict';
 const C=StudyCore,$=s=>document.querySelector(s),E=s=>String(s??'').replace(/\ue09e/g,'β').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ASSET='../shared-v9/',KEY='jidosa-study-v9',NUM=['①','②','③','④','⑤'];
 let historyData=null,historyError='';
 try{historyData=await Promise.race([Promise.resolve(window.STUDY_HISTORY_READY),new Promise((_,reject)=>setTimeout(()=>reject(new Error('history loading timeout')),12000))]);}catch(e){historyError='과년도 문제 로딩이 지연되거나 실패했습니다. 기본 학습자료로 계속합니다.';console.error(e);}
 function applyLawUpdates(data){
  if(!historyData)return data;
  const screen=new Map((historyData.reviewScreen||[]).map(x=>[x.id,x]));
  const theory={...(data.theory||{})};
  for(const [subject,items] of Object.entries(historyData.theoryPatches||{}))theory[subject]=(theory[subject]||[]).map((t,i)=>items[i]?{...t,...items[i]}:t);
  return {...data,title:historyData.title,status:`2013~2026년 1,050문항 · 법령·고시 관련 ${historyData.reviewSummary?.reviewed||Object.keys(historyData.patches).length}문항 대조 · 법령 이론 53단원 본문 반영`,theory,questions:data.questions.map(q=>{const patch=historyData.patches[q.id];const textbookExplanationImages=q.textbookExplanationImages||(q.sourceKind==='textbook'?q.explanationImages:[])||[];const source={...q,textbookExplanationImages};return patch?{...source,...patch}:screen.get(q.id)?.status==='not-law-review'?{...source,lawReview:null}:source;})};
 }
 function legalSources(q){
  const names={law:'산업안전보건법',decree:'산업안전보건법 시행령',rule:'산업안전보건법 시행규칙',safety:'산업안전보건기준에 관한 규칙'},keys={law:'law',decree:'decree',rule:'enforcement-rule',safety:'safety-standards'};
  let html=`<p class="small">${E(q.references||'공식 현행 원문에서 근거를 확인하세요.')}</p>`;
  html+=(q.referenceLinks||[]).map(l=>`<p class="small"><a href="${E(l.url)}" target="_blank" rel="noopener">${E(l.title)} ↗</a></p>`).join('');
  for(const ref of q.reviewArticleKeys||[]){const [k,n]=ref.split(':'),text=window.LAW_TEXTS?.[keys[k]];if(!text)continue;const heading='##### 제'+n.replace('의','조의')+(n.includes('의')?'':'조');const lines=text.split('\n'),start=lines.findIndex(x=>x===heading||x.startsWith(heading+' ')||x.startsWith(heading+'('));if(start<0)continue;let end=start+1;while(end<lines.length&&!lines[end].startsWith('##### 제'))end++;const body=lines.slice(start,end).join('\n').replace(/\\([.()])/g,'$1').replace(/\*\*/g,'').replace('##### ','');html+=disclosure(names[k]+' '+heading.replace('##### ',''),`<div class="prose small">${E(body)}</div>`);}
  return html+`<p class="caption">기준일 2026-10-18. 별표·별지의 표·서식 및 부칙은 공식 원문에서 함께 확인하세요.</p><button data-action="laws">전체 법령 보기</button>`;
 }


 const CORP_EXTRA_NOTES=[["조직구조와 의사결정 체계","【조직설계의 핵심】 기능별 구조는 전문화·규모의 경제에 유리하지만 부서 간 조정이 늦을 수 있다. 사업부제는 제품·지역별 성과책임이 명확하나 자원이 중복된다. 매트릭스 구조는 기능관리자와 프로젝트관리자에게 이중 보고하므로 전문인력 공유에 유리하지만 권한충돌이 생긴다.\n【의사결정】 정형적 문제에는 프로그램화된 결정, 불확실하고 새로운 문제에는 비정형적 결정이 활용된다. 제한된 합리성은 의사결정자가 정보·시간·인지능력의 제약 때문에 최적해보다 만족해를 선택한다는 설명이다.\n【출제 구별】 집권화는 의사결정 권한이 상층부에 집중된 정도, 공식화는 업무규칙이 문서화·표준화된 정도, 분권화는 권한 위임 정도이다."],["직무분석과 직무설계","【직무분석】 특정 직무의 과업·책임·수행조건과 요구 역량을 체계적으로 수집하는 과정이다. 결과물인 직무기술서에는 수행업무·책임·근무조건이, 직무명세서에는 지식·기술·능력·자격요건이 중심으로 수록된다.\n【직무설계】 직무확대는 수평적으로 과업 종류를 늘리고, 직무충실화는 계획·통제·평가 등 수직적 책임과 자율성을 높인다. 직무순환은 근로자가 여러 직무를 일정 주기로 경험하게 한다.\n【직무특성이론】 핵심 직무차원은 기술다양성·과업정체성·과업중요성·자율성·피드백이다. 동기잠재력지수(MPS)=(기술다양성+과업정체성+과업중요성)/3 × 자율성 × 피드백. 자율성이나 피드백이 0이면 MPS는 0이 된다."],["인사평가와 역량개발","【인사평가】 평가는 성과를 측정할 뿐 아니라 교육훈련·배치·보상 의사결정의 자료가 된다. 특성평가는 성실성 등 속성, 행동평가는 관찰 가능한 행동, 결과평가는 목표달성도에 초점을 맞춘다.\n【평가방법】 BARS는 대표적 행동사례를 등급 기준과 연결한다. MBO는 목표를 합의하고 달성 정도를 평가한다. 360도 평가는 상사·동료·부하 등 복수 평가자의 정보를 활용한다.\n【오류】 후광효과는 한 가지 긍정·부정 특징이 다른 항목 평가를 좌우하는 것, 관대화·엄격화 경향은 전반적인 높은·낮은 점수, 중심화 경향은 중간 점수 집중이다."],["동기부여 내용이론","【매슬로 욕구단계】 생리·안전·사회·존경·자아실현 욕구를 제시한다. 욕구는 고정된 계단처럼 모든 사람에게 반드시 같은 순서로만 나타난다고 단정하면 안 된다.\n【허즈버그 2요인】 위생요인(임금·정책·작업조건 등) 결핍은 불만족을 만들고, 동기요인(성취·인정·책임·성장 등)은 직무만족을 촉진한다. 위생요인 개선이 곧바로 강한 내재적 동기를 보장하지 않는다.\n【맥클리랜드】 성취욕구·권력욕구·친교욕구를 구분한다. ERG이론은 존재·관계·성장 욕구를 제시하며 좌절-퇴행 가능성을 인정한다."],["동기부여 과정이론","【기대이론】 브룸은 노력이 성과로 연결될 것이라는 기대(E), 성과가 보상으로 연결될 것이라는 수단성(I), 보상의 매력인 유의성(V)을 구별한다. 설명 모형은 동기수준=E×I×V로 표현한다.\n【공정성이론】 개인은 자신의 투입 대비 산출 비율을 비교대상의 비율과 비교한다. 불공정을 지각하면 노력·요구보상·인지·비교대상 등을 조정할 수 있다.\n【목표설정이론】 구체적이며 도전적인 목표와 피드백이 중요한데, 수용 가능성·능력·자원·난이도를 함께 고려해야 한다."],["리더십 이론","【특성이론·행동이론】 특성이론은 지도자의 상대적으로 안정된 속성에, 행동이론은 실제로 나타나는 과업지향·관계지향 행동에 초점을 둔다.\n【상황이론】 피들러 모형은 리더-구성원 관계·과업구조·직위권력을 상황변수로 본다. 허시와 블랜차드의 상황적 리더십은 구성원의 준비도에 따라 지시·코칭·지원·위임 행동을 달리한다.\n【현대적 접근】 변혁적 리더십은 비전·지적 자극·개별적 배려, 거래적 리더십은 조건부 보상과 예외관리를 강조한다."],["집단행동과 의사결정","【집단의 효과】 집단은 정보다양성과 오류 교차점검에 유리하나 조정비용·동조압력도 발생한다. 집단극화는 토론 후 기존 경향보다 더 극단적인 방향으로 결정이 이동하는 현상이다.\n【집단사고】 응집성이 높은 집단에서 반대의견 억제·대안 검토 부족·만장일치 환상이 나타날 수 있다. 익명 의견수렴, 외부 전문가 검토, 반대역할 지정이 예방에 도움을 준다.\n【기법】 명목집단기법은 개인별 아이디어 작성 후 순차 제시·평가, 델파이는 익명 전문가 의견을 반복 수렴한다. 브레인스토밍에서는 초기 아이디어 단계의 성급한 비판을 피한다."],["조직구조와 조직문화","【조직구조】 전문화·명령계통·통솔범위·집권화·공식화는 서로 다른 차원이다. 통솔범위가 넓으면 중간관리 단계가 줄 수 있지만 관리자 조정 부담이 커질 수 있다.\n【조직문화】 공유된 가치·신념·행동규범을 뜻한다. 겉으로 보이는 상징·의례, 표방된 가치, 기본가정 수준을 구별한다.\n【안전문화 적용】 사고를 숨기지 않고 보고할 수 있는 분위기, 경영진의 자원 투입, 안전행동에 대한 일관된 피드백이 실제 행동을 바꾼다. 표어만 많다고 강한 안전문화는 아니다."],["생산관리와 품질","【생산관리】 투입(인력·자재·설비)을 제품·서비스로 전환하는 과정을 품질·원가·납기 관점에서 관리한다. 공정별 병목의 처리능력이 전체 산출을 제한할 수 있다.\n【재고】 경제적 주문량 EOQ=√(2DS/H). D는 기간 수요량, S는 주문당 주문비, H는 단위당 기간 보관비이다. EOQ는 단순모형에서 주문비와 보관비의 합을 최소화한다.\n【품질관리】 예방비·평가비·내부실패비·외부실패비로 품질비용을 구분한다. 관리도는 공정의 통계적 관리상태를 판단하며 규격한계와 관리한계는 다른 개념이다."],["산업심리와 지각","【선택적 지각】 사람은 모든 자극을 동일하게 처리하지 못하고 경험·기대·주의에 따라 정보를 선택한다. 고정관념은 집단특성을 개인에 과도하게 적용하는 오류다.\n【귀인이론】 행동 원인을 개인 내부(능력·노력 등)나 외부(상황·운 등)에 돌린다. 기본적 귀인오류는 타인의 행동에서 상황요인을 과소평가하고 성향을 과대평가하는 경향이다.\n【현장 사례】 근로자의 보호구 미착용을 무조건 태도 문제로 단정하지 않고 작업환경·착용성·공급 및 감독상 문제도 분석한다."],["스트레스와 직무만족","【스트레스 모형】 직무요구는 업무량·시간압박·역할갈등·역할모호성 등이 될 수 있다. 직무자율성·사회적 지원은 부정적 영향을 완화하는 자원이 될 수 있다.\n【직무요구-통제 모형】 높은 요구와 낮은 통제가 결합된 직무를 높은 긴장 직무로 설명한다. 요구-자원(JD-R) 모형은 소진을 높이는 요구와 동기·몰입을 돕는 자원을 함께 분석한다.\n【대응】 조직 차원에서는 인력·작업량·휴식·의사소통 개선, 개인 차원에서는 회복행동과 스트레스 관리가 있다. 개인훈련만으로 유해한 작업조건을 대체할 수 없다."],["산업위생의 노출평가","【노출평가】 측정 목적은 근로자의 실제 노출 수준을 파악하고 관리대책의 효과를 판단하는 것이다. 개인시료는 호흡영역 노출평가에 유리하며 지역시료는 특정 장소의 환경정보를 제공한다.\n【시간가중평균】 TWA=(C₁t₁+C₂t₂+…)/(t₁+t₂+…). 8시간 기준 평가에는 노출시간과 기준값의 정의를 함께 확인한다.\n【비교】 단시간 노출기준(STEL)과 최고노출기준(Ceiling)은 8시간 TWA와 같은 뜻이 아니다. 복합노출은 물질별 독성작용의 유사성 및 적용 지침을 고려해야 한다."],["환기의 기본 원리","【국소배기】 발생원 가까이에서 오염공기를 포집하여 작업장으로 확산되기 전에 제거한다. 후드·덕트·공기정화장치·송풍기·배기구의 기능을 구분한다.\n【전체환기】 상대적으로 독성이 낮고 고르게 발생하는 오염물질에 적용하는 희석개념이다. 급성독성·고농도·비정상 발생원에는 국소배기·밀폐 등 근원대책이 우선한다.\n【기본식】 체적유량 Q=A×V (m³/s)이며 덕트 단면적 A와 평균유속 V를 사용한다. 덕트 직경·유속·정압손실은 별도 변수다."],["생산·재고 관리","【생산방식】 개별생산은 고객별 변형에 유리하지만 단위원가가 높을 수 있다. 대량생산은 표준화·반복성이 높아 원가를 줄이나 수요변동 대응이 어렵다.\n【재고관리】 ABC분석은 일반적으로 재고 품목을 연간 사용금액 등 중요도에 따라 A·B·C로 구분해 관리강도를 달리한다. 안전재고는 수요·납기 변동에 대비하는 재고다.\n【수요예측】 단순이동평균은 최근 n기 실적 평균, 가중이동평균은 시점별 가중치를 다르게 부여한다. 지수평활 F(t+1)=αA(t)+(1−α)F(t). α가 높을수록 최근 실적에 민감하다."],["품질관리와 통계적 공정관리","【통계적 품질관리】 공통원인 변동은 공정에 일상적으로 내재한 변동, 특별원인 변동은 특정 사건·설비이상 등 식별 가능한 변동을 뜻한다.\n【관리도】 X̄-R 관리도는 연속형 측정치의 중심·산포 관리에 쓰며, p 관리도는 불량률, c 관리도는 일정한 검사단위의 결점 수를 대상으로 한다.\n【공정능력】 Cp=(USL−LSL)/(6σ), Cpk=min((USL−μ)/(3σ),(μ−LSL)/(3σ)). Cp는 치우침을 직접 반영하지 않지만 Cpk는 평균의 치우침을 반영한다."],["집단사고와 사회적 태만","【집단사고】 집단 내 조화 유지가 비판적 검토를 압도하면 대안을 충분히 탐색하지 않고 성급하게 합의할 수 있다. 만장일치 환상·자기검열·반대의견 배척이 단서다.\n【사회적 태만】 집단에서 개인의 기여가 식별되기 어렵거나 책임이 분산되면 개인 노력이 줄어드는 현상이다. 개인별 성과 피드백·기여 명확화·과업의미 부여가 완화에 도움이 된다.\n【구분】 집단극화는 토론 후 결정의 극단화, 집단사고는 비판적 판단 결여, 사회적 태만은 개인 노력 감소를 뜻한다."],["국소배기장치의 구성","【후드】 오염물질이 발생한 지점에서 포집하는 장치다. 포위식 후드는 발생원을 둘러싸고, 외부식 후드는 발생원 외측에서 흡인한다. 후드까지의 거리가 멀어질수록 필요한 흡인 조건이 불리해진다.\n【덕트·정화장치】 덕트는 포집 공기를 운반하고 적정 반송속도는 분진 퇴적을 억제한다. 집진기·흡착탑·세정장치 등은 물질 특성에 맞춰 선택한다.\n【송풍기·배기구】 송풍기는 전체 압력손실을 극복하는 압력을 제공한다. 배기구는 재유입 및 주변 노출을 방지하도록 배치한다. 국소배기 성능평가에는 풍량뿐 아니라 후드 제어풍속·누설·정압 등을 검토한다."],["산업위생 노출량 계산","【TWA 예제】 2시간 동안 10ppm, 6시간 동안 2ppm에 노출되면 8시간 TWA=(10×2+2×6)/8=4ppm이다. 측정 단위와 기준시간을 맞춘다.\n【노출지수】 단순 비교지수는 측정농도/노출기준이다. 단, 서로 다른 물질을 합산할 때는 독성작용과 평가 규정이 같은 조건에서만 합산법을 검토한다.\n【환기 계산】 일정한 발생률 G와 제거 환기량 Q를 가정한 단순 정상상태에서는 C≈G/Q 관계를 쓸 수 있다. 발생단위·혼합·외기농도·환기효율을 무시한 이상화 모형이므로 실제 설계에는 보정이 필요하다."]];
 function enrichCorpTheory(data){if(!data.theory?.corp)return data;const theory={...data.theory,corp:data.theory.corp.map(t=>{const n=CORP_EXTRA_NOTES.find(([k])=>t.title===k);return n?{...t,body:(t.body||'')+'\n\n【기업진단·지도 심화학습 — 2026.10.20 보강】\n'+n[1]}:t;})};return {...data,theory};}
 let base=C.validateCourse(window.STUDY_COURSE),course=base,db=null,records={},lastQuestion=null,videoDone={},lessonDone={};
 if(historyData){base=applyLawUpdates(C.mergeCourses(base,{questions:historyData.history}));base.title=historyData.title;course=base;}
 base=enrichCorpTheory(base);course=enrichCorpTheory(course);
 const DOSA_VIDEOS=[{"id":"GPXlYZoTpDM","title":"[산업안전일반] 1강 OT 및 안전보건교육규정 - 산업안전지도사1차 2과목","channel":"도사 안땅","duration":3561,"subject":"general","topic":"안전교육","order":1},{"id":"OE4iBfpRsdc","title":"[산업안전일반] 2강 안전보건개선계획 - 산업안전지도사1차 2과목","channel":"도사 안땅","duration":1874,"subject":"general","topic":"안전관리","order":2},{"id":"9UU571Z3T_U","title":"[산업안전일반] 3강 구독하고 주기적으로 봐야 할 위험성평가에관한 지침 전문","channel":"도사 안땅","duration":2998,"subject":"general","topic":"안전관리","order":3},{"id":"VVsDAzGn1jY","title":"[산업안전일반] 4강 위험성평가의 인정 / 재인정 / 취소 및 기출문제 풀이 (23년 개정으로 문제가 상이하기에 대처 꿀팁까지.. #메리크리스마스","channel":"도사 안땅","duration":2102,"subject":"general","topic":"안전관리","order":4},{"id":"KjdKQTk-Bdo","title":"[산업안전일반] 5강 안전교육기법 교육훈련/교육방법 구분 / TWI, OJT, OFFJT 등 다양한 기법/ 한번만 들어도 될만큼 쉽고 재밌습니다","channel":"도사 안땅","duration":3572,"subject":"general","topic":"안전교육","order":5},{"id":"fkZ0IbWYBUQ","title":"[산업안전일반] 6강 제조물책임법, 안전관리1편 (총 2편 중)","channel":"도사 안땅","duration":1801,"subject":"general","topic":"안전관리","order":6},{"id":"s8cwRweeggc","title":"[산업안전일반] 7강 안전관리2편 (총 2편 중) 산업안전지도사 1차 2과목 완벽대비","channel":"도사 안땅","duration":2903,"subject":"general","topic":"안전관리","order":7},{"id":"HSRvAqiuZGI","title":"[산업안전일반] 8강 욕부터나오는 신뢰도공학 계산 시작합니다 ^^","channel":"도사 안땅","duration":4123,"subject":"general","topic":"신뢰성공학","order":8},{"id":"qKO7VSltf3s","title":"[산업안전일반] 9강 신뢰도 계산 복습 및 n중k 중복 계산 - 5분이상 시간써야하는 계산문제 대응 방법","channel":"도사 안땅","duration":3365,"subject":"general","topic":"신뢰성공학","order":9},{"id":"CHKDACu3B6I","title":"[산업안전일반] 10강 부울대수 & 미니멀컷셋 이거보다 쉽게 설명 못합니다","channel":"도사 안땅","duration":2993,"subject":"general","topic":"시스템안전공학","order":10},{"id":"objGuXVDQzc","title":"[산업안전일반] 11강 표하나로 다양한 문제가 대응할 수 있습니다 숙제: 표암기","channel":"도사 안땅","duration":2560,"subject":"general","topic":"종합 문제풀이","order":11},{"id":"68mA8VHVU7o","title":"[산업안전일반] 12강 인간-기계시스템 오랜만에 편안한 마음의 강의입니다","channel":"도사 안땅","duration":2159,"subject":"general","topic":"인간공학","order":12},{"id":"MG_iEEQY5Rg","title":"[필수시청] 공학용계산기 처음 사용하는 분들을 위한 영상 (꿀Tip 대방출)","channel":"도사 안땅","duration":1858,"subject":"general","topic":"계산기 사용법","order":13},{"id":"26ovGmI3_wY","title":"[산업안전일반] 13강 근골격계 계산 쉽게 뿌시기","channel":"도사 안땅","duration":1844,"subject":"general","topic":"인간공학","order":14},{"id":"m_H0mLvQZA8","title":"[산업안전일반] 14강 FT도 계산문제 복습 및 소음 계산문제 산업안전지도사 1차 2과목","channel":"도사 안땅","duration":2554,"subject":"general","topic":"시스템안전공학·인간공학","order":15},{"id":"5KS1SNymFAY","title":"[산업안전일반] 15강 끝나지않은 계산문제 (조도, 시력, 통제표시비) 산업안전지도사1차 2과목","channel":"도사 안땅","duration":2903,"subject":"general","topic":"인간공학","order":16},{"id":"8bGgmgIktgQ","title":"[산업안전일반]16강 인간행동오류/OXFORD지수/WBGT지수 계산/산업안전지도사 1차 2과목","channel":"도사 안땅","duration":1666,"subject":"general","topic":"인간공학","order":17},{"id":"0-ouSsgRHZU","title":"[산업안전일반] 17강 포기하신분도 되살아나는 n중k중복 완벽정리 & 산업재해 발생시 처리순서 산업안전지도사 1차 2과목","channel":"도사 안땅","duration":2626,"subject":"general","topic":"신뢰성공학·재해조사","order":18},{"id":"EEmzQ_5fcsI","title":"[산업안전일반] 18강 마지막강의 도사안땅의 (빈도/강도)계산중 화난 썰 #아보하  산업안전지도사 1차 2과목산업안전지도사","channel":"도사 안땅","duration":4804,"subject":"general","topic":"재해조사","order":19},{"id":"W1dQPKDsJ9E","title":"[긴급] 14회 39번 문제 해결해드립니다. 정승재 선생님도 반할 수 있는 완벽 해설 [산업안전일반 기출문제]","channel":"도사 안땅","duration":953,"subject":"general","topic":"시스템안전공학","order":20},{"id":"HfbTcOHhaS0","title":"2026대비 산업안전일반 OT","channel":"도사 안땅","duration":1566,"subject":"general","topic":"과목 안내","order":21},{"id":"wCHav1_uW58","title":"산업안전지도사 1차 2과목 신뢰도 공학 계산문제 같이 풀어요 할수있습니다!!","channel":"도사 안땅","duration":4850,"subject":"general","topic":"신뢰성공학","order":22},{"id":"io7__K02eSM","title":"[극대노] 에이씨X(BAR) 조지불의 부울대수 - 합법적으로 욕하는 법","channel":"도사 안땅","duration":819,"subject":"general","topic":"시스템안전공학","order":23}];
 base.videos=[...DOSA_VIDEOS,...(base.videos||[]).filter(v=>v.subject!=='general')];
 let view='home',filter={subject:'',year:'',topic:'',mode:'all',search:''},page=0,currentId=null,choice=null,revealed=false,lessonSubject='law',lessonIndex=0,videoSubject='',videoSearch='',videoTopic='';
 const mobile=document.body.dataset.layout==='mobile';if(mobile)document.body.classList.add('mobile-layout');
 function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.add('hidden'),4200);}
 function save(){try{localStorage.setItem(KEY,JSON.stringify({records,lastQuestion,videoDone,lessonDone}));}catch(e){toast('기록 저장 공간이 부족합니다. 기록을 내보내 주세요.');}}
 try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');records=s.records||{};lastQuestion=s.lastQuestion||null;videoDone=s.videoDone||{};lessonDone=s.lessonDone||{};}catch(e){toast('저장 기록을 읽지 못했습니다. 새 기록으로 시작합니다.');}
 try{db=await new Promise((resolve,reject)=>{const r=indexedDB.open('jidosa-personal-v9',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const saved=await new Promise((resolve,reject)=>{const r=db.transaction('files').objectStore('files').get('course');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});if(saved)course=applyLawUpdates(C.mergeCourses(base,saved));}catch(e){toast('개인자료 자동 저장을 사용할 수 없습니다. 이 창에서 불러오기는 가능합니다.');}
 function persistCourse(data){if(!db)return Promise.reject(new Error('이 브라우저에서는 개인자료 자동 저장을 사용할 수 없습니다.'));return new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(data,'course');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
 function rec(id){return records[id]||(records[id]={});}
 const subjectName=k=>C.SUBJECTS[k]||k;
 function header(title,sub,extra=''){return `<header><div><div class="eyebrow">2027 산업안전지도사</div><h1>${E(title)}</h1>${sub?`<div class="muted small">${E(sub)}</div>`:''}</div>${extra}</header>`;}
 function counts(){return Object.fromEntries(Object.keys(C.SUBJECTS).map(s=>[s,course.questions.filter(q=>q.subject===s).length]));}
 function nav(){document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===view||(view==='question'&&b.dataset.nav==='questions')));}
 function go(v){view=v;page=0;render();window.scrollTo({top:0,behavior:'instant'});}
 function render(){nav();const main=$('#main');try{main.innerHTML=({home:home,questions:questions,question:question,theory:theory,videos:videos,records:recordView,laws:laws,settings:settings}[view]||home)();}catch(e){main.innerHTML=`<div class="error">화면을 표시하지 못했습니다. <button data-action="home">홈으로</button></div>`;console.error(e);}bindLocal();}
 function home(){const n=counts(),attempted=Object.values(records).filter(r=>r.attempts).length,correct=Object.values(records).filter(r=>r.attempts&&r.correct).length;return header('전체 학습','하루 제한 없이, 원하는 단원부터 공부하세요.')+`${historyError?`<div class="error">${E(historyError)}</div>`:''}<section class="hero"><div class="hero-row"><div><span class="tag">개인 학습 · PC & 모바일</span><h2 style="margin:14px 0 8px">합격까지 이어지는<br>나만의 공부 공간</h2><p>이론을 읽고, 기출을 풀고, 필요한 강의를 찾아보세요.<br>공부하던 위치와 오답은 이 기기에 저장됩니다.</p><div class="row"><button class="primary" data-action="resume">이어서 공부 →</button><button data-action="all-questions">전체 기출문제</button></div></div><div class="hero-icon" aria-hidden="true">▤</div></div></section><section class="grid">${Object.entries(C.SUBJECTS).map(([s,name],i)=>`<button class="card subject-card" data-subject="${s}"><span class="subject-num">0${i+1}</span><h2>${E(name)}</h2><div class="row between"><span class="muted small">기출 ${n[s]}문제 · 전체 이론 열람</span><span>→</span></div></button>`).join('')}</section><section class="stats section-gap"><div class="card stat"><span class="stat-label">학습한 문제</span><strong>${attempted}</strong></div><div class="card stat"><span class="stat-label">최근 답변 정답률</span><strong>${attempted?Math.round(correct/attempted*100):0}<small>%</small></strong></div><div class="card stat"><span class="stat-label">전체 문제</span><strong>${course.questions.length}</strong></div></section><section class="card section-gap"><h3>2013~2026년 기출</h3><p class="muted small">과년도 문제는 처음부터 수록되어 있습니다. 개인학습자료를 불러오면 교재 해설을 함께 볼 수 있습니다. 교재 해설은 이 브라우저 안에 보관됩니다.</p><div class="row">${importLabel()}<button data-action="settings">자료·설정 보기</button></div><div class="caption" style="margin:12px 0 0">현재: ${E(course.title||'2026 공식 기출')} · ${course.questions.length}문제</div></section><section class="card section-gap"><h3>연도별 수록 현황</h3><div class="prose small">${[...new Set(course.questions.map(q=>q.year))].sort((a,b)=>b-a).map(y=>y+'년: '+course.questions.filter(q=>q.year===y).length+'문제').join(' · ')}</div></section><section class="card section-gap"><h3>법령 학습 기준</h3><p class="small">2026년 개정·시행 법령과 출제 당시 법령을 구분합니다. 1과목 350문항과 다른 과목의 법령·고시 관련 문항을 대조했습니다. 수정된 문제는 기출 응용문제로 표시합니다.</p><button class="text-btn" data-action="laws">법령 원문과 검토 상태 보기 →</button></section>`;}
 function importLabel(){return `<label class="file-label">개인학습자료 불러오기<input type="file" accept=".json,application/json" data-import="course"></label>`;}
 function questionFilters(){const years=[...new Set(course.questions.map(q=>q.year))].sort((a,b)=>b-a),topics=[...new Set(course.questions.filter(q=>!filter.subject||q.subject===filter.subject).map(q=>q.topic))].filter(Boolean).sort();return `<input id="q-search" class="search" type="search" aria-label="문제·단원 검색" placeholder="문제 내용 또는 단원 검색" value="${E(filter.search)}"><div class="filters"><select id="f-subject" aria-label="과목"><option value="">전체 과목</option>${Object.entries(C.SUBJECTS).map(([k,n])=>`<option value="${k}" ${filter.subject===k?'selected':''}>${E(n)}</option>`).join('')}</select><select id="f-year" aria-label="출제연도"><option value="">전체 연도</option>${years.map(y=>`<option ${String(filter.year)===String(y)?'selected':''}>${y}</option>`).join('')}</select><select id="f-topic" aria-label="분야"><option value="">전체 분야</option>${topics.map(t=>`<option value="${E(t)}" ${filter.topic===t?'selected':''}>${E(t)}</option>`).join('')}</select><select id="f-mode" aria-label="풀이 상태">${[['all','전체 문제'],['wrong','오답만'],['starred','즐겨찾기'],['unseen','안 푼 문제'],['law-reviewed','현행법 대조 완료'],['law-pending','현행법 검토 대기']].map(([k,n])=>`<option value="${k}" ${filter.mode===k?'selected':''}>${n}</option>`).join('')}</select></div>`;}
 function meta(q){const f=C.frequency(q,course.questions);return `<div class="metadata"><span>${q.year}년 ${q.lawAdapted?'기출 기반 · 2026년 개정 반영 변형':'출제'} · ${E(subjectName(q.subject))} · ${q.no}번</span><span>${f?`${E(f.label)} · ${q.frequencyBasis?'같은 대표 근거조문':'같은 주제'} · ${f.total}년 중 ${f.count}년 출제`:'동일 주제 출제빈도: 분석 중'}</span></div>`;}
 function questions(){const list=C.filterQuestions(course.questions,filter,records),pages=Math.max(1,Math.ceil(list.length/20));page=Math.min(page,pages-1);return header('전체 문제은행','원하는 연도·과목·분야를 자유롭게 선택하세요.')+questionFilters()+`<div class="row between caption"><span>${list.length}문제</span><button class="text-btn" data-action="random" ${list.length?'':'disabled'}>무작위로 풀기 ↗</button></div><div class="list">${list.slice(page*20,page*20+20).map(q=>`<button class="list-item" data-question="${E(q.id)}"><div><small>${q.year}년 · ${E(subjectName(q.subject))} · ${q.no}번${rec(q.id).starred?' · ★':''}</small><strong>${E(q.topic||q.text?.slice(0,65)||'기출문제')}</strong><small>${E((q.text||'').replace(/^\d+\.\s*/,'').slice(0,90))}</small></div><span aria-hidden="true">→</span></button>`).join('')||'<div class="empty">해당하는 문제가 없습니다. 필터를 바꿔보세요.</div>'}</div><div class="pager"><button data-action="prev-page" ${page===0?'disabled':''}>← 이전</button><span>${page+1} / ${pages}</span><button data-action="next-page" ${page===pages-1?'disabled':''}>다음 →</button></div>`;}
 function openQuestion(id){currentId=String(id);choice=null;revealed=false;lastQuestion=currentId;save();view='question';render();window.scrollTo({top:0,behavior:'instant'});}
 function qImage(src,label='문제 원문'){return `<button class="image-button" data-image="${E(src)}" aria-label="${E(label)} 확대"><img class="source-image" src="${src.startsWith('data:')?src:ASSET+src}" alt="${E(label)}: 표와 수식 포함" loading="lazy"></button>`;}
 function tableMarkup(t){return `<div class="table-scroll section-gap"><table class="ex-table"><thead><tr>${t.headers.map(c=>`<th>${E(c)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map(c=>`<td>${E(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
 function disclosure(title,body){return `<details class="disclosure"><summary>${E(title)}</summary><div class="details-body">${body}</div></details>`;}

 function formatConceptOnly(value){
  const original=String(value||'').replace(/\r\n?/g,'\n').replace(/\u00a0/g,' ');
  const headings=/(정답\s*해설|오답\s*분석|개념\s*정리|풀이\s*과정)\s*[:：)]?[ \t]*/g;
  const hits=[...original.matchAll(headings)];
  const person=/^(?:매슬로|허즈버그|맥그리거|맥클리랜드|알더퍼|브룸|아담스|로크|스키너|파블로프|반두라|피들러|허시|블랜차드|호손|테일러|페이욜|베버|해크먼|올덤|리커트|레윈|라자루스|카라섹|하인리히|버드|도미노)(?=\s|의|:|：|\(|이론|법칙)/;
  const numbered=/^([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]|[1-9][0-9]*[.)]|[ㄱㄴㄷㄹㅁㅂ][.)]|[•▪●▶►])\s*(.*)$/;
  function body(text,numberNames){
    let blocks=[],current=null;
    function flush(){if(current){blocks.push(current);current=null;}}
    const lines=text.replace(/[ \t]+(?=[①②③④⑤⑥⑦⑧⑨⑩])/g,'\n').split('\n');
    for(const raw of lines){
      const line=raw.trim();
      if(!line){flush();continue;}
      if(line===')'){
        const soFar=current?current.parts.join(' '):'';
        const opens=(soFar.match(/\(/g)||[]).length;
        const closes=(soFar.match(/\)/g)||[]).length;
        if(opens<=closes)continue; // Hide an unmatched, orphan closing bracket only.
      }
      const marked=line.match(numbered);
      const isPerson=numberNames&&person.test(line);
      if(marked||isPerson){flush();current={kind:marked?'number': 'name',marker:marked?marked[1]:'',parts:[marked?marked[2]:line]};}
      else if(current){current.parts.push(line);}
      else current={kind:'paragraph',marker:'',parts:[line]};
    }
    flush();
    if(!blocks.length)return '';
    return '<div class="solution-section-body">'+blocks.map(block=>{
      let joined='';
      for(const part of block.parts){
        if(!part)continue;
        if(!joined)joined=part;
        else if(/^[),.;:!?]/.test(part)||/[(]$/.test(joined))joined+=part;
        else if(/[가-힣]$/.test(joined)&&/^(?:에|의|은|는|이|가|을|를|와|과|로|도|만|부터|까지|에서|에게|께)(?=\s|[,.!?;:]|$)/.test(part))joined+=part;
        else if(/[가-힣]$/.test(joined)&&/^(?:인다|는다|었다|았다|겠다|한다|했다|이다)(?=\W|$)/.test(part))joined+=part;
        else joined+=' '+part;
      }
      if(block.kind==='number')return '<div class="solution-readable-item"><span class="solution-readable-marker">'+E(block.marker)+'</span><div class="solution-readable-text">'+E(joined)+'</div></div>';
      if(block.kind==='name')return '<p class="solution-readable-paragraph solution-name-row">'+E(joined)+'</p>';
      return '<p class="solution-readable-paragraph">'+E(joined)+'</p>';
    }).join('')+'</div>';
  }
  function conceptBody(source){
   const bullets=/^[○◯●•▪▶►]\s*(.*)$/;
   const details=/^[-–—]\s*([^:：]{1,12})\s*[:：]\s*(.*)$/;
   const nums=/^([①②③④⑤⑥⑦⑧⑨⑩]|[1-9][0-9]*[.)]|[ㄱㄴㄷㄹㅁㅂ][.)])\s*(.*)$/;
   const title=/(?:이론|개요|비교|요인|구성|분류|특성|절차|방법|원리|의의|장단점|동기요인과\s*위생요인)\s*(?:\([^)]*\))?$/;
   const lines=String(source||'').replace(/([^\n])[ \t]+(?=[○◯●•▪▶►]\s)/g,'$1\n').split('\n');
   const pieces=[];let cur=null;
   function flush(){if(cur){pieces.push(cur);cur=null;}}
   for(const raw of lines){
    const line=raw.trim();if(!line){flush();continue;}
    if(line===')')continue;
    const b=line.match(bullets),d=line.match(details),n=line.match(nums);
    if(b||d||n){flush();cur={kind:b?'bullet':d?'detail':'number',label:d?d[1]:n?n[1]:'',parts:[b?b[1]:d?d[2]:n[2]]};}
    else if(line.length<90&&title.test(line)&&!/[.!?。；;:]$/.test(line)){flush();pieces.push({kind:'heading',label:'',parts:[line]});}
    else if(cur)cur.parts.push(line);
    else cur={kind:'paragraph',label:'',parts:[line]};
   }
   flush();
   let html='',group=false;
   for(const p of pieces){
    const val=E(p.parts.join(' ').replace(/\s+([,.;:!?])/g,'$1'));
    if(p.kind==='heading'){
     if(group){html+='</div>';group=false;}
     html+='<div class="solution-concept-subhead">'+val+'</div>';
    }else if(p.kind==='bullet'){
     if(group){html+='</div>';group=false;}
     if(/^(?:동기\s*요인|위생\s*요인)(?=\s|\(|$)/.test(p.parts.join(' '))){html+='<div class="solution-concept-group">';group=true;}
     html+='<div class="solution-concept-point"><span class="solution-concept-dot">•</span><span>'+val+'</span></div>';
    }else if(p.kind==='detail'){
     html+='<div class="solution-concept-detail"><strong>'+E(p.label)+'</strong><span>'+val+'</span></div>';
    }else if(p.kind==='number'){
     html+='<div class="solution-concept-point"><span class="solution-concept-dot">'+E(p.label)+'</span><span>'+val+'</span></div>';
    }else{
     if(group){html+='</div>';group=false;}
     html+='<p class="solution-readable-paragraph">'+val+'</p>';
    }
   }
   if(group)html+='</div>';
   return '<div class="solution-concept-body">'+html+'</div>';
  }
  if(!hits.length)return body(original,false);
  let out=body(original.slice(0,hits[0].index),false);
  for(let i=0;i<hits.length;i++){
    const hit=hits[i],start=hit.index+hit[0].length,end=i+1<hits.length?hits[i+1].index:original.length;
    const isNamed=/개념\s*정리|풀이\s*과정/.test(hit[1]);
    out+='<section class="solution-render-section"><div class="solution-section-title">'+E(hit[1].replace(/\s+/g,''))+'</div>'+(/개념\s*정리/.test(hit[1])?conceptBody(original.slice(start,end)):body(original.slice(start,end),isNamed))+'</section>';
  }
  return out;
 }
 function formatSolution(value){
  const source=String(value||'').replace(/\r\n?/g,'\n').replace(/\u00a0/g,' ');
  const headings=/(정답\s*해설|오답\s*분석|개념\s*정리)\s*[:：]?/g;
  const hits=[...source.matchAll(headings)];
  if(!hits.length)return formatSolutionBody(source,false);
  let result='',cursor=0,section='';
  for(const hit of hits){
    if(hit.index>cursor)result+=formatSolutionBody(source.slice(cursor,hit.index),section==='개념정리');
    const title=hit[1].replace(/\s+/g,'');
    result+='<div class="solution-line"><strong>'+E(title)+'</strong></div>';
    section=title;cursor=hit.index+hit[0].length;
  }
  return result+formatSolutionBody(source.slice(cursor),section==='개념정리');
 }
 function formatSolutionBody(text,isConcept){
  let input=String(text||'').trim();
  if(!input)return '';
  if(isConcept){
    input=input.replace(/(?:개인\s*)?교재\s*(\d{2,4})\s*(?:페이지|쪽|p\b)?|(?:[pP]\.?\s*)(\d{2,4})\b|(\d{2,4})\s*(?:페이지|쪽)/g,(_,a,b,c)=>'(교재 '+(a||b||c)+'페이지)');
  }
  // Remove only a closing parenthesis that appears alone, not parentheses within text.
  input=input.replace(/(^|\n)\s*\)\s*(?=\n|$)/g,'$1');
  if(isConcept){
    // A standalone three-digit reference in this section denotes a textbook page.
    input=input.replace(/(^|\n)\s*(\d{3})\s*(?=\n|$)/g,(_,prefix,page)=>prefix+'(교재 '+page+'페이지)');
    input=input.replace(/\b625\b(?!\s*(?:페이지|쪽|[a-zA-Z%]|\d))/g,'(교재 625페이지)');
    input=input.replace(/\(교재\s*\(교재\s*(\d+)페이지\)페이지\)/g,'(교재 $1페이지)');
  }
  const lines=isConcept
   ?input.replace(/\n+/g,' ').replace(/\s+(?=[①②③④⑤⑥⑦⑧⑨⑩](?:\s|[가-힣])|[•▪●◦▶►]\s|[1-9][0-9]*[.)]\s)/g,'\n').split('\n')
   :input.replace(/\n+/g,' ').replace(/\s+(?=[①②③④⑤⑥⑦⑧⑨⑩](?:\s|[가-힣])|[•▪●◦▶►]\s|[1-9][0-9]*[.)]\s)/g,'\n').split('\n');
  return lines.map(line=>{
    let t=line.trim().replace(/[ \t]{2,}/g,' ');
    if(!t)return '';
    t=t.replace(/^([•▪●◦▶►])\s*/,'• ').replace(/^([1-9][0-9]*)[.)]\s*/,'$1. ');
    const m=t.match(/^((?:[①②③④⑤⑥⑦⑧⑨⑩]|[1-9][0-9]*\.|•))\s*(.*)$/);
    return m?'<div class="solution-line solution-numbered"><span class="solution-marker">'+E(m[1])+'</span><span class="solution-content">'+E(m[2].trim())+'</span></div>':'<div class="solution-line">'+E(t)+'</div>';
  }).join('');
 }
 function formatQuestionStatements(value){
  const source=String(value||'');
  const parts=source.split(/\r?\n/);
  const label=/^\s*([ㄱㄴㄷㄹㅁㅂ])[.)]\s*(.*)$/;
  const matched=parts.filter(x=>label.test(x));
  if(matched.length<2)return '<div class="question-text">'+E(source)+'</div>';
  let result='',buffer=[],rows=[];
  function plain(){if(buffer.length){result+='<div class="question-text">'+E(buffer.join('\n'))+'</div>';buffer=[];}}
  function tab(){if(rows.length){result+='<table class="question-statement-table"><tbody>'+rows.map(x=>'<tr><th scope="row">'+E(x[0])+'</th><td>'+E(x[1])+'</td></tr>').join('')+'</tbody></table>';rows=[];}}
  for(const part of parts){
   const m=part.match(label);
   if(m){plain();rows.push([m[1],m[2]]);}
   else if(rows.length&&part.trim()){rows[rows.length-1][1]+='\n'+part;}
   else {tab();buffer.push(part);}
  }
  tab();plain();return result;
 }
 function readableQuestionOcr(value){
  let text=String(value||'').replace(/\r\n?/g,'\n');
  // Conservative spacing improvements in the display layer; the original exam content remains unchanged.
  const rules=[
   [/산업안전보건기준에관한규칙상/g,'산업안전보건기준에 관한 규칙상 '],
   [/산업안전보건법령상/g,'산업안전보건법령상 '],
   [/산업안전보건법상/g,'산업안전보건법상 '],
   [/에관한/g,'에 관한 '],
   [/에대한/g,'에 대한 '],
   [/에따른/g,'에 따른 '],
   [/에서정하는/g,'에서 정하는 '],
   [/에해당한다/g,'에 해당한다'],
   [/옳지않은것은/g,'옳지 않은 것은'],
   [/옳은것을모두고른것은/g,'옳은 것을 모두 고른 것은'],
   [/옳은것은/g,'옳은 것은'],
   [/아닌것은/g,'아닌 것은'],
   [/모두고른것은/g,'모두 고른 것은'],
   [/할수있는/g,'할 수 있는 '],
   [/할수있다/g,'할 수 있다'],
   [/할수없다/g,'할 수 없다'],
   [/해야한다/g,'해야 한다'],
   [/및/g,' 및 '],
   [/또는/g,' 또는 ']
  ];
  for(const [pattern,replacement] of rules)text=text.replace(pattern,replacement);
  return text.replace(/[ \t]{2,}/g,' ');
 }
 function questionDisplayParts(q){
  const original=String(q.text||'');
  if(Array.isArray(q.options)&&q.options.length===5&&q.options.every(x=>String(x||'').trim()))return {text:original,options:q.options};
  const found=[...original.matchAll(/^[ \t]*([①②③④⑤])[ \t]*/gm)];
  const last=found.slice(-5);
  // Choose the last complete set: some legal texts contain article numbers ①, ②, ③ in the stem.
  if(last.length!==5||last.map(m=>m[1]).join('')!=='①②③④⑤')return {text:original,options:null};
  const options=last.map((mark,i)=>original.slice(mark.index+mark[0].length,i===4?original.length:last[i+1].index).trim());
  if(options.some(option=>!option))return {text:original,options:null};
  let text=original.slice(0,last[0].index).trim();
  // The app metadata already shows the question number; avoid a lonely number above the stem.
  if(String(q.id||'').startsWith('2026-'))text=text.replace(new RegExp('^\\s*'+Number(q.no||0)+'\\s*[.)]\\s*'),'').trim();
  if(q.year===2026&&q.subject==='law'&&q.no===5){
    const spaced=[
      '산업안전보건법령상 산업재해예방계획에 관한 설명으로 옳은 것을 모두 고른 것은?',
      'ㄱ. 사업장의 산업재해예방계획의 수립에 관한 사항은 안전보건관리책임자가 총괄하여 관리하는 업무에 해당한다.',
      'ㄴ. 산업재해예방 관련 업무를 하는 단체에 소속된 임직원 중에서 해당 단체가 추천하여 위촉된 명예산업안전감독관의 업무에 사업장 산업재해예방계획 수립 참여는 포함되지 않는다.',
      'ㄷ. 고용노동부장관은 산업재해예방계획을 효율적으로 시행하기 위하여 필요하다고 인정하는 사항에 대하여 ｢공공기관의 운영에 관한 법률｣ 제4조에 따른 공공기관의 장에게 협조를 요청할 수 있다.',
      'ㄹ. 산업재해예방계획의 적정성은 안전보건진단의 종류 중 안전진단에 해당한다.'
    ].join('\n');
    if(text.replace(/\s/g,'')===spaced.replace(/\s/g,''))text=spaced;
  }
  if(q.year===2026&&q.subject==='law'&&(q.no===1||q.no===2)){
    const spaced=q.no===1?'산업안전보건법령상 안전보건관리체계에 관한 규정의 내용이다. (  )에 들어갈 내용을 옳게 나열한 것은?\n\n사업주는 사업장에 작업환경의 점검 등에 관한 사항 중 안전에 관한 기술적인 사항에 관하여 사업주 또는 ( ㄱ )를 보좌하고 ( ㄴ )에게 지도ㆍ조언하는 업무를 수행하는 ( ㄷ )를 두어야 한다.':'산업안전보건법령상 외딴곳이 아닌 곳에서 상시근로자 300명 미만을 사용하는 사업장의 사업주가 업종별 보건관리전문기관에 보건관리 업무를 위탁할 수 있는 사업은?';
    if(text.replace(/\s/g,'')===spaced.replace(/\s/g,''))text=spaced;
    if(q.no===2){options[3]='운수 및 창고업';options[4]='전기장비 제조업';}
  }
  if(q.year===2026&&q.subject==='law'&&q.no===6&&text.includes('안전보건표지색채'))text='산업안전보건법령상 안전보건표지 색채의 사용례 중 노란색에 대한 보조색은?';
  return {text:readableQuestionOcr(text),options:options.map(option=>readableQuestionOcr(option).replace(/\n+/g,' ').trim())};
 }

 function question(){const q=course.questions.find(q=>String(q.id)===currentId);if(!q)return `<div class="empty">문항을 찾지 못했습니다.<button data-action="all-questions">문제은행으로</button></div>`;const r=rec(q.id),answers=Array.isArray(q.answer)?q.answer:[q.answer];const canGrade=q.answer!=null;const warning=(q.lawAdapted?`<div class="notice info">${E(q.adaptationNote)} · 원래 출제연도는 ${q.year}년입니다.</div>`:'')+(q.lawReview==='pending'?'<div class="notice">현행법 검토 대기 · 수록 자료의 문제·정답입니다. 2026년 개정법 반영 문제로 확정되지 않았습니다.</div>':q.lawReview==='verified'?'<div class="notice info">2026년 현행법 대조 완료 · 변경 근거는 해설에서 확인하세요.</div>':'');let ex=`<div class="prose solution-prose">${formatConceptOnly(q.explanation||'공식 정답은 확인됐으며 상세 해설은 검토 중입니다.')}</div>`;
 const bookImages=q.textbookExplanationImages||[];
 const bookBody=bookImages.length?`<p class="caption">개인교재 원본 해설 · ${q.year}년 ${q.no}번${q.page?` · 교재 ${q.page}쪽`:''}</p>${q.lawReview||q.subject==='law'?'<p class="notice">교재 발행 당시의 해설입니다. 개정된 규정은 2026년 기준 풀이·해설과 근거 법령을 확인하세요.</p>':''}${q.lawAdapted?'<p class="notice">이 문항은 개정법에 맞춰 수정되었습니다. 교재 원본의 문제·정답과 앱의 문제·정답이 다를 수 있습니다.</p>':''}${bookImages.map(src=>qImage(src,'개인교재 원본 해설')).join('')}`:q.year===2026?'<p class="small muted">2026년 문제는 이 개인교재에 수록되어 있지 않습니다.</p>':course.questions.some(x=>x.textbookExplanationImages?.length)?'<p class="small muted">이 문항은 교재 원본 해설 이미지를 아직 확보하지 못했습니다. 위 풀이·해설을 이용해 주세요.</p>':'<p class="small">개인학습자료 JSON을 한 번 불러오면 교재 원본 해설이 이 기기에 저장되어 다음 실행부터 자동으로 연결됩니다.</p><button data-action="settings">개인학습자료 불러오기</button>';
 const display=questionDisplayParts(q),displayOptions=display.options,officialImageFirst=q.year===2026&&q.questionImages?.length&&!Array.isArray(q.options)&&!(q.subject==='law'&&[1,2,5,6].includes(q.no));
 const explanationPanels=disclosure(q.lawReview==='verified'?'2026년 기준 풀이·해설 보기':'풀이·해설 보기',ex)+disclosure('개인교재 원본 해설 보기',bookBody);
 const relatedLessons=(course.theory?.[q.subject]||[]).map((t,i)=>({...t,index:i})).filter(t=>(q.topicKey&&t.body.includes(q.topicKey))||t.title.includes(q.topic?.split(' ')[0]||'__')).slice(0,5);
 return `<button class="back text-btn" data-action="all-questions">← 문제 목록</button><div class="question-layout"><section class="card question-card">${meta(q)}${warning}${officialImageFirst?`<p class="question-original-label">공식 문제 원문 · 정확한 띄어쓰기 확인 (터치하여 확대)</p><div class="question-official-scan">${q.questionImages.map(src=>qImage(src)).join('')}</div>${disclosure('문제 텍스트 보기 · 띄어쓰기 일부 보정',formatQuestionStatements(display.text))}`:displayOptions?formatQuestionStatements(display.text):q.questionImages?.length?q.questionImages.map(src=>qImage(src)).join(''):formatQuestionStatements(display.text)}${q.table?tableMarkup(q.table):''}${q.questionImages?.length&&!officialImageFirst?(displayOptions?disclosure('문제 원문 보기',q.questionImages.map(src=>qImage(src)).join('')):'<div class="image-hint">원문을 누르면 확대할 수 있습니다.</div>'):''}<div class="${displayOptions?'options':'number-options'}">${NUM.map((n,i)=>`<button class="option ${choice===i+1?'selected':''}" data-choice="${i+1}" aria-pressed="${choice===i+1}" ${revealed?'disabled':''}><span class="option-num">${n}</span>${displayOptions?`<span class="option-body">${E(displayOptions[i])}</span>`:''}</button>`).join('')}</div>${revealed?`<div class="result" role="status">${canGrade?`${q.lawReview==='pending'?'수록 정답(현행법 검토 대기)':'정답'}: <span class="answer-num">${answers.map(a=>NUM[a-1]).join(', ')}</span> <span class="muted small">${C.answerMatches(q,choice)?'정답입니다.':'다시 확인해 보세요.'}</span>`:'정답 검증 대기 · 채점하지 않습니다.'}</div><button class="wide" data-action="retry">다시 풀기</button>`:`<button class="primary wide" data-action="grade" ${choice?'':'disabled'}>정답 확인</button>`}<div class="question-actions"><button data-action="star" aria-pressed="${!!r.starred}">${r.starred?'★ 즐겨찾기 해제':'☆ 즐겨찾기'}</button><button data-action="next-question">다음 문제 →</button></div><p class="footer-note">${E(q.source||'한국산업인력공단 Q-Net 공개 기출')} · ${q.page?`원문 ${q.page}쪽`:''}</p></section><aside class="explain-panel">${revealed?explanationPanels:'<div class="card"><h3>풀이·해설</h3><p class="muted small">답을 선택하고 정답을 확인하면 해설 버튼을 사용할 수 있습니다. 해설은 직접 눌러야 펼쳐집니다.</p></div>'}${disclosure('관련 이론 공부',relatedLessons.length?relatedLessons.map(t=>`<button class="list-item" data-lesson="${t.index}" data-lesson-subject="${q.subject}">${E(t.title)} →</button>`).join(''):`<button data-theory-subject="${q.subject}">${E(subjectName(q.subject))} 전체 이론 보기</button>`)}${q.subject==='law'||q.lawReview?disclosure('근거 법령 원문 보기',legalSources(q)):''}${disclosure('관련 강의 보기',relatedVideos(q).map(videoMini).join('')||`<p class="muted small">연결된 강의가 없습니다.</p><button data-video-subject="${q.subject==='law'?'':q.subject}">전체 강의에서 찾아보기</button>`)}${disclosure('내 메모',`<label class="small" for="q-note">이 문제에서 기억할 내용</label><textarea id="q-note" class="notes" maxlength="10000" placeholder="메모는 이 기기에 저장됩니다.">${E(r.note||'')}</textarea><button data-action="save-note">메모 저장</button>`)}</aside></div>`;}
 function relatedVideos(q){const words=(q.topic||'').split(/[·ㆍ,()<>\s]+/).filter(t=>t.length>1);return (course.videos||[]).filter(v=>v.subject===q.subject&&words.some(w=>(v.title+' '+(v.topic||'')).includes(w))).slice(0,4);}
 function videoMini(v){return `<a class="list-item" href="https://www.youtube.com/watch?v=${E(v.id)}" target="_blank" rel="noopener">${E(v.title)} ↗</a>`;}
 const annexCache=new Map();
 function integratedTheory(item){
  if(!item.legalSections)return `<div class="prose">${E(item.body)}</div>`;
  const lead=item.applicationNote||'';
  const names={law:'산업안전보건법',decree:'산업안전보건법 시행령','enforcement-rule':'산업안전보건법 시행규칙','safety-standards':'산업안전보건기준에 관한 규칙'};
  return `<p class="prose small">${E(lead)}</p>`+Object.entries(names).map(([key,name])=>{const articles=item.legalSections.filter(a=>a.lawKey===key);return articles.length?`<section class="theory-law-section"><h3>${E(name)}</h3>${articles.map(a=>`<div class="prose section-gap">${E(a.text)}</div>`).join('')}</section>`:''}).join('')+(item.annexIds?.length?`<section class="theory-annexes section-gap"><h3>이 단원의 관련 별표 원문</h3><p class="caption">표의 항목·수치·그림을 원본 그대로 수록했습니다. 이미지를 누르면 확대할 수 있습니다.</p>${item.annexIds.map(id=>{const a=window.LAW_ANNEXES?.[id];return a?`<section class="theory-annex section-gap"><h3>${E(names[a.lawKey])} 별표 ${E(a.no)}</h3><p class="small">${E(a.title)} · ${a.pageCount}쪽</p><div data-annex-host="${E(id)}"><p class="caption">별표 원문을 불러오고 있습니다…</p></div><details class="disclosure"><summary>별표 글자 검색·복사</summary><div class="details-body prose small">${E(a.text)}</div></details><p class="caption"><a href="${E(a.source)}" target="_blank" rel="noopener">국가법령정보센터 원본 ↗</a></p></section>`:''}).join('')}</section>`:'');
 }
 async function loadTheoryAnnex(host){
  const id=host.dataset.annexHost;if(!window.LAW_ANNEXES?.[id])return;
  try{let data=annexCache.get(id);if(!data){const response=await fetch(ASSET+'annexes/'+id+'.json');if(!response.ok)throw new Error('별표 파일을 불러오지 못했습니다.');data=await response.json();if(data.id!==id||!Array.isArray(data.pages)||data.pages.some(src=>!/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(src)))throw new Error('별표 자료 형식을 확인해 주세요.');annexCache.set(id,data);}host.innerHTML=data.pages.map((src,i)=>`<figure style="margin:16px 0">${qImage(src,'별표 원문 '+(i+1)+'쪽')}<figcaption class="caption">${i+1} / ${data.pages.length}쪽</figcaption></figure>`).join('');}
  catch(e){host.innerHTML=`<p class="notice">${E(e.message)} 처음 저장할 때는 인터넷에 연결해 주세요.</p><button data-annex-retry="${E(id)}">다시 불러오기</button>`;}
 }
 function theory(){const lessons=course.theory?.[lessonSubject]||[],item=lessons[lessonIndex];return header('전체 이론','모든 단원을 자유롭게 열고, 관련 기출로 이어서 공부하세요.')+`<div class="filters"><select id="theory-subject" aria-label="이론 과목">${Object.entries(C.SUBJECTS).map(([k,n])=>`<option value="${k}" ${lessonSubject===k?'selected':''}>${E(n)}</option>`).join('')}</select><input type="search" id="theory-search" placeholder="단원 찾기" aria-label="이론 단원 검색"></div><div class="theory-layout"><nav class="theory-menu" aria-label="단원 목차">${lessons.map((t,i)=>`<button class="${lessonIndex===i?'active':''}" data-lesson="${i}" data-lesson-subject="${lessonSubject}" data-lesson-title="${E(t.title)}">${lessonDone[lessonSubject+'-'+i]?'✓ ':''}${String(i+1).padStart(2,'0')}. ${E(t.title)}</button>`).join('')}</nav><article class="card theory-body">${item?`<span class="tag">${lessonIndex+1} / ${lessons.length}</span><h2 style="margin-top:15px">${E(item.title)}</h2><p class="caption">${item.lawBasisDate?'2026-10-18 기준 · 관련 법·시행령·시행규칙·안전보건규칙 및 별표 통합 수록':'교재 기반 이론 수록본'}</p>${integratedTheory(item)}${item.trap?`<div class="focus-box"><strong>헷갈리는 부분</strong><div class="prose">${E(item.trap)}</div></div>`:''}${item.references?`<p class="caption section-gap">근거: ${E(item.references)}</p>`:''}<div class="row section-gap"><button class="primary" data-action="lesson-done">${lessonDone[lessonSubject+'-'+lessonIndex]?'학습완료 해제':'이 단원 학습완료'}</button><button data-action="lesson-questions">관련 과목 기출 풀기</button></div>${disclosure('관련 강의',relatedVideos({subject:lessonSubject,topic:item.title}).map(videoMini).join('')||'<p class="muted small">해당 단원과 직접 연결된 강의는 아직 없습니다.</p>')}`:'<div class="empty">이 과목의 이론을 준비 중입니다.</div>'}</article></div>`;}
 function videos(){const list=(course.videos||[]).filter(v=>(!videoSubject||v.subject===videoSubject)&&(!videoTopic||(v.topic||'').split('·').includes(videoTopic))&&(!videoSearch||(v.title+' '+(v.topic||'')+' '+(v.channel||'안전25시')).includes(videoSearch)));return header('과목별 강의','2과목 도사 안땅 · 3과목 안전25시. 원하는 강의를 자유롭게 시청하세요.')+`<div class="filters"><select id="video-subject" aria-label="강의 과목"><option value="">전체 과목</option><option value="general" ${videoSubject==='general'?'selected':''}>2과목 산업안전일반</option><option value="corp" ${videoSubject==='corp'?'selected':''}>3과목 기업진단·지도</option></select><select id="video-topic" aria-label="강의 분야"><option value="">전체 분야</option>${[...new Set((course.videos||[]).filter(v=>!videoSubject||v.subject===videoSubject).flatMap(v=>(v.topic||'').split('·')).filter(Boolean))].map(t=>`<option value="${E(t)}" ${videoTopic===t?'selected':''}>${E(t)}</option>`).join('')}</select><input id="video-search" type="search" placeholder="강의 제목·분야·채널 검색" value="${E(videoSearch)}" aria-label="강의 검색"></div><p class="caption">${list.length}개 영상 · 2과목 본강의 1~18강과 보충영상 5개를 재생목록 순서로 수록했습니다. 시청완료 표시는 직접 체크합니다.</p><p class="small"><a href="https://www.youtube.com/playlist?list=PL4qdz5_p-1Q0G_o4Ee6U4h27zCYzhJtou" target="_blank" rel="noopener">도사 안땅 2과목 전체 재생목록 ↗</a></p><div class="videos">${list.map(v=>`<article class="card video-card"><img class="video-thumbnail" src="https://i.ytimg.com/vi/${E(v.id)}/hqdefault.jpg" alt="${E(v.title)} 썸네일" loading="lazy"><div class="video-content"><span class="tag teal">${E(subjectName(v.subject))}</span><p class="caption">${E(v.channel||'안전25시')}${v.topic?' · '+E(v.topic):''}${v.duration?' · '+Math.floor(v.duration/60)+'분 '+(v.duration%60)+'초':''}</p><h3 style="margin:12px 0">${E(v.title)}</h3><div id="player-${E(v.id)}"></div><div class="video-actions"><button data-play="${E(v.id)}">▶ 앱에서 재생</button><a href="https://www.youtube.com/watch?v=${E(v.id)}" target="_blank" rel="noopener">유튜브에서 열기 ↗</a><button data-video-done="${E(v.id)}" aria-pressed="${!!videoDone[v.id]}">${videoDone[v.id]?'✓ 시청완료':'시청완료 체크'}</button></div></div></article>`).join('')||'<div class="empty">조건에 맞는 강의가 없습니다. 과목·분야·검색어를 변경해 주세요.</div>'}</div><p class="footer-note">영상 재생에는 인터넷 연결이 필요합니다. 오래된 영상의 법령 설명은 현재 시행 법령과 함께 확인하세요.</p>`;}
 function recordView(){const attempted=Object.values(records).filter(r=>r.attempts),wrong=attempted.filter(r=>!r.correct);return header('내 공부 기록','이 브라우저에 저장된 학습 기록입니다.')+`<div class="stats"><div class="card stat"><span class="stat-label">풀어본 문제</span><strong>${attempted.length}</strong></div><div class="card stat"><span class="stat-label">다시 볼 오답</span><strong>${wrong.length}</strong></div><div class="card stat"><span class="stat-label">즐겨찾기</span><strong>${Object.values(records).filter(r=>r.starred).length}</strong></div></div><div class="grid section-gap">${Object.entries(C.SUBJECTS).map(([s,n])=>{const qs=course.questions.filter(q=>q.subject===s),done=qs.filter(q=>rec(q.id).attempts),ok=done.filter(q=>rec(q.id).correct);return `<section class="card"><h3>${E(n)}</h3><p>${done.length} / ${qs.length}문제</p><div class="small muted">정답률 ${done.length?Math.round(ok.length/done.length*100):0}%</div><div class="bar"><span style="width:${qs.length?done.length/qs.length*100:0}%"></span></div></section>`;}).join('')}</div><div class="row section-gap"><button class="primary" data-action="wrong">오답 다시 풀기</button><button data-action="starred">즐겨찾기 보기</button><button data-action="export-records">기록 내보내기</button><label class="file-label">기록 복원<input type="file" accept=".json" data-import="records"></label></div><p class="caption section-gap">PC와 휴대폰의 기록은 자동 동기화되지 않습니다. ‘기록 내보내기’와 ‘기록 복원’으로 옮길 수 있습니다.</p>`;}
 function laws(){const reviewed=course.questions.filter(q=>q.lawReview==='verified').length,pending=course.questions.filter(q=>q.lawReview==='pending').length;return header('법령 원문','법률·시행령·시행규칙·안전보건기준 규칙을 구분해 확인하세요.')+`<div class="notice">법령 기준일: 2026년 10월 18일 · 법령·고시 관련 문항 대조 ${reviewed}개 · 개정 응용 ${course.questions.filter(q=>q.lawAdapted).length}개. 전체 1,050문항 중 비법령 문항을 법령 검증 건수로 계산하지 않습니다.</div><section class="card section-gap"><h3>2026년 개정 적용 기준</h3><p class="small">위험성평가 의무·절차는 2026년 6월 1일 시행 규정을 반영합니다. 위험성평가 과태료는 50명 이상(건설공사 50억원 이상)은 2027년 1월 1일, 그 미만은 2028년 1월 1일 시행으로 구분합니다. 법 제49조 및 제56조제1항제2호 개정규정은 부칙에 따라 2026년 12월 1일 이후 발생한 산업재해부터 적용합니다.</p><p class="small">수록 본문은 2026년 10월 18일 기준입니다. 법 제117조의 7월 7일 즉시시행 개정분을 반영하고, 12월 명칭 변경 및 2027년 외국인 기초교육 등 미래 시행사항은 현재 의무와 구분합니다. 별표·별지의 표·서식은 공식 원문에서 함께 확인합니다.</p></section>${(historyData?.reviewSummary?.limitations||[]).map(t=>`<p class="caption">${E(t)}</p>`).join('')}${(historyData?.clauses||[]).map(c=>disclosure(c.law+' '+c.article+' 원문',`<div class="prose small">${E(c.text)}</div><a href="${E(c.url)}" target="_blank" rel="noopener">공식 조문 ↗</a>`)).join('')}<div class="list">${[['law','산업안전보건법'],['decree','산업안전보건법 시행령'],['enforcement-rule','산업안전보건법 시행규칙'],['safety-standards','산업안전보건기준에 관한 규칙']].map(([k,n])=>`<section class="card"><h3>${n}</h3><div class="row"><button data-law="${k}">수록된 전체 원문 펼치기</button><a href="https://www.law.go.kr/법령/${encodeURIComponent(n)}" target="_blank" rel="noopener">공식 현행 원문 ↗</a></div><div id="law-${k}"></div></section>`).join('')}</div><p class="footer-note">수록본의 시행일은 원문 상단에 표시됩니다. 별표·별지와 이후 개정사항은 공식 현행 원문에서 함께 확인하세요.</p>`;}
 function settings(){return header('자료와 설정','개인 교재와 학습 기록을 관리하세요.')+`<section class="card"><h2>학습자료</h2><p>${E(course.title||'2026년 공식 기출')} · ${course.questions.length}문제</p><p class="small">개인교재 원본 해설 ${course.questions.filter(q=>q.textbookExplanationImages?.length).length}문항 연결 · 한 번 불러오면 이 기기에서 다음 실행부터 자동으로 표시됩니다.</p><div class="row">${importLabel()}<button data-action="remove-import">불러온 개인자료 해제</button></div><p class="caption section-gap">공개 GitHub에는 상업 교재 PDF와 교재 해설을 올리지 않습니다. 개인학습자료는 브라우저 내부에 저장하며 서버로 전송하지 않습니다.</p></section><section class="card section-gap"><h2>진행 상태</h2><div class="prose small">${E(course.status||'2026년 공식 기출 수록 · 법령 대조 및 상세 해설 검토 중')}</div></section><section class="card section-gap"><h2>PC·모바일 화면</h2><p class="small">화면 폭에 따라 자동 조정됩니다. 각 전용 주소도 사용할 수 있습니다.</p><div class="row"><a href="../pc-v9/">PC 화면</a><a href="../mobile-v9/">모바일 화면</a><button id="install-btn" class="hidden">홈 화면에 설치</button></div><p class="install-help section-gap">아이폰: Safari 공유 → 홈 화면에 추가<br>안드로이드: Chrome 메뉴 → 홈 화면에 추가 또는 앱 설치<br>인터넷이 끊겨도 저장된 학습자료와 기본 화면을 볼 수 있습니다. 강의는 인터넷이 필요합니다.</p></section><section class="card section-gap"><h2>기록 백업</h2><div class="export-row"><button data-action="export-records">기록 내보내기</button><label class="file-label">기록 복원<input type="file" accept=".json" data-import="records"></label></div></section><p class="footer-note">v9.0 · 2026년 문제 출처: 한국산업인력공단 Q-Net · 과년도: 교재 전사본 · 수정문항: 현행법 기출 응용문제.</p>`;}
 async function importFile(file,type){try{if(file.size>180*1024*1024)throw new Error('180MB 이하의 파일을 선택해 주세요.');toast('학습자료를 읽고 있습니다…');const data=JSON.parse(await file.text());if(type==='course'){C.validateCourse(data);const merged=applyLawUpdates(C.mergeCourses(base,data));let stored=true;try{await persistCourse(data);}catch(e){stored=false;}course=merged;filter={subject:'',year:'',topic:'',mode:'all',search:''};view='home';render();toast(stored?`${data.questions.length}문제를 불러와 이 기기에 저장했습니다.`:'자료를 불러왔습니다. 자동 저장에 실패해 창을 닫으면 다시 불러와야 합니다.');}else{if(data.type!=='jidosa-records-v9'||!data.records||typeof data.records!=='object'||Array.isArray(data.records))throw new Error('학습 기록 파일이 아닙니다.');for(const [id,r] of Object.entries(data.records)){if(!r||typeof r!=='object'||!Number.isFinite(r.attempts||0)||typeof(r.note||'')!=='string')throw new Error('학습 기록 값이 올바르지 않습니다.');}records={...records,...data.records};lessonDone={...lessonDone,...(data.lessonDone||{})};videoDone={...videoDone,...(data.videoDone||{})};lastQuestion=data.lastQuestion||lastQuestion;save();render();toast('기록을 복원했습니다.');}}catch(e){toast('불러오기 실패: '+e.message);}}
 function bindLocal(){document.querySelectorAll('[data-annex-host]').forEach(host=>loadTheoryAnnex(host));document.querySelectorAll('[data-import]').forEach(el=>el.onchange=()=>{if(el.files[0])importFile(el.files[0],el.dataset.import);});const f=[['#f-subject','subject'],['#f-year','year'],['#f-topic','topic'],['#f-mode','mode']];f.forEach(([sel,key])=>{if($(sel))$(sel).onchange=e=>{filter[key]=e.target.value;if(key==='subject')filter.topic='';page=0;render();};});if($('#q-search'))$('#q-search').oninput=e=>{filter.search=e.target.value;page=0;clearTimeout(bindLocal.timer);bindLocal.timer=setTimeout(()=>{const pos=e.target.selectionStart;render();$('#q-search').focus();$('#q-search').setSelectionRange(pos,pos);},220);};if($('#theory-subject'))$('#theory-subject').onchange=e=>{lessonSubject=e.target.value;lessonIndex=0;render();};if($('#theory-search'))$('#theory-search').oninput=e=>{document.querySelectorAll('[data-lesson-title]').forEach(b=>b.hidden=!b.dataset.lessonTitle.includes(e.target.value));};if($('#video-subject'))$('#video-subject').onchange=e=>{videoSubject=e.target.value;videoTopic='';render();};if($('#video-topic'))$('#video-topic').onchange=e=>{videoTopic=e.target.value;render();};if($('#video-search'))$('#video-search').oninput=e=>{videoSearch=e.target.value;clearTimeout(bindLocal.videoTimer);bindLocal.videoTimer=setTimeout(()=>{render();$('#video-search').focus();},250);};if($('#install-btn')&&window.installPrompt){$('#install-btn').classList.remove('hidden');$('#install-btn').onclick=async()=>{await window.installPrompt.prompt();window.installPrompt=null;};}}
 document.addEventListener('click',async e=>{const b=e.target.closest('button,a[data-nav]');if(!b||b.disabled)return;if(b.dataset.nav){go(b.dataset.nav);return;}if(b.dataset.subject){filter.subject=b.dataset.subject;filter.year='';filter.topic='';filter.mode='all';filter.search='';go('questions');return;}if(b.dataset.question){openQuestion(b.dataset.question);return;}if(b.dataset.choice){choice=Number(b.dataset.choice);render();return;}if(b.dataset.lesson!==undefined){lessonSubject=b.dataset.lessonSubject;lessonIndex=Number(b.dataset.lesson);view='theory';render();return;}if(b.dataset.theorySubject){lessonSubject=b.dataset.theorySubject;lessonIndex=0;go('theory');return;}if(b.dataset.videoSubject!==undefined){videoSubject=b.dataset.videoSubject;go('videos');return;}if(b.dataset.videoDone){videoDone[b.dataset.videoDone]=!videoDone[b.dataset.videoDone];save();render();return;}if(b.dataset.play){const id=b.dataset.play;if(!/^[\w-]{11}$/.test(id))return;const host=$('#player-'+id);host.innerHTML=`<iframe class="video-player" title="학습 강의" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;return;}if(b.dataset.annexRetry){const host=document.querySelector('[data-annex-host="'+b.dataset.annexRetry+'"]');if(host)loadTheoryAnnex(host);return;}if(b.dataset.image){const src=b.dataset.image;$('#image-view').src=src.startsWith('data:')?src:ASSET+src;$('#image-modal').showModal();return;}if(b.dataset.law){const k=b.dataset.law;const host=$('#law-'+k);if(host.textContent){host.innerHTML='';b.textContent='수록된 전체 원문 펼치기';return;}b.disabled=true;try{let text=window.LAW_TEXTS?.[k];if(!text)throw new Error('현행 시행일을 확인한 전체 수록본은 검토 중입니다.');host.innerHTML=`<div class="prose small section-gap">${E(text)}</div>`;b.textContent='원문 접기';}catch(err){toast(err.message+' 공식 현행 원문을 이용해 주세요.');}finally{b.disabled=false;}return;}
 const action=b.dataset.action;if(!action)return;const q=course.questions.find(q=>String(q.id)===currentId);
 switch(action){case 'home':go('home');break;case 'all-questions':go('questions');break;case 'settings':go('settings');break;case 'laws':go('laws');break;case 'resume':if(lastQuestion&&course.questions.some(q=>String(q.id)===lastQuestion))openQuestion(lastQuestion);else go('questions');break;case 'prev-page':page--;render();break;case 'next-page':page++;render();window.scrollTo({top:0,behavior:'instant'});break;case 'random':{const qs=C.filterQuestions(course.questions,filter,records);if(qs.length)openQuestion(qs[Math.floor(Math.random()*qs.length)].id);break;}case 'grade':if(!q||!choice||revealed)break;revealed=true;if(q.answer!=null){const r=rec(q.id);r.attempts=(r.attempts||0)+1;r.correct=C.answerMatches(q,choice);r.choice=choice;r.lastAttempt=new Date().toISOString();save();}render();break;case 'retry':choice=null;revealed=false;render();break;case 'star':if(q){rec(q.id).starred=!rec(q.id).starred;save();render();}break;case 'save-note':if(q&&$('#q-note')){rec(q.id).note=$('#q-note').value;save();toast('메모를 저장했습니다.');}break;case 'next-question':{const qs=C.filterQuestions(course.questions,filter,records),i=qs.findIndex(x=>String(x.id)===currentId);if(qs.length)openQuestion(qs[(i+1)%qs.length].id);break;}case 'lesson-done':{const id=lessonSubject+'-'+lessonIndex;lessonDone[id]=!lessonDone[id];save();render();break;}case 'lesson-questions':filter.subject=lessonSubject;filter.topic='';filter.search='';filter.mode='all';go('questions');break;case 'wrong':filter.mode='wrong';filter.subject='';filter.year='';filter.topic='';filter.search='';go('questions');break;case 'starred':filter.mode='starred';filter.subject='';filter.year='';filter.topic='';filter.search='';go('questions');break;case 'export-records':{const data={type:'jidosa-records-v9',records,lessonDone,videoDone,lastQuestion,exportedAt:new Date().toISOString()},url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='지도사_학습기록_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;}case 'remove-import':if(!confirm('불러온 개인학습자료를 해제할까요? 풀이 기록은 유지됩니다.'))break;if(db)await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').delete('course');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});course=base;render();toast('기본 학습자료로 전환했습니다.');break;case 'close-image':$('#image-modal').close();break;}
 });
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.installPrompt=e;if(view==='settings')render();});
 if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
 render();
})();
