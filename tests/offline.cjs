const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
(async()=>{for(const layout of ['pc','mobile']){
 const handlers={},cache=new Map();let installed=[];
 const response={ok:true,clone(){return this}};
 const caches={open:async()=>({addAll:async urls=>{installed=urls;urls.forEach(u=>cache.set(new URL(u,base).href,response))},put:async()=>{}}),keys:async()=>[],match:async request=>cache.get(new URL(typeof request==='string'?request:request.url,base).href)};
 const base=`https://bt1496.github.io/-/${layout}-v9/`;
 const ctx={URL,Promise,Response,caches,fetch:async()=>{throw new Error('offline')},self:{location:new URL(base),addEventListener:(event,handler)=>handlers[event]=handler,skipWaiting(){},clients:{claim(){}}}};
 vm.runInNewContext(fs.readFileSync(`${layout}-v9/sw.js`,'utf8'),ctx);
 let pending;handlers.install({waitUntil:p=>pending=p});await pending;
 for(const asset of ['../shared-v9/app.js','../shared-v9/core.js','../shared-v9/course.js','../shared-v9/history.js','../shared-v9/laws.js']){assert.ok(installed.includes(asset));let result;handlers.fetch({request:{url:new URL(asset,base).href,method:'GET'},respondWith:p=>result=p});assert.equal(await result,response)}
 let result;handlers.fetch({request:{url:base+'index.html',method:'GET',mode:'navigate'},respondWith:p=>result=p});assert.equal(await result,response);
 console.log(layout+': offline navigation and question/theory/law assets passed');
}})().catch(e=>{console.error(e);process.exit(1)});
