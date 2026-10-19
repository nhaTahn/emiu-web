import {preferenceSnapshot,validatePreferencePayload,UUID} from './preference-record.js';

export function isPreferenceEndpoint(value){try{const u=new URL(value);return u.origin==='https://script.google.com'&&/^\/macros\/s\/[\w-]+\/exec$/.test(u.pathname)&&!u.search&&!u.hash&&!u.username&&!u.password;}catch{return false;}}
export function readPreferenceReceipt(endpoint,requestId,timeoutMs=10000){
 return new Promise((resolve,reject)=>{
  const callback='__emiuReceipt_'+crypto.randomUUID().replaceAll('-',''),script=document.createElement('script'),url=new URL(endpoint);
  let timer;const clean=()=>{clearTimeout(timer);script.remove();delete window[callback];};
  window[callback]=value=>{clean();resolve(value);};script.onerror=()=>{clean();reject(Error('Chưa đọc được xác nhận.'));};
  timer=setTimeout(()=>{clean();reject(Error('Google chưa xác nhận.'));},timeoutMs);
  for(const [key,value] of Object.entries({action:'receipt',requestId,callback,_:String(Date.now())}))url.searchParams.set(key,value);
  script.src=url.href;script.referrerPolicy='no-referrer';document.head.append(script);
 });
}
export async function sendPreference({endpoint,payload,fetchImpl=fetch,readReceipt=readPreferenceReceipt,pause=ms=>new Promise(resolve=>setTimeout(resolve,ms)),attempts=2,timeoutMs=15000}){
 if(!isPreferenceEndpoint(endpoint))throw Error('Chưa kết nối bảng riêng của anh.');
 for(let attempt=0;attempt<attempts;attempt++){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{await fetchImpl(endpoint,{method:'POST',mode:'no-cors',credentials:'omit',signal:controller.signal,headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload)});}catch{/* A timed-out write may already exist. Keep its request ID. */}finally{clearTimeout(timer);}
  let receipt;try{receipt=await readReceipt(endpoint,payload.requestId);}catch{/* Retry the same write, never claim opaque POST means saved. */}
  if(receipt?.requestId===payload.requestId&&receipt.sequence===payload.sequence){
   if(receipt.status==='accepted')return receipt;
   if(receipt.status==='rejected')throw Error(({stale:'Có phiên chọn mới hơn. Em tải lại trang nhé.',closed:'Bảng đang tạm ngừng nhận lựa chọn.',full:'Bảng đã đầy. Em gửi bản tóm tắt cho anh nhé.',invalid:'Chưa gửi được lựa chọn. Em kiểm tra lại nhé.'})[receipt.code]||'Bảng riêng chưa nhận được lựa chọn.');
  }
  if(attempt+1<attempts)await pause(650);
 }
 throw Error('Google chưa xác nhận. Lựa chọn đã giữ trên máy; em có thể gửi lại.');
}

export function createPreferenceSync({config={},storage,send=sendPreference,uuid=()=>crypto.randomUUID(),onChange=()=>{}}){
 const enabled=config.enabled===true&&isPreferenceEndpoint(config.endpoint)&&/^[a-z0-9-]{1,64}$/.test(config.eventId||''),key='emiu-sheet-sync-v1',scope=config.endpoint+'|'+config.eventId;
 let state={scope,sessionId:uuid(),sequence:0,pending:null,acknowledged:'',savedAt:''},flight=null,phase=enabled?'idle':'disabled',message='';
 try{const stored=JSON.parse(storage?.getItem(key)||'null');if(stored?.scope===scope&&UUID.test(stored.sessionId||'')&&Number.isSafeInteger(stored.sequence)&&stored.sequence>=0){if(stored.pending)validatePreferencePayload(stored.pending,config.eventId);state={...state,...stored};phase=state.pending?'pending':state.acknowledged?'saved':phase;}}catch{/* Corrupt storage cannot manufacture a successful receipt. */}
 const fingerprint=payload=>JSON.stringify({sender:payload.sender,receiver:payload.receiver,flower:payload.flower,present:payload.present});
 const status=()=>({phase:enabled?phase:'disabled',message,savedAt:state.savedAt,hasPending:!!state.pending,enabled});
 const publish=()=>{try{storage?.setItem(key,JSON.stringify(state));}catch{/* Memory-only sync still works when storage is unavailable. */}onChange(status());};
 function flush(){
  if(!enabled||!state.pending)return Promise.resolve();if(flight)return flight;
  flight=(async()=>{
   while(state.pending){
    const payload=state.pending;phase='sending';message='';publish();
    try{
     const receipt=await send({endpoint:config.endpoint,payload});
     if(receipt?.status!=='accepted'||receipt.requestId!==payload.requestId||receipt.sequence!==payload.sequence)throw Error('Google chưa xác nhận.');
     if(state.pending?.requestId===payload.requestId){state.acknowledged=fingerprint(payload);state.pending=null;state.savedAt=new Date().toISOString();phase='saved';publish();}
    }catch(error){if(state.pending?.requestId!==payload.requestId)continue;phase='error';message=error.message||'Chưa gửi được lựa chọn.';publish();break;}
   }
  })().finally(()=>{flight=null;});return flight;
 }
 function queue(journey){
  if(!enabled)return false;const snapshot=preferenceSnapshot(journey);if(!snapshot)return false;const stamp=JSON.stringify(snapshot);
  if(state.pending&&fingerprint(state.pending)===stamp){void flush();return true;}
  if(!state.pending&&state.acknowledged===stamp){phase='saved';publish();return true;}
  state.sequence++;state.pending={schemaVersion:1,eventId:config.eventId,sessionId:state.sessionId,requestId:uuid(),sequence:state.sequence,...snapshot};phase=flight?'sending':'pending';message='';publish();void flush();return true;
 }
 return {queue,retry:flush,status};
}
