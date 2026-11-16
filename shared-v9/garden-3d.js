(function garden3D(root){
'use strict';
const STEP=1.6,TAU=Math.PI*2,clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function identity(){return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];}
function multiply(a,b){const m=new Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)m[c*4+r]+=a[k*4+r]*b[c*4+k];return m;}
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),nf=1/(near-far);return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0];}
function normalized(v){const n=Math.hypot(...v)||1;return v.map(x=>x/n);}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function lookAt(eye,target){const z=normalized(eye.map((v,i)=>v-target[i])),x=normalized(cross([0,1,0],z)),y=cross(z,x),dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];}
function model(x,y,z,sx,sy,sz,angle=0){const c=Math.cos(angle),s=Math.sin(angle);return [c*sx,0,-s*sx,0,0,sy,0,0,s*sz,0,c*sz,0,x,y,z,1];}
function point(n){return [Math.sin(n*.92)*1.28,n*STEP,Math.cos(n*.92)*.83];}
function pose(from,to,t){t=clamp(t,0,1);const ease=t*t*(3-2*t),a=point(from),b=point(to);return a.map((v,i)=>v+(b[i]-v)*ease+(i===1&&from!==to?Math.sin(Math.PI*t)*.83:0));}
function meshes(){
 const cube=[],cn=[],sphere=[],sn=[],hemi=[],hn=[],cyl=[],yn=[];
 const tri=(p,n,a,b,c,na,nb,nc)=>{p.push(...a,...b,...c);n.push(...na,...nb,...nc);};
 const faces=[[[1,0,0],[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]]],[[-1,0,0],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]]],[[0,1,0],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]]],[[0,-1,0],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]]],[[0,0,1],[[1,-1,1],[1,1,1],[-1,1,1],[-1,-1,1]]],[[0,0,-1],[[-1,-1,-1],[-1,1,-1],[1,1,-1],[1,-1,-1]]]];
 for(const [n,q]of faces){tri(cube,cn,q[0],q[1],q[2],n,n,n);tri(cube,cn,q[0],q[2],q[3],n,n,n);}
 function ball(p,n,top){for(let y=0;y<8;y++)for(let x=0;x<12;x++){const pos=(u,v)=>{const lat=v/8*(top?Math.PI/2:Math.PI);return [Math.sin(lat)*Math.cos(u/12*TAU),Math.cos(lat),Math.sin(lat)*Math.sin(u/12*TAU)];},a=pos(x,y),b=pos(x+1,y),c=pos(x+1,y+1),d=pos(x,y+1);tri(p,n,a,b,c,a,b,c);tri(p,n,a,c,d,a,c,d);}}
 ball(sphere,sn,false);ball(hemi,hn,true);
 for(let i=0;i<12;i++){const a=i/12*TAU,b=(i+1)/12*TAU,A=[Math.cos(a),-1,Math.sin(a)],B=[Math.cos(b),-1,Math.sin(b)],C=[B[0],1,B[2]],D=[A[0],1,A[2]],na=[A[0],0,A[2]],nb=[B[0],0,B[2]];tri(cyl,yn,A,B,C,na,nb,nb);tri(cyl,yn,A,C,D,na,nb,na);tri(cyl,yn,[0,1,0],D,C,[0,1,0],[0,1,0],[0,1,0]);tri(cyl,yn,[0,-1,0],B,A,[0,-1,0],[0,-1,0],[0,-1,0]);}
 return {cube:[cube,cn],sphere:[sphere,sn],hemi:[hemi,hn],cylinder:[cyl,yn]};
}
const color=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
function painter(gl){
 const vert='attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uVP;uniform mat4 uModel;uniform mat3 uNormal;varying vec3 vNormal;varying float vDistance;void main(){vec4 world=uModel*vec4(aPosition,1.0);gl_Position=uVP*world;vNormal=normalize(uNormal*aNormal);vDistance=gl_Position.w;}';
 const frag='precision mediump float;uniform vec3 uColor;uniform vec3 uSky;varying vec3 vNormal;varying float vDistance;void main(){float light=.55+.45*max(dot(normalize(vNormal),normalize(vec3(-.5,1.,.7))),0.);vec3 c=uColor*light;float fog=smoothstep(11.,27.,vDistance);gl_FragColor=vec4(mix(c,uSky,fog),1.);}';
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('3D shader initialization');return s;}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vert));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('3D program initialization');gl.useProgram(program);
 const pos=gl.getAttribLocation(program,'aPosition'),normal=gl.getAttribLocation(program,'aNormal'),u={};for(const n of ['VP','Model','Normal','Color','Sky'])u[n]=gl.getUniformLocation(program,'u'+n);
 const buffers={};for(const [name,[positions,normals]]of Object.entries(meshes())){const p=gl.createBuffer(),n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normals),gl.STATIC_DRAW);buffers[name]={p,n,count:positions.length/3};}
 gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
 function draw(shape,x,y,z,sx,sy,sz,hex,angle=0){const b=buffers[shape],c=Math.cos(angle),s=Math.sin(angle);gl.bindBuffer(gl.ARRAY_BUFFER,b.p);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.enableVertexAttribArray(normal);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,0,0);gl.uniformMatrix4fv(u.Model,false,new Float32Array(model(x,y,z,sx,sy,sz,angle)));gl.uniformMatrix3fv(u.Normal,false,new Float32Array([c/sx,0,-s/sx,0,1/sy,0,s/sz,0,c/sz]));gl.uniform3fv(u.Color,new Float32Array(color(hex)));gl.drawArrays(gl.TRIANGLES,0,b.count);}
 return function frame(v){
  const sky=['#d5eddf','#beddd0','#d5e8fb','#27374e'][v.theme||0],rgb=color(sky);gl.viewport(0,0,v.width,v.height);gl.clearColor(...rgb,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniform3fv(u.Sky,new Float32Array(rgb));
  const h=v.from+(v.to-v.from)*(v.phase*v.phase*(3-2*v.phase)),base=Math.floor(h),origin=base*STEP,follow=h*STEP-origin,angle=Number.isFinite(v.yaw)?v.yaw:.55,eye=[Math.sin(angle)*6.4,follow+3.6,Math.cos(angle)*6.4],vp=multiply(perspective(.72,v.width/v.height,.1,50),lookAt(eye,[0,follow+.85,0]));
  gl.uniformMatrix4fv(u.VP,false,new Float32Array(vp));
  draw('cylinder',0,follow,0,.13,6,.13,'#458d5a');
  for(let i=Math.max(0,base-3);i<=base+7;i++){
   const p=point(i),yy=p[1]-origin,active=i===v.to,above=i>v.to;
   draw('cube',p[0],yy-.13,p[2],.58,.12,.49,active?'#d8ae55':above?'#84b77b':'#5d9363',i*.2);
   draw('cube',p[0],yy-.265,p[2],.46,.055,.39,'#80674c',i*.2);
   draw('sphere',p[0],yy+.012,p[2],.35,.009,.29,active?'#b39545':'#4c7e54');
   draw('sphere',Math.sin(i*.9)*.4,yy+.36,Math.cos(i*.9)*.35,.46,.075,.18,'#9cc57f',i*.92);
   if(i===v.to+1){const bob=v.reduced?0:Math.sin(v.time*.002)*.055;draw('cylinder',p[0],yy+.58+bob,p[2],.12,.04,.12,'#ffdc75',v.time*.001);draw('sphere',p[0],yy+.58+bob,p[2],.065,.09,.065,'#fff1ad');}
  }
  for(let i=0;i<5;i++){const yy=follow+(i-2)*1.35,x=(i%2?1:-1)*(2.6+(i%3)*.5),z=-2.2-(i%3);draw('sphere',x,yy,z,.65,.19,.32,'#f4faf4');draw('sphere',x+.37,yy-.03,z,.46,.14,.28,'#f4faf4');}
  const p=pose(v.from,v.to,v.phase),idle=v.reduced||v.phase<1?0:Math.sin(v.time*.0022)*.018,px=p[0],py=p[1]-origin+idle,pz=p[2],yaw=.12;
  draw('cube',px-.13,py+.055,pz+.045,.105,.055,.16,'#294c42',yaw);draw('cube',px+.13,py+.055,pz+.045,.105,.055,.16,'#294c42',yaw);
  draw('sphere',px,py+.37,pz,.255,.33,.205,'#e5f0c7',yaw);
  draw('cube',px,py+.27,pz+.025,.216,.16,.19,'#4e9480',yaw);
  draw('cube',px-.13,py+.48,pz+.177,.033,.16,.025,'#ffdd76',yaw);draw('cube',px+.13,py+.48,pz+.177,.033,.16,.025,'#ffdd76',yaw);
  draw('sphere',px-.3,py+.4,pz,.075,.2,.085,'#c8e3af');draw('sphere',px+.3,py+.4,pz,.075,.2,.085,'#c8e3af');
  draw('sphere',px,py+.76,pz,.255,.25,.225,'#f4f1ce');
  draw('cube',px-.084,py+.78,pz+.22,.026,.04,.018,'#244338');draw('cube',px+.084,py+.78,pz+.22,.026,.04,.018,'#244338');
  draw('cube',px,py+.66,pz+.218,.048,.012,.015,'#62846b');
  draw('hemi',px,py+.91,pz,.32,.235,.29,v.helmet||'#59b88d');
  draw('cylinder',px,py+.91,pz,.35,.025,.31,v.helmet||'#59b88d');
  draw('cube',px,py+1.06,pz,.027,.095,.26,'#bde0a3');
  draw('sphere',px+.1,py+1.205,pz,.12,.04,.055,'#8cbd6b',-.4);
 };
}
let instance=null;
function createInstance(){
 const canvas=root.document.createElement('canvas');canvas.className='garden-3d-canvas';canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','3D 콩나무 모험. 정답을 맞히면 발판을 딛고 올라갑니다. 좌우로 드래그해 둘러보세요.');
 let gl=null,paint=null;try{gl=canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power'});if(gl)paint=painter(gl);}catch(e){paint=null;}
 let host=null,raf=0,yaw=.55,from=0,to=0,start=0,initialized=false,state={},drag=null,lost=false,lastFrame=-100;
 const reduced=()=>!!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function phase(time){return reduced()?1:clamp((time-start)/1100,0,1);}
 function schedule(){if(!raf&&paint&&host&&!lost)raf=root.requestAnimationFrame(loop);}
 function loop(time){raf=0;if(!host||!host.isConnected||lost)return;if(time-lastFrame>=31){lastFrame=time;const rect=host.getBoundingClientRect(),dpr=Math.min(root.devicePixelRatio||1,1.75),width=Math.max(1,Math.round(rect.width*dpr)),height=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}const p=phase(time);host.dataset.jumping=p<1&&to>from?'true':'false';paint({from,to,phase:p,yaw,time:reduced()?0:time,reduced:reduced(),theme:state.theme||0,helmet:state.helmet,width,height});if(p===1)from=to;}if(!reduced()||phase(time)<1)schedule();}
 function fallback(){
  const span=Math.max(0,to);host.innerHTML='<div class="garden-css-scene" role="img" aria-label="간편 3D 모험, 현재 '+span+'칸"><div class="garden-css-world">'+Array.from({length:7},(_,i)=>'<i class="garden-css-step" style="--step:'+i+'"></i>').join('')+'<div class="garden-css-player" style="--rise:'+(span%7)+'"><span>🪖</span><b>🌱</b></div></div></div><span class="garden-3d-mode">간편 3D 모드</span>';
 }
 root.addEventListener?.('resize',schedule);
 canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw};});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)>Math.abs(dy)*1.2){yaw=drag.yaw+dx*.009;schedule();}});
 for(const type of ['pointerup','pointercancel','pointerleave'])canvas.addEventListener(type,()=>{drag=null;});
 canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();yaw+=e.key==='ArrowLeft'?-.15:.15;schedule();}});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;if(raf)root.cancelAnimationFrame(raf);raf=0;});
 canvas.addEventListener('webglcontextrestored',()=>{try{paint=painter(gl);lost=false;schedule();}catch(e){paint=null;if(host)fallback();}});
 return {mount(nextHost,nextState){
  host=nextHost;if(!host){if(raf)root.cancelAnimationFrame(raf);raf=0;return;}
  const now=root.performance?.now?.()||0,target=Math.max(0,Math.floor(nextState.climb||0));state={...nextState,helmet:nextState.helmet};
  if(!initialized){from=to=target;start=now-1200;initialized=true;}else if(target!==to){from=to;to=target;start=now;}
  if(!paint){fallback();return;}
  host.replaceChildren(canvas);schedule();
 }};
}
function mount(host,state){if(!host){instance?.mount(null,state);return;}if(!instance)instance=createInstance();const colors={mint:'#59b88d',sun:'#f3bf4f',berry:'#ed86a1',night:'#9388d7'};instance.mount(host,{...state,helmet:colors[state.equipped]||colors.mint});}
const api={mount,math:{identity,multiply,perspective,lookAt,model,point,pose},meshes,painter};root.StudyGarden3D=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
