import * as T from './three.module.js';
import {AVATAR_OPTIONS,normaliseAvatar} from './avatar-profile.js';

// One rig is used both in the fitting room and in the garden. No external model or texture.
export function createAvatar(value){
 const avatar=normaliseAvatar(value),group=new T.Group(),legs=[],arms=[],head=new T.Group(),materials=new Map();let disposed=false,target=group;
 const color=key=>AVATAR_OPTIONS[key].find(option=>option.id===avatar[key]).color;
 const material=value=>{if(!materials.has(value))materials.set(value,new T.MeshStandardMaterial({color:value,roughness:.8}));return materials.get(value);};
 const add=(geometry,tint,position,scale=[1,1,1],parent=target)=>{const mesh=new T.Mesh(geometry,material(tint));mesh.position.set(...position);if(parent===head)mesh.position.y-=1.1;mesh.scale.set(...scale);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const ball=(r,tint,p,s,parent)=>add(new T.SphereGeometry(r,16,12),tint,p,s,parent);
 const box=(x,y,z,tint,p,parent)=>add(new T.BoxGeometry(x,y,z),tint,p,undefined,parent);
 const tube=(top,bottom,height,tint,p)=>add(new T.CylinderGeometry(top,bottom,height,20),tint,p);
 const skin=color('skin'),hair=color('hairColor'),cloth=color('color'),ink='#30303b',white='#fff6e5',gold='#eac77b';

 // Legs pivot at the hip so the existing walking animation still works.
 for(const x of [-.115,.115]){
  const leg=new T.Group();leg.position.set(x,.34,0);group.add(leg);legs.push(leg);
  box(.13,.27,.14,avatar.outfit==='dress'?skin:'#455364',[0,-.12,0],leg);
  ball(.09,white,[0,-.27,.045],[.9,.65,1.3],leg);
 }
 if(avatar.outfit==='dress')tube(.18,.32,.46,cloth,[0,.55,0]);
 else{ball(.26,cloth,[0,.58,0],[.85,.92,.65]);tube(.19,.19,.08,cloth,[0,.38,0]);}
 tube(.09,.10,.13,skin,[0,.83,0]);
 for(const x of [-.255,.255]){
  const shoulder=new T.Group(),elbow=new T.Group(),wrist=new T.Group();
  shoulder.position.set(x,.74,0);shoulder.rotation.z=x>0?.18:-.18;group.add(shoulder);
  elbow.position.y=-.15;shoulder.add(elbow);wrist.position.y=-.13;elbow.add(wrist);
  ball(.09,cloth,[0,-.055,0],[.82,1.2,.9],shoulder);ball(.06,skin,[0,-.055,0],[.85,1.2,.9],elbow);
  ball(.065,skin,[0,-.02,.015],[.9,.8,.7],wrist);arms.push({shoulder,elbow,wrist});
 }
 if(avatar.outfit==='hoodie'){
  ball(.23,cloth,[0,.79,-.10],[1,.7,.6]);
  for(const x of [-.055,.055])box(.012,.14,.012,white,[x,.66,.172]);
  box(.19,.09,.015,cloth,[0,.48,.164]);
 }else{
  ball(.035,white,[.09,.64,.177],[1,1,.3]);
 }

 head.position.y=1.1;group.add(head);target=head;
 // Hair sits behind the face, with small locks in front of the forehead.
 ball(.325,hair,[0,1.12,-.075],[1.03,avatar.hair==='pixie'?.91:1.05,.90]);
 if(avatar.hair==='long')ball(.32,hair,[0,.99,-.16],[1.04,1.48,.68]);
 if(avatar.hair==='bob')for(const x of [-.25,.25])ball(.135,hair,[x,1.02,-.04],[.68,1.6,.95]);
 if(avatar.hair==='bun')ball(.16,hair,[0,avatar.accessory==='hat'?1.29:1.48,-.16]);
 ball(.29,skin,[0,1.10,.035],[1,1.04,.93]);
 for(const [x,y,s] of [[-.16,1.31,1.1],[.05,1.35,1.2],[.20,1.29,.8]])ball(.11,hair,[x,y,.13],[s,.65,.85]);
 for(const x of [-.10,.10]){
  ball(.029,ink,[x,1.14,.291],[.9,1.15,.7]);ball(.008,white,[x-.007,1.151,.310]);
  ball(.04,'#d98785',[x*1.7,1.055,.267],[1,.48,.25]);
 }
 ball(.022,skin,[0,1.075,.315],[.85,.7,.7]);
 const smile=add(new T.TorusGeometry(.057,.009,6,20,Math.PI),ink,[0,1.04,.305]);smile.rotation.z=Math.PI;

 if(avatar.accessory==='flower'){
  for(let i=0;i<5;i++){const angle=i/5*Math.PI*2;ball(.045,white,[.235+Math.cos(angle)*.052,1.32+Math.sin(angle)*.052,.19],[1,1,.5]);}
  ball(.033,gold,[.235,1.32,.215],[1,1,.5]);
 }
 if(avatar.accessory==='glasses'){
  for(const x of [-.105,.105])add(new T.TorusGeometry(.075,.011,6,24),gold,[x,1.14,.32]);
  box(.06,.012,.015,gold,[0,1.14,.32]);
 }
 if(avatar.accessory==='headphones'){
  add(new T.TorusGeometry(.332,.026,8,32,Math.PI),cloth,[0,1.12,0]);
  for(const x of [-.32,.32])ball(.08,cloth,[x,1.12,0],[.55,1.1,.9]);
 }
 if(avatar.accessory==='hat'){
  tube(.36,.36,.045,white,[0,1.40,0]);tube(.235,.27,.17,white,[0,1.49,0]);tube(.264,.273,.04,cloth,[0,1.43,0]);
 }
 return {group,legs,arms,head,dispose(){if(disposed)return;disposed=true;const geometries=new Set();group.traverse(node=>{if(node.isMesh)geometries.add(node.geometry);});geometries.forEach(geometry=>geometry.dispose());materials.forEach(value=>value.dispose());}};
}
