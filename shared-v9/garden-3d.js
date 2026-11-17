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
function easing(from,to,t){return to<from?t*t:t*t*(3-2*t);}
function pose(from,to,t){t=clamp(t,0,1);const ease=easing(from,to,t),a=point(from),b=point(to);return a.map((v,i)=>v+(b[i]-v)*ease+(i===1&&to>from?Math.sin(Math.PI*t)*.83:0));}
function trunkCenter(y){return [Math.sin(y*.31)*.19,y,Math.cos(y*.23)*.14];}
function trunkRadius(y){return Math.max(.23,.49-Math.log1p(Math.max(0,y))*.035);}
function treeMesh(base){
 const positions=[],normals=[],start=Math.max(0,base-5)*STEP,end=(base+8)*STEP,origin=base*STEP,rings=72,sides=18;
 function sample(y,a){const c=trunkCenter(y),r=trunkRadius(y)*(1+.045*Math.sin(a*9+y*.6)+.024*Math.sin(a*17-y*.4));return [c[0]+Math.cos(a)*r,y-origin,c[2]+Math.sin(a)*r];}
 function normal(y,a){const p=sample(y,a),q=sample(y+.01,a),r=sample(y,a+.01);return normalized(cross(q.map((v,i)=>v-p[i]),r.map((v,i)=>v-p[i])));}
 function emit(y,a){positions.push(...sample(y,a));normals.push(...normal(y,a));}
 for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){const y=start+(end-start)*i/rings,yy=start+(end-start)*(i+1)/rings,a=j/sides*TAU,b=(j+1)/sides*TAU;emit(y,a);emit(yy,a);emit(yy,b);emit(y,a);emit(yy,b);emit(y,b);}
 return [positions,normals];
}
function leafMesh(){
 const positions=[],normals=[],rows=10,cols=4;
 const sample=(u,v)=>[u,Math.sin(u*Math.PI)*.15-Math.abs(v)*.065,Math.pow(Math.sin(u*Math.PI),.8)*.43*v];
 function tri(a,b,c){let n=cross(b.map((v,i)=>v-a[i]),c.map((v,i)=>v-a[i]));n=Math.hypot(...n)<1e-7?[0,1,0]:normalized(n);positions.push(...a,...b,...c);normals.push(...n,...n,...n);}
 for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const u=i/rows,v=j/cols*2-1,a=sample(u,v),b=sample((i+1)/rows,v),c=sample((i+1)/rows,(j+1)/cols*2-1),d=sample(u,(j+1)/cols*2-1);tri(a,b,c);tri(a,c,d);}
 return [positions,normals];
}
function branchMatrix(a,b,radius){
 const delta=b.map((v,i)=>v-a[i]),len=Math.hypot(...delta)||.001,y=normalized(delta),reference=Math.abs(y[2])>.9?[1,0,0]:[0,0,1],x=normalized(cross(y,reference)),z=cross(x,y),mid=a.map((v,i)=>(v+b[i])/2);
 return [x[0]*radius,x[1]*radius,x[2]*radius,0,y[0]*len/2,y[1]*len/2,y[2]*len/2,0,z[0]*radius,z[1]*radius,z[2]*radius,0,...mid,1];
}
function meshes(){
 const cube=[],cn=[],sphere=[],sn=[],hemi=[],hn=[],cyl=[],yn=[];
 const tri=(p,n,a,b,c,na,nb,nc)=>{p.push(...a,...b,...c);n.push(...na,...nb,...nc);};
 const faces=[[[1,0,0],[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]]],[[-1,0,0],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]]],[[0,1,0],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]]],[[0,-1,0],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]]],[[0,0,1],[[1,-1,1],[1,1,1],[-1,1,1],[-1,-1,1]]],[[0,0,-1],[[-1,-1,-1],[-1,1,-1],[1,1,-1],[1,-1,-1]]]];
 for(const [n,q]of faces){tri(cube,cn,q[0],q[1],q[2],n,n,n);tri(cube,cn,q[0],q[2],q[3],n,n,n);}
 function ball(p,n,top){for(let y=0;y<12;y++)for(let x=0;x<18;x++){const pos=(u,v)=>{const lat=v/12*(top?Math.PI/2:Math.PI);return [Math.sin(lat)*Math.cos(u/18*TAU),Math.cos(lat),Math.sin(lat)*Math.sin(u/18*TAU)];},a=pos(x,y),b=pos(x+1,y),c=pos(x+1,y+1),d=pos(x,y+1);tri(p,n,a,b,c,a,b,c);tri(p,n,a,c,d,a,c,d);}}
 ball(sphere,sn,false);ball(hemi,hn,true);
 for(let i=0;i<12;i++){const a=i/12*TAU,b=(i+1)/12*TAU,A=[Math.cos(a),-1,Math.sin(a)],B=[Math.cos(b),-1,Math.sin(b)],C=[B[0],1,B[2]],D=[A[0],1,A[2]],na=[A[0],0,A[2]],nb=[B[0],0,B[2]];tri(cyl,yn,A,B,C,na,nb,nb);tri(cyl,yn,A,C,D,na,nb,na);tri(cyl,yn,[0,1,0],D,C,[0,1,0],[0,1,0],[0,1,0]);tri(cyl,yn,[0,-1,0],B,A,[0,-1,0],[0,-1,0],[0,-1,0]);}
 const pear=sphere.map((v,i)=>i%3===1?v:v*(.9-.15*sphere[i-i%3+1])),pn=sn.map((v,i)=>i%3===1?v+.15: v);return {pear:[pear,pn],cube:[cube,cn],sphere:[sphere,sn],hemi:[hemi,hn],cylinder:[cyl,yn],trunk:treeMesh(0),leaf:leafMesh()};
}
const color=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
function painter(gl){
 const vert='attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uVP;uniform mat4 uModel;uniform mat3 uNormal;varying vec3 vNormal;varying vec3 vShape;varying vec3 vWorld;varying float vDistance;void main(){vec4 world=uModel*vec4(aPosition,1.0);gl_Position=uVP*world;vNormal=normalize(uNormal*aNormal);vShape=aPosition;vWorld=world.xyz;vDistance=gl_Position.w;}';
 const frag='precision mediump float;uniform vec3 uColor;uniform vec3 uSky;uniform float uMaterial;varying vec3 vNormal;varying vec3 vShape;varying vec3 vWorld;varying float vDistance;void main(){float diffuse=max(dot(normalize(vNormal),normalize(vec3(-.6,1.,.7))),0.);float light=.48+.52*diffuse;vec3 c=uColor;if(uMaterial>.5&&uMaterial<1.5){float a=atan(vShape.z,vShape.x);float grain=sin(a*23.+sin(vWorld.y*1.3)*.7+vWorld.y*.6);float fine=fract(sin(dot(vShape.xz,vec2(127.1,311.7))+vWorld.y*17.)*43758.5453);c*=.83+.15*grain+.07*fine;}if(uMaterial>1.5){float vein=1.-smoothstep(.006,.024,abs(vShape.z));float side=pow(.5+.5*sin(vShape.x*55.+abs(vShape.z)*39.),10.);c=mix(c,c*1.16,vein*.7+side*.16);}float rim=pow(1.-abs(normalize(vNormal).z),3.)*.05;c=c*light+rim;float fog=smoothstep(11.,27.,vDistance);gl_FragColor=vec4(mix(c,uSky,fog),1.);}';
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('3D shader initialization');return s;}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vert));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('3D program initialization');gl.useProgram(program);
 const pos=gl.getAttribLocation(program,'aPosition'),normal=gl.getAttribLocation(program,'aNormal'),u={};for(const n of ['VP','Model','Normal','Color','Sky','Material'])u[n]=gl.getUniformLocation(program,'u'+n);
 const buffers={};for(const [name,[positions,normals]]of Object.entries(meshes())){const p=gl.createBuffer(),n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normals),gl.STATIC_DRAW);buffers[name]={p,n,count:positions.length/3};}
 gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
 function drawM(shape,m,hex,material=0){
  const b=buffers[shape],sq=c=>m[c]*m[c]+m[c+1]*m[c+1]+m[c+2]*m[c+2],a=Math.max(1e-8,sq(0)),d=Math.max(1e-8,sq(4)),e=Math.max(1e-8,sq(8));
  gl.bindBuffer(gl.ARRAY_BUFFER,b.p);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.enableVertexAttribArray(normal);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,0,0);
  gl.uniformMatrix4fv(u.Model,false,new Float32Array(m));gl.uniformMatrix3fv(u.Normal,false,new Float32Array([m[0]/a,m[1]/a,m[2]/a,m[4]/d,m[5]/d,m[6]/d,m[8]/e,m[9]/e,m[10]/e]));gl.uniform3fv(u.Color,new Float32Array(color(hex)));gl.uniform1f(u.Material,material);gl.drawArrays(gl.TRIANGLES,0,b.count);
 }
 function draw(shape,x,y,z,sx,sy,sz,hex,angle=0,material=0){drawM(shape,model(x,y,z,sx,sy,sz,angle),hex,material);}
 function branch(a,b,r,hex='#816045'){drawM('cylinder',branchMatrix(a,b,r),hex,1);}
 function leaf(x,y,z,size,angle,tilt,hex){
  const c=Math.cos(tilt),s=Math.sin(tilt),rotZ=[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1];
  drawM('leaf',multiply(model(x,y,z,size,size,size*.7,angle),rotZ),hex,2);
 }
 let trunkBase=0;
 return function frame(v){
  const sky=['#d5eddf','#beddd0','#d5e8fb','#27374e'][v.theme||0],rgb=color(sky);gl.viewport(0,0,v.width,v.height);gl.clearColor(...rgb,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniform3fv(u.Sky,new Float32Array(rgb));
  const h=v.from+(v.to-v.from)*easing(v.from,v.to,v.phase),base=Math.floor(h),origin=base*STEP,follow=h*STEP-origin,angle=Number.isFinite(v.yaw)?v.yaw:.55,eye=[Math.sin(angle)*6.4,follow+3.6,Math.cos(angle)*6.4],vp=multiply(perspective(.72,v.width/v.height,.1,50),lookAt(eye,[0,follow+.85,0]));
  gl.uniformMatrix4fv(u.VP,false,new Float32Array(vp));
  if(trunkBase!==base){const [p,n]=treeMesh(base),b=buffers.trunk;gl.bindBuffer(gl.ARRAY_BUFFER,b.p);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(p),gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(n),gl.STATIC_DRAW);b.count=p.length/3;trunkBase=base;}
  drawM('trunk',identity(),'#987153',1);
  if(base<3){
   draw('sphere',0,-.25-origin,0,1.05,.22,.96,'#6c8750');
   for(let j=0;j<5;j++){const a=j/5*TAU,A=trunkCenter(.18),B=[Math.cos(a)*.7,-.05,Math.sin(a)*.7],C=[Math.cos(a)*1.3,-.18,Math.sin(a)*1.3];branch([A[0],A[1]-origin,A[2]],[B[0],B[1]-origin,B[2]],.15);branch([B[0],B[1]-origin,B[2]],[C[0],C[1]-origin,C[2]],.075);}
  }
  for(let i=Math.max(0,base-2);i<=base+4;i++){
   const p=point(i),yy=p[1]-origin,active=i===v.to,above=i>v.to,c=trunkCenter(Math.max(0,p[1]-.78)),A=[c[0],c[1]-origin,c[2]],B=[p[0]*.53,yy-.43,p[2]*.53],C=[p[0],yy-.19,p[2]];
   branch(A,B,.12);branch(B,C,.082);
   draw('cylinder',p[0],yy-.17,p[2],.61,.15,.52,active?'#a88b57':'#8a7052',i*.2,1);
   draw('cylinder',p[0],yy-.018,p[2],.60,.027,.51,active?'#c2bd73':above?'#8bb26f':'#70965d',i*.2);
   for(let j=0;j<3;j++){const a=i+j*2.1;draw('sphere',p[0]+Math.cos(a)*.45,yy+.018,p[2]+Math.sin(a)*.37,.13,.045,.105,j%2?'#a0ba77':'#6e985b');}
   const wind=v.reduced?0:Math.sin(v.time*.0007+i)*.028,leafAngle=i*.92+.55;
   leaf(C[0]*.8,yy-.26,C[2]*.8,.78,leafAngle,wind+.15,i%2?'#6f9c4f':'#80aa58');
   leaf(C[0]*.7,yy-.32,C[2]*.7,.60,leafAngle+2.4,wind-.08,'#99b76c');
   if(i%2===0){const a=i*.92;draw('sphere',c[0]+Math.cos(a)*trunkRadius(p[1]),yy+.27,c[2]+Math.sin(a)*trunkRadius(p[1]),.075,.13,.07,'#735039');}
   if(i===v.to+1){const bob=v.reduced?0:Math.sin(v.time*.002)*.055;draw('sphere',p[0],yy+.55+bob,p[2],.11,.15,.11,'#f5d67e');leaf(p[0],yy+.68+bob,p[2],.19,-.4,.5,'#b4cb78');}
  }
  for(let i=0;i<5;i++){const yy=follow+(i-2)*1.5,x=(i%2?1:-1)*(3.1+(i%3)*.5),z=-3.3-(i%3);draw('sphere',x,yy,z,1.15,.68,.75,i%2?'#b2c7a4':'#a2bba1');draw('sphere',x+.55,yy+.25,z,.72,.55,.65,'#b7cdae');}
  for(let i=0;i<4;i++){const t=v.reduced?i:v.time*.0004+i*1.8;draw('sphere',Math.sin(t)*2.15,follow+.5+Math.cos(t*.8+i),Math.cos(t)*1.6,.026,.026,.026,'#f3e5a3');}
  const p=pose(v.from,v.to,v.phase),idle=v.reduced||v.phase<1?0:Math.sin(v.time*.0022)*.024,px=p[0],py=p[1]-origin+idle,pz=p[2],wave=v.phase<1?Math.sin(v.phase*Math.PI)*.32:0,hat=v.helmet||'#59b88d';
  draw('sphere',px-.12,py+.055,pz+.065,.12,.065,.145,'#679767');draw('sphere',px+.12,py+.055,pz+.065,.12,.065,.145,'#679767');
  draw('pear',px,py+.50,pz,.34,.48,.285,'#dce8bd');
  draw('sphere',px,py+.36,pz+.255,.15,.17,.025,'#f1efd0');
  leaf(px-.23,py+.46,pz,.30,Math.PI+.15,-.48-wave,'#8daf70');leaf(px+.23,py+.46,pz,.30,-.15,-.48-wave,'#8daf70');
  draw('sphere',px-.098,py+.67,pz+.248,.054,.073,.032,'#263f36');draw('sphere',px+.098,py+.67,pz+.248,.054,.073,.032,'#263f36');
  draw('sphere',px-.111,py+.694,pz+.274,.016,.022,.012,'#fffdf1');draw('sphere',px+.085,py+.694,pz+.274,.016,.022,.012,'#fffdf1');
  draw('sphere',px-.18,py+.572,pz+.21,.045,.023,.023,'#dca391');draw('sphere',px+.18,py+.572,pz+.21,.045,.023,.023,'#dca391');
  const smile=[[-.052,.563],[-.028,.547],[0,.542],[.028,.547],[.052,.563]];for(let i=0;i<4;i++)branch([px+smile[i][0],py+smile[i][1],pz+.274],[px+smile[i+1][0],py+smile[i+1][1],pz+.274],.009,'#567257');
  draw('sphere',px,py+.91,pz,.24,.09,.205,hat);
  for(let j=0;j<5;j++)leaf(px,py+.94,pz,.40,j/5*TAU,-.13,hat);
  branch([px,py+.94,pz],[px+.025,py+1.145,pz],.022,'#668c51');leaf(px+.025,py+1.1,pz,.23,.2,.6,'#a6c272');
 };
}
let instance=null;
function createInstance(){
 const canvas=root.document.createElement('canvas');canvas.className='garden-3d-canvas';canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','3D 숲속 정령 모험. 정답이면 한 칸 올라가고 오답이면 한 칸 내려갑니다. 좌우로 드래그해 둘러보세요.');
 let gl=null,paint=null;try{gl=canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power'});if(gl)paint=painter(gl);}catch(e){paint=null;}
 let host=null,raf=0,yaw=.55,from=0,to=0,start=0,initialized=false,state={},drag=null,lost=false,lastFrame=-100;
 const reduced=()=>!!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function phase(time){return reduced()?1:clamp((time-start)/1100,0,1);}
 function schedule(){if(!raf&&paint&&host&&!lost)raf=root.requestAnimationFrame(loop);}
 function loop(time){raf=0;if(!host||!host.isConnected||lost)return;if(time-lastFrame>=31){lastFrame=time;const rect=host.getBoundingClientRect(),dpr=Math.min(root.devicePixelRatio||1,1.75),width=Math.max(1,Math.round(rect.width*dpr)),height=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}const p=phase(time);host.dataset.jumping=p<1&&to>from?'true':'false';host.dataset.falling=p<1&&to<from?'true':'false';paint({from,to,phase:p,yaw,time:reduced()?0:time,reduced:reduced(),theme:state.theme||0,helmet:state.helmet,width,height});if(p===1)from=to;}if(!reduced()||phase(time)<1)schedule();}
 function fallback(){
 const span=Math.max(0,to),spirit=root.StudyGarden?.mascot?.(state.helmet,'숲속 씨앗 정령')||'<span>🌿</span><b>●</b>';
 host.innerHTML='<div class="garden-css-scene" role="img" aria-label="간편 3D 나무 모험, 현재 '+span+'칸"><div class="garden-css-world"><div class="garden-css-trunk"></div>'+Array.from({length:7},(_,i)=>'<i class="garden-css-step" style="--step:'+i+'"></i>').join('')+'<div class="garden-css-player" style="--rise:'+(span%7)+'">'+spirit+'</div></div></div><span class="garden-3d-mode">간편 3D 모드</span>';
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
const api={mount,math:{identity,multiply,perspective,lookAt,model,point,pose},meshes,painter,geometry:{treeMesh,leafMesh,branchMatrix}};root.StudyGarden3D=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
