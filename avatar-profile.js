import {randomBelow} from './lucky-numbers.js';

export const AVATAR_OPTIONS={
 hair:[{id:'bob',label:'Bob bồng bềnh'},{id:'long',label:'Tóc dài'},{id:'bun',label:'Búi tròn'},{id:'pixie',label:'Tóc ngắn'}],
 hairColor:[{id:'chestnut',label:'Nâu hạt dẻ',color:'#684634'},{id:'espresso',label:'Đen cà phê',color:'#302c32'},{id:'honey',label:'Vàng mật ong',color:'#c39347'},{id:'rose',label:'Hồng khói',color:'#b8758d'},{id:'silver',label:'Bạc ánh tím',color:'#a6a0bc'}],
 outfit:[{id:'dress',label:'Váy xòe'},{id:'hoodie',label:'Hoodie ấm áp'},{id:'tee',label:'Áo thun & quần'}],
 color:[{id:'rose',label:'Hồng phấn',color:'#cf8199'},{id:'lilac',label:'Tím lilac',color:'#9d89bd'},{id:'sage',label:'Xanh lá dịu',color:'#86a58b'},{id:'sky',label:'Xanh trời',color:'#7caccb'},{id:'navy',label:'Xanh đêm',color:'#40536e'},{id:'cream',label:'Kem sữa',color:'#ead9b3'}],
 skin:[{id:'peach',label:'Đào ấm',color:'#e8b18e'},{id:'ivory',label:'Sáng dịu',color:'#f4d4b6'},{id:'honey',label:'Mật ong',color:'#c58d62'},{id:'caramel',label:'Caramel',color:'#a96e4c'},{id:'cocoa',label:'Nâu cacao',color:'#744c3a'}],
 accessory:[{id:'flower',label:'Hoa cài tóc'},{id:'glasses',label:'Kính tròn'},{id:'headphones',label:'Tai nghe'},{id:'hat',label:'Mũ đi chơi'},{id:'none',label:'Không phụ kiện'}],
};
export const AVATAR_LABELS={hair:'Kiểu tóc',hairColor:'Màu tóc',outfit:'Trang phục',color:'Màu trang phục',skin:'Tông da',accessory:'Phụ kiện'};
export const DEFAULT_AVATAR=Object.freeze(Object.fromEntries(Object.entries(AVATAR_OPTIONS).map(([key,choices])=>[key,choices[0].id])));

export function normaliseAvatar(value){
 return Object.fromEntries(Object.entries(AVATAR_OPTIONS).map(([key,choices])=>[key,choices.some(choice=>choice.id===value?.[key])?value[key]:DEFAULT_AVATAR[key]]));
}
export function randomAvatar(pick=randomBelow){return Object.fromEntries(Object.entries(AVATAR_OPTIONS).map(([key,choices])=>[key,choices[pick(choices.length)].id]));}
export function describeAvatar(value){const avatar=normaliseAvatar(value);return Object.entries(AVATAR_OPTIONS).map(([key,choices])=>choices.find(choice=>choice.id===avatar[key]).label).join(' · ');}

// Only a committed appearance reaches the journey. Closing the editor discards its draft.
export function createAvatarDraft(initial){
 let saved=normaliseAvatar(initial),draft={...saved};
 const read=()=>({...draft});
 return {read,select(key,id){if(Object.hasOwn(AVATAR_OPTIONS,key)&&AVATAR_OPTIONS[key].some(choice=>choice.id===id))draft[key]=id;return read();},
  randomize(pick){draft=randomAvatar(pick);return read();},commit(){saved=read();return read();},cancel(){draft={...saved};return read();},restore(value){saved=normaliseAvatar(value);draft={...saved};return read();}};
}
