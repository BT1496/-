(function(root){
  'use strict';
  const SUBJECTS={law:'산업안전보건법령',general:'산업안전일반',corp:'기업진단·지도'};
  function validateCourse(data){
    if(!data||!Array.isArray(data.questions)||data.questions.length>3000)throw new Error('학습자료 형식이 올바르지 않습니다.');
    const ids=new Set();
    for(const q of data.questions){
      if(!q.id||ids.has(String(q.id))||!SUBJECTS[q.subject]||!Number.isInteger(q.year)||!Number.isInteger(q.no))throw new Error('문항의 식별정보를 확인해 주세요.');
      ids.add(String(q.id));
      if(q.answer!=null&&(!Array.isArray(q.answer)?![1,2,3,4,5].includes(q.answer):!q.answer.every(a=>[1,2,3,4,5].includes(a))))throw new Error('정답 번호가 올바르지 않습니다.');
      if(q.options&&q.options.length!==5)throw new Error('선택지는 다섯 개여야 합니다.');
      for(const src of [...(q.questionImages||[]),...(q.explanationImages||[])]){
        if(!/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(src)&&!/^assets\/[a-zA-Z0-9_.\/-]+\.(webp|png)$/.test(src))throw new Error('허용하지 않는 문제 이미지입니다.');
      }
    }
    return data;
  }
  function mergeCourses(base,extra){
    validateCourse(base);if(!extra)return base;validateCourse(extra);
    const map=new Map(base.questions.map(q=>[String(q.id),q]));extra.questions.forEach(q=>map.set(String(q.id),q));
    return {...base,...extra,theory:base.theory,videos:base.videos,questions:[...map.values()].sort((a,b)=>b.year-a.year||a.no-b.no)};
  }
  function frequency(q,bank){
    if(!q.topicKey||q.topicVerified===false)return null;
    const years=new Set(bank.filter(x=>x.subject===q.subject).map(x=>x.year));
    const seen=new Set(bank.filter(x=>x.subject===q.subject&&x.topicKey===q.topicKey).map(x=>x.year));
    if(years.size<2)return null;
    const ratio=seen.size/years.size;
    return {count:seen.size,total:years.size,label:ratio>=.5?'★★★ 자주 나와요':ratio>=.25?'★★☆ 여러 번 나왔어요':'★☆☆ 가끔 나와요'};
  }
  function answerMatches(q,choice){return (Array.isArray(q.answer)?q.answer:[q.answer]).includes(choice);}
  function filterQuestions(bank,f,records){
    const term=(f.search||'').trim().toLowerCase();
    return bank.filter(q=>(!f.subject||q.subject===f.subject)&&(!f.year||q.year===Number(f.year))&&(!f.topic||q.topic===f.topic)&&(!term||[q.text,q.topic,q.year,q.no].join(' ').toLowerCase().includes(term))&&(!f.mode||f.mode==='all'||(f.mode==='wrong'&&records[q.id]?.attempts>0&&records[q.id]?.correct===false)||(f.mode==='starred'&&records[q.id]?.starred)||(f.mode==='unseen'&&!records[q.id]?.attempts)||(f.mode==='law-reviewed'&&q.lawReview==='verified')||(f.mode==='law-pending'&&q.lawReview==='pending')));
  }
  const api={SUBJECTS,validateCourse,mergeCourses,frequency,answerMatches,filterQuestions};root.StudyCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
