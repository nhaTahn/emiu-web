export const STOPS=Array.from({length:8},(_,i)=>({x:Math.sin(i*Math.PI/4)*5,z:Math.cos(i*Math.PI/4)*4.4}));
export const TARGETS=STOPS.map(p=>({x:p.x,z:p.z+.68}));
export function canStand(p){return Number.isFinite(p?.x)&&Number.isFinite(p?.z)&&(p.x/7.2)**2+(p.z/6.25)**2<1&&!(Math.abs(p.x)<1.98&&p.z> -1.85&&p.z<1.92);}
export function clearLine(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.07));for(let i=0;i<=n;i++)if(!canStand({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n}))return false;return true;}
export function findPath(from,to){
 if(!canStand(from)||!canStand(to))return [];if(clearLine(from,to))return [{...to}];
 const cell=.28,point=(x,z)=>({x:x*cell,z:z*cell}),key=(x,z)=>x+','+z;
 function snap(p){const x=Math.round(p.x/cell),z=Math.round(p.z/cell);for(let r=0;r<3;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if(clearLine(p,point(x+a,z+b)))return {x:x+a,z:z+b};return null;}
 const start=snap(from),end=snap(to);if(!start||!end)return [];
 const target=key(end.x,end.z),open=[{...start,cost:0,score:0}],costs=new Map([[key(start.x,start.z),0]]),parents=new Map(),closed=new Set();let found;
 while(open.length){let best=0;for(let i=1;i<open.length;i++)if(open[i].score<open[best].score)best=i;const n=open.splice(best,1)[0],id=key(n.x,n.z);if(closed.has(id))continue;if(id===target){found=id;break;}closed.add(id);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=n.x+dx,z=n.z+dz,k=key(x,z),cost=n.cost+Math.hypot(dx,dz);if(cost>=(costs.get(k)??Infinity)||!clearLine(point(n.x,n.z),point(x,z)))continue;costs.set(k,cost);parents.set(k,id);open.push({x,z,cost,score:cost+Math.hypot(x-end.x,z-end.z)});}
 }
 if(!found)return [];const path=[{...to}];while(found){const [x,z]=found.split(',').map(Number);path.push(point(x,z));found=parents.get(found);}path.reverse();const smooth=[];let last=from;
 for(let i=0;i<path.length;){let j=path.length-1;while(j>i&&!clearLine(last,path[j]))j--;smooth.push(path[j]);last=path[j];i=j+1;}return smooth;
}
const keys=new Map([['KeyW',[0,1]],['ArrowUp',[0,1]],['KeyS',[0,-1]],['ArrowDown',[0,-1]],['KeyA',[-1,0]],['ArrowLeft',[-1,0]],['KeyD',[1,0]],['ArrowRight',[1,0]]]);
export function direction(pressed,yaw){let x=0,f=0;for(const k of pressed){const v=keys.get(k);if(v){x+=v[0];f+=v[1];}}const n=Math.hypot(x,f);return n?{x:(Math.cos(yaw)*x-Math.sin(yaw)*f)/n,z:(-Math.sin(yaw)*x-Math.cos(yaw)*f)/n}:{x:0,z:0};}
export function step(p,v,dt){const n=Math.hypot(v.x,v.z);if(!n||!Number.isFinite(dt)||dt<=0)return {...p};const distance=Math.min(dt,.15)*3,parts=Math.ceil(distance/.05),dx=v.x/n*distance/parts,dz=v.z/n*distance/parts;const q={...p};for(let i=0;i<parts;i++){if(canStand({x:q.x+dx,z:q.z+dz})){q.x+=dx;q.z+=dz;}else{if(canStand({x:q.x+dx,z:q.z}))q.x+=dx;if(canStand({x:q.x,z:q.z+dz}))q.z+=dz;}}return q;}
export const MOVEMENT_KEYS=new Set(keys.keys());
