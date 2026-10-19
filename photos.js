const MAX_PHOTOS=12;
let database,memory=new Map();
function db(){return database??=(new Promise((resolve,reject)=>{const request=indexedDB.open('emiu-photos',1);request.onupgradeneeded=()=>request.result.createObjectStore('photos',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}));}
async function transact(mode,action){const store=await db();return new Promise((resolve,reject)=>{const tx=store.transaction('photos',mode),request=action(tx.objectStore('photos'));let result;request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
export async function listPhotos(){let saved=[];try{saved=await transact('readonly',s=>s.getAll());}catch{/* Use the in-memory album when browser storage is unavailable. */}return [...new Map([...saved,...memory.values()].map(photo=>[photo.id,photo])).values()];}
export async function preparePhoto(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Chọn ảnh JPG, PNG hoặc WebP giúp anh nhé.');
 if(file.size>15*1024*1024)throw Error('Ảnh này hơi lớn. Em chọn ảnh dưới 15 MB nhé.');
 const url=URL.createObjectURL(file),image=new Image();
 try{image.src=url;await image.decode();const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.88));if(!blob)throw Error();return {id:crypto.randomUUID(),blob,name:file.name.slice(0,100)};}catch(error){throw Error(error.message?.startsWith('Chọn')?error.message:'Chưa đọc được ảnh này. Em thử một ảnh khác nhé.');}finally{URL.revokeObjectURL(url);}
}
export async function addPhotos(files){const current=await listPhotos();if(current.length+files.length>MAX_PHOTOS)throw Error('Mình giữ tối đa 12 ảnh trên thiết bị này nhé.');const prepared=[];for(const file of files)prepared.push(await preparePhoto(file));for(const photo of prepared){try{await transact('readwrite',s=>s.put(photo));}catch{memory.set(photo.id,photo);}}return prepared;}
export async function imageFromPhoto(photo){if(!photo)return null;const image=new Image(),url=photo.blob?URL.createObjectURL(photo.blob):photo.url;try{image.src=url;await image.decode();return image;}finally{if(photo.blob)URL.revokeObjectURL(url);}}
