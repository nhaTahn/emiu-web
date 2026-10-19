export const AVATAR_ACTIONS=Object.freeze([
 {id:'heart',label:'Thả tim',icon:'♡',duration:2.6},
 {id:'wave',label:'Vẫy tay',icon:'✋',duration:2.6},
 {id:'dance',label:'Nhún nhảy',icon:'♫',duration:3.2},
 {id:'hug',label:'Ôm một cái',icon:'🫶',duration:2.8},
 {id:'pose',label:'Tạo dáng',icon:'✦',duration:2.8},
 {id:'sixseven',label:'67!',icon:'⑥⑦',duration:3.4}
]);
export const neutralAvatarPose=()=>({lift:0,turn:0,tilt:0,head:[0,0,0],shoulders:[[0,0,-.18],[0,0,.18]],elbows:[[0,0,0],[0,0,0]],wrists:[[0,0,0],[0,0,0]],legs:[[0,0,0],[0,0,0]]});
export function sampleAvatarAction(id,phase,{reducedMotion=false}={}){
 if(!AVATAR_ACTIONS.some(a=>a.id===id))return null;
 const p=neutralAvatarPose();if(!Number.isFinite(phase)||phase<=0||phase>=1)return p;
 const t=reducedMotion?.5:phase,e=Math.sin(Math.PI*t),wave=Math.sin(t*Math.PI*6);
 if(id==='heart'){p.shoulders=[[-.7*e,0,-.55*e],[-.7*e,0,.55*e]];p.elbows=[[-1.45*e,0,.4*e],[-1.45*e,0,-.4*e]];p.head[2]=.16*e;p.lift=.07*e;}
 if(id==='wave'){p.shoulders[1]=[0,0,2.65*e];p.elbows[1]=[0,0,.25*wave*e];p.wrists[1][2]=wave*.6*e;p.head[2]=-.12*e;}
 if(id==='dance'){p.shoulders=[[-.6*e,0,(-.9+wave*.35)*e],[.4*e,0,(.9+wave*.35)*e]];p.elbows=[[-.8*e,0,0],[-.8*e,0,0]];p.legs=[[wave*.4*e,0,0],[-wave*.4*e,0,0]];p.lift=Math.abs(wave)*.13*e;p.turn=wave*.25*e;p.tilt=wave*.12*e;}
 if(id==='hug'){p.shoulders=[[-1.1*e,-.6*e,-.65*e],[-1.1*e,.6*e,.65*e]];p.elbows=[[-.7*e,0,.7*e],[-.7*e,0,-.7*e]];p.head[0]=.12*e;}
 if(id==='pose'){p.shoulders=[[-.4*e,0,-.6*e],[0,0,2.5*e]];p.elbows[1]=[-.8*e,0,.55*e];p.wrists[1][2]=-.5*e;p.head[2]=-.22*e;p.tilt=.08*e;p.legs[0][2]=-.15*e;}
 if(id==='sixseven')for(let side=0;side<2;side++){p.shoulders[side]=[-.35*e,0,(side?1:-1)*.65*e];p.elbows[side]=[(-1.2+(side?1:-1)*wave*.4)*e,0,0];p.wrists[side]=[-Math.PI/2*e-p.shoulders[side][0]-p.elbows[side][0],0,0];}
 if(reducedMotion){p.lift=0;p.turn=0;p.tilt=0;}return p;
}
function apply(rig,p){
 rig.group.position.y=p.lift;rig.group.rotation.set(0,p.turn,p.tilt);rig.head.rotation.set(...p.head);
 rig.arms.forEach((arm,i)=>{arm.shoulder.rotation.set(...p.shoulders[i]);arm.elbow.rotation.set(...p.elbows[i]);arm.wrist.rotation.set(...p.wrists[i]);});rig.legs.forEach((leg,i)=>leg.rotation.set(...p.legs[i]));
}
export function readAvatarPose(rig){const angles=node=>[node.rotation.x,node.rotation.y,node.rotation.z];return {lift:rig.group.position.y,turn:rig.group.rotation.y,tilt:rig.group.rotation.z,head:angles(rig.head),shoulders:rig.arms.map(a=>angles(a.shoulder)),elbows:rig.arms.map(a=>angles(a.elbow)),wrists:rig.arms.map(a=>angles(a.wrist)),legs:rig.legs.map(angles)};}
export function createAvatarActionPlayer({getRig,effects={},isBlocked=()=>false,reducedMotion=false,onChange=()=>{}}){
 let state=null,rig=null;
 function stop(){if(!state)return;apply(rig,neutralAvatarPose());effects.clear?.();state=null;rig=null;onChange(null);}
 return {stop,current:()=>state?{...state}:null,play(id){const action=AVATAR_ACTIONS.find(a=>a.id===id);if(!action||isBlocked())return false;stop();rig=getRig();state={id,progress:0,duration:action.duration};effects.start?.({id,reducedMotion});onChange({...state});return true;},tick(dt){if(!state)return;if(isBlocked()||getRig()!==rig){stop();return;}if(!Number.isFinite(dt)||dt<=0)return;state.progress=Math.min(1,state.progress+dt/state.duration);apply(rig,sampleAvatarAction(state.id,state.progress,{reducedMotion}));effects.update?.({...state,reducedMotion});if(state.progress>=1)stop();}};
}
