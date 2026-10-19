import * as T from './three.module.js';
import {createAvatar} from './avatar-rig.js';
import {createAvatarActionPlayer,sampleAvatarAction} from './avatar-actions.js';
import {createAvatarActionEffects} from './avatar-action-effects.js';
import {STOPS,TARGETS,findPath,step,direction,MOVEMENT_KEYS} from './garden-paths.js';

export function createGarden(container,{avatar,onStation,isBlocked=()=>false,onReady=()=>{},onAction=()=>{}}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,scene=new T.Scene(),renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;container.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Khu vườn hẹn hò 3D. Có thể dùng các nút chặng bên dưới để khám phá.');
 const camera=new T.OrthographicCamera(-10,10,10,-10,.1,100),materials=new Map(),clickables=[],markers=[],floaters=[],pressed=new Set();let yaw=.48,zoom=19,rig,route=[],arrival=null,drag=null,frame,last=0,ready=false,disposed=false;
 const mat=color=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.88}));return materials.get(color);};
 const mesh=(geometry,color,p,parent=scene)=>{const m=new T.Mesh(geometry,mat(color));m.position.set(...p);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const box=(x,y,z,color,p,parent)=>mesh(new T.BoxGeometry(x,y,z),color,p,parent);
 const ball=(r,color,p,scale=[1,1,1],parent)=>{const m=mesh(new T.SphereGeometry(r,16,12),color,p,parent);m.scale.set(...scale);return m;};
 const cylinder=(a,b,h,color,p,parent)=>mesh(new T.CylinderGeometry(a,b,h,32),color,p,parent);
 function heart(color,p,size=1,parent=scene){const s=new T.Shape();s.moveTo(0,-.3);s.bezierCurveTo(-.8,.2,-.4,.95,0,.46);s.bezierCurveTo(.4,.95,.8,.2,0,-.3);const m=mesh(new T.ExtrudeGeometry(s,{depth:.12,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.04,bevelThickness:.03}),color,p,parent);m.scale.setScalar(size);return m;}
 function label(value,size=1.8,color='#79455b'){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#fff8f2';ctx.beginPath();ctx.roundRect(6,8,500,112,30);ctx.fill();ctx.strokeStyle='#dec0cc';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 42px Georgia';ctx.fillText(value,256,84);const texture=new T.CanvasTexture(c),sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.scale.set(size,size*.25,1);sprite.renderOrder=4;return sprite;}
 scene.add(new T.HemisphereLight('#fffcf5','#af8b96',2.5));const sun=new T.DirectionalLight('#ffe5ce',3.1);sun.position.set(-5,12,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10});sun.shadow.bias=-.002;scene.add(sun);
 const island=cylinder(7.8,7.45,.65,'#cfa5b6',[0,-.4,0]);island.scale.z=.9;const grass=cylinder(7.75,7.75,.10,'#e4e5d0',[0,-.03,0]);grass.scale.z=.9;
 const path=mesh(new T.RingGeometry(3.9,5.45,96),'#fcf1e4',[0,.04,0]);path.rotation.x=-Math.PI/2;path.scale.y=.88;
 cylinder(2.5,2.6,.16,'#ead2cf',[0,.04,0]);box(3.35,2.05,2.75,'#fff5df',[0,1.1,-.1]);const roof=mesh(new T.ConeGeometry(3.03,1.3,4),'#bd7e96',[0,2.8,-.1]);roof.rotation.y=Math.PI/4;roof.scale.z=.83;
 box(.8,1.5,.08,'#a35d78',[0,.78,1.3]);ball(.035,'#e8c182',[.25,.78,1.36]);
 for(const x of [-1.12,1.12]){box(.65,.7,.1,'#d6e4db',[x,1.3,1.3]);box(.035,.68,.12,'#e9c8b4',[x,1.3,1.38]);box(.65,.035,.12,'#e9c8b4',[x,1.3,1.38]);}
 const sign=label('chez nous ♡',2.7);sign.position.set(0,2.1,1.35);scene.add(sign);heart('#d79db3',[0,3.5,-.1],.65);
 function flower(x,z,color,size=.3,parent=scene){cylinder(.028,.028,size*1.5,'#7f997d',[x,size*.65,z],parent);for(let i=0;i<5;i++){const a=i*Math.PI/2.5;ball(size*.38,color,[x+Math.cos(a)*size*.4,size*1.5+Math.sin(a)*size*.4,z],[1,1,.45],parent);}ball(size*.22,'#e7bd7c',[x,size*1.5,z+.1],undefined,parent);}
 function tree(x,z,s=1){cylinder(.13,.22,2.0*s,'#ad8376',[x,.9*s,z]);for(const [dx,dy,dz,r] of [[0,2.7,0,1.1],[-.7,2.45,0,.85],[.7,2.45,0,.8],[0,2.35,.6,.85]])ball(r*s,dx<0?'#efbbcf':'#f3cfdb',[x+dx*s,dy*s,z+dz*s],[1,.9,1]);}
 tree(-5.9,-2.8);tree(5.9,-2.8,.9);tree(-5.6,2.6,.65);
 for(const x of [-3.2,3.2]){cylinder(.055,.055,2.2,'#b89583',[x,1.1,1.5]);ball(.18,'#fff0c6',[x,2.25,1.5]);}
 for(let i=0;i<24;i++){const a=i*Math.PI/12;flower(Math.sin(a)*6.65,Math.cos(a)*5.85,i%2?'#fff5f0':'#e8a4be',.21);}
 STOPS.forEach((p,i)=>{const g=new T.Group();g.position.set(p.x,0,p.z);g.userData.station=i;scene.add(g);const plate=cylinder(.8,.87,.14,'#f7e6e3',[0,.08,0],g);clickables.push(plate);
  const n=label(String(i+1).padStart(2,'0'),1.0);n.position.set(0,.25,1.05);g.add(n);markers.push(n);
  if(i===0){for(const x of [-.5,.5])cylinder(.07,.07,1.2,'#c888a4',[x,.72,-.2],g);const arch=mesh(new T.TorusGeometry(.5,.075,8,30,Math.PI),'#c888a4',[0,1.32,-.2],g);heart('#e3a5c0',[0,1.75,-.2],.4,g);}
  if(i===1){cylinder(.35,.25,.62,'#f7f1de',[0,.47,0],g);cylinder(.31,.31,.025,'#826254',[0,.79,0],g);const handle=mesh(new T.TorusGeometry(.18,.05,6,20),'#f7f1de',[.34,.48,0],g);heart('#d99ab3',[0,1.2,0],.35,g);}
  if(i===2){cylinder(.07,.07,.75,'#a18079',[0,.48,0],g);box(.8,.48,.42,'#d994b0',[0,1.0,0],g);box(.6,.04,.05,'#774359',[0,1.07,.23],g);heart('#fff1e7',[0,.93,.23],.23,g);}
  if(i===3){box(.8,.6,.65,'#e3a6c0',[0,.48,0],g);box(.88,.12,.73,'#f1c6d7',[0,.84,0],g);box(.09,.69,.75,'#fff0dc',[0,.54,0],g);const ribbon=mesh(new T.TorusGeometry(.15,.04,6,20),'#b67699',[-.12,.99,0],g);ribbon.rotation.y=.3;const other=ribbon.clone();other.position.x=.12;g.add(other);}
  if(i===4){cylinder(.35,.23,.5,'#c79b9d',[0,.4,0],g);flower(-.12,0,'#e6a1bc',.65,g);flower(.18,0,'#f4bfd3',.55,g);}
  if(i===5){cylinder(.35,.35,.7,'#f3d6d9',[0,.56,0],g);cylinder(.38,.38,.12,'#c69e7c',[0,.97,0],g);heart('#d788a5',[0,.58,.37],.35,g);}
  if(i===6){box(1.0,.85,.12,'#fff6e8',[0,.76,0],g);box(.82,.62,.14,'#d8b5c7',[0,.79,.04],g);heart('#fff6e8',[0,.77,.16],.4,g);}
  if(i===7){for(const x of [-.5,.5])cylinder(.05,.05,1.6,'#b7869b',[x,.93,0],g);heart('#da94b0',[0,1.85,0],.82,g);box(1.3,.12,.45,'#fff0d6',[0,.5,.1],g);}
 });
 for(let i=0;i<9;i++){const a=i*2.4,h=heart(i%2?'#df9bb8':'#f0b9cd',[Math.sin(a)*6,1.4+(i%3)*.5,Math.cos(a)*4.4],.16);floaters.push({mesh:h,y:h.position.y,phase:i});}
 const anchor=new T.Group();anchor.position.set(0,.18,5.1);scene.add(anchor);
 const companion=createAvatar({hair:'pixie',hairColor:'espresso',outfit:'hoodie',color:'sage',skin:'peach',accessory:'none'});companion.group.position.set(.9,.17,2.2);companion.group.rotation.y=.3;scene.add(companion.group);
 function setAvatar(a){if(rig){anchor.remove(rig.group);rig.dispose();}rig=createAvatar(a);rig.group.scale.setScalar(.9);anchor.add(rig.group);}
 setAvatar(avatar);
 const effects=createAvatarActionEffects({scene,anchor,camera,createLabel:label});const player=createAvatarActionPlayer({getRig:()=>rig,effects,isBlocked,reducedMotion:reduced,onChange:onAction});
 function cameraUpdate(){const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight),aspect=w/h;const viewZoom=w<600?Math.max(14,18.2/aspect)*(zoom/19):zoom;camera.left=-viewZoom*aspect/2;camera.right=viewZoom*aspect/2;camera.top=viewZoom/2;camera.bottom=-viewZoom/2;camera.position.set(Math.sin(yaw)*20,20,Math.cos(yaw)*20);camera.lookAt(0,.25,0);camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
 const observer=new ResizeObserver(cameraUpdate);observer.observe(container);cameraUpdate();
 const ray=new T.Raycaster(),pointer=new T.Vector2();
 renderer.domElement.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY,last:event.clientX,moved:false};renderer.domElement.setPointerCapture(event.pointerId);});
 renderer.domElement.addEventListener('pointermove',event=>{if(!drag)return;if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6)drag.moved=true;if(drag.moved){yaw-=(event.clientX-drag.last)*.006;cameraUpdate();}drag.last=event.clientX;});
 renderer.domElement.addEventListener('pointerup',event=>{const old=drag;drag=null;if(!old||old.moved||isBlocked())return;const bounds=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(scene.children,true).find(h=>{let n=h.object;while(n){if(Number.isInteger(n.userData.station))return true;n=n.parent;}return false;});if(hit){let node=hit.object;while(!Number.isInteger(node.userData.station))node=node.parent;onStation(node.userData.station);}});
 renderer.domElement.addEventListener('pointercancel',()=>{drag=null;});renderer.domElement.addEventListener('wheel',event=>{event.preventDefault();zoom=Math.max(13,Math.min(24,zoom+event.deltaY*.012));cameraUpdate();},{passive:false});
 function release(){pressed.clear();drag=null;}function press(code){if(isBlocked()||!MOVEMENT_KEYS.has(code))return;route=[];arrival=null;player.stop();pressed.add(code);}
 function keydown(event){if(isBlocked()||event.ctrlKey||event.metaKey||event.altKey||event.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;if(MOVEMENT_KEYS.has(event.code)){event.preventDefault();press(event.code);}}
 const keyup=event=>pressed.delete(event.code);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',release);document.addEventListener('visibilitychange',release);
 function tick(time){if(disposed)return;frame=requestAnimationFrame(tick);const dt=Math.min(.06,(time-last)/1000||.016);last=time;
  let v=isBlocked()?{x:0,z:0}:direction(pressed,yaw);if(isBlocked())release();
  if(!isBlocked()&&route.length){const target=route[0],dx=target.x-anchor.position.x,dz=target.z-anchor.position.z;if(Math.hypot(dx,dz)<.09){route.shift();if(!route.length){const done=arrival;arrival=null;done?.();}}else v={x:dx,z:dz};}
  const moving=Math.hypot(v.x,v.z)>.001;if(moving){const p=step({x:anchor.position.x,z:anchor.position.z},v,dt);anchor.position.x=p.x;anchor.position.z=p.z;anchor.rotation.y=Math.atan2(v.x,v.z);rig.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(time*.011+i*Math.PI)*.42);}else if(!player.current())rig.legs.forEach(leg=>leg.rotation.x=0);
  player.tick(dt);if(!reduced)floaters.forEach(o=>{o.mesh.position.y=o.y+Math.sin(time*.0008+o.phase)*.15;o.mesh.rotation.y=Math.sin(time*.0004+o.phase)*.3;});renderer.render(scene,camera);if(!ready){ready=true;onReady();}
 }
 frame=requestAnimationFrame(tick);
 return {press,release,releaseKey:code=>pressed.delete(code),setAvatar(a){player.stop();setAvatar(a);},playAction(id){route=[];arrival=null;release();return player.play(id);},stopAction:()=>player.stop(),walkTo(index,done){player.stop();release();route=findPath({x:anchor.position.x,z:anchor.position.z},TARGETS[index]);arrival=done;if(!route.length){arrival=null;done?.();}},setProgress({collected,next}){markers.forEach((m,i)=>{m.material.opacity=i<=next?1:.4;m.material.color.set(collected[i]?'#d7eed9':'#ffffff');});},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',release);document.removeEventListener('visibilitychange',release);player.stop();effects.clear();scene.traverse(node=>{node.geometry?.dispose();if(node.material?.map)node.material.map.dispose();});rig.dispose();companion.dispose();materials.forEach(m=>m.dispose());renderer.dispose();}};
}
