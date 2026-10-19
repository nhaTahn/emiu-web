export const FLOWER_TYPES=Object.freeze([
 {id:'rose',name:'Hoa hồng',hint:'Cánh tròn xếp lớp',colors:[{id:'blush',name:'Hồng phấn',hex:'#e5a0bc'},{id:'red',name:'Đỏ',hex:'#b94460'},{id:'cream',name:'Kem',hex:'#f1e0b8'}]},
 {id:'tulip',name:'Tulip',hint:'Dáng hoa khum, lá dài',colors:[{id:'pink',name:'Hồng',hex:'#e5a1c2'},{id:'white',name:'Trắng',hex:'#fffaf2'},{id:'purple',name:'Tím',hex:'#ae94c9'}]},
 {id:'lily',name:'Hoa ly',hint:'Cánh dài, nhụy nổi bật',colors:[{id:'pink',name:'Hồng',hex:'#e9a6bd'},{id:'white',name:'Trắng',hex:'#fffaf2'},{id:'yellow',name:'Vàng',hex:'#f3d278'}]},
 {id:'daisy',name:'Cúc họa mi',hint:'Cánh trắng, nhụy vàng',colors:[{id:'white',name:'Trắng · nhụy vàng',hex:'#fffdf5'}]},
 {id:'other',name:'Loài hoa khác',hint:'Em ghi đúng loại em thích',colors:[]}
]);
export const ARRANGEMENTS=Object.freeze([{id:'single',name:'Một cành xinh'},{id:'small',name:'Bó nhỏ gọn'},{id:'bouquet',name:'Bó ôm vừa tay'}]);
export const GIFT_OPTIONS=Object.freeze([
 {id:'jewelry',name:'Trang sức',icon:'◇',hint:'Nhẫn, vòng hay dây chuyền?',placeholder:'Ví dụ: vòng bạc mảnh, cổ tay 15 cm…'},
 {id:'perfume',name:'Nước hoa',icon:'♧',hint:'Một mùi hương em mê',placeholder:'Tên mùi / hãng / dung tích em thích…'},
 {id:'beauty',name:'Mỹ phẩm',icon:'✧',hint:'Một món em đang thích',placeholder:'Tên món, hãng, mã màu hoặc loại da…'},
 {id:'plush',name:'Gấu bông',icon:'ʕ•ᴥ•ʔ',hint:'Một bạn nhỏ để ôm',placeholder:'Con vật, màu, kích thước em thích…'},
 {id:'date',name:'Một buổi hẹn',icon:'♡',hint:'Mình đi chơi cùng nhau',placeholder:'Em muốn đi đâu, ăn gì, vào lúc nào…'},
 {id:'other',name:'Món khác',icon:'＋',hint:'Em nói nhỏ cho anh biết',placeholder:'Em muốn nhận món gì? Ghi cụ thể nhé…'}
]);
export const LEGACY_FLOWERS=Object.freeze({'Hồng phấn':{kind:'rose',color:'blush'},'Tulip hồng':{kind:'tulip',color:'pink'},'Cúc họa mi':{kind:'daisy',color:'white'}});
export function flowerDraft(value){const legacy=LEGACY_FLOWERS[value];return legacy?{...legacy,arrangement:'',note:''}:value&&typeof value==='object'?{kind:value.kind||'',color:value.color||'',arrangement:value.arrangement||'',note:typeof value.note==='string'?value.note:''}:{kind:'',color:'',arrangement:'',note:''};}
export function validFlower(value){if(!value||typeof value!=='object')return false;const kind=FLOWER_TYPES.find(f=>f.id===value.kind);return !!kind&&typeof value.note==='string'&&value.note.length<=120&&ARRANGEMENTS.some(a=>a.id===value.arrangement)&&(kind.id==='other'?value.note.trim().length>0:kind.colors.some(c=>c.id===value.color));}
export function validPresent(value){return !!value&&typeof value==='object'&&GIFT_OPTIONS.some(g=>g.id===value.id)&&typeof value.note==='string'&&value.note.length<=120&&(value.id!=='other'||value.note.trim().length>0);}
export function flowerDescription(value){const draft=flowerDraft(value),kind=FLOWER_TYPES.find(f=>f.id===draft.kind);if(!kind)return null;return {name:kind.name,color:kind.colors.find(c=>c.id===draft.color)?.name||'',arrangement:ARRANGEMENTS.find(a=>a.id===draft.arrangement)?.name||'Chưa chọn kiểu bó',note:draft.note};}
export function buildPreferenceSummary(journey){const flower=flowerDescription(journey.gifts?.[4]),present=GIFT_OPTIONS.find(g=>g.id===journey.gifts?.[3]?.id);return ['Gửi '+journey.profile.sender+', gu 20/10 của em ♡','Từ: '+journey.profile.receiver,'',flower?'Hoa: '+[flower.name,flower.color,flower.arrangement].filter(Boolean).join(' · '):'Hoa: Em chưa chọn.',...(flower?.note?['Ghi chú hoa: '+flower.note]:[]),'',present?'Quà: '+present.name:'Quà: Em chưa chọn.',...(present&&journey.gifts[3].note?['Gợi ý món quà: '+journey.gifts[3].note]:[]),...(journey.gifts?.[1]?['','Đồ uống: '+journey.gifts[1]]:[])].join('\n');}

// Repository-native vector illustrations: the silhouette, petal shape and color
// follow the selected species. No stock-photo/emoji color mismatch.
export function flowerArt(kind,color,arrangement='bouquet'){
 const type=FLOWER_TYPES.find(f=>f.id===kind)||FLOWER_TYPES[0],tint=type.colors.find(c=>c.id===color)?.hex||type.colors[0]?.hex||'#e3bed0';
 const rose=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M0 19C-29 17-31-10-16-20C-8-33 14-31 22-15C36-1 23 23 0 19Z" fill="${tint}" stroke="#9c6479" stroke-width="1.2"/><path d="M-16-12Q-6-25 6-18Q23-14 16 1Q8 17-7 10Q-23 3-12-10Q-1-20 9-8Q18 4 4 5Q-9 5-4-5Q0-10 5-5" fill="none" stroke="#9c6479" stroke-width="1.2"/><path d="M-22 0Q-19 12-7 15M13-19Q26-7 22 5" fill="none" stroke="#9c6479" stroke-width="1"/></g>`;
 const tulip=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-21-21L-6-8L0-27L10-9L23-23Q29 18 1 24Q-26 19-21-21Z" fill="${tint}" stroke="#a27792" stroke-width="1.2"/><path d="M-6-8Q-13 12 0 24M10-9Q17 10 1 24" fill="none" stroke="#b88ca5" stroke-width="1"/></g>`;
 const daisy=(x,y)=>`<g transform="translate(${x} ${y})">${Array.from({length:12},(_,i)=>`<ellipse cx="0" cy="-16" rx="5.5" ry="15" transform="rotate(${i*30})" fill="#fffdf5" stroke="#cfc9b7" stroke-width=".8"/>`).join('')}<circle r="9.5" fill="#e6bc68"/><circle r="6.5" fill="#f0ce78"/></g>`;
 const lily=(x,y)=>`<g transform="translate(${x} ${y})">${Array.from({length:6},(_,i)=>`<g transform="rotate(${i*60})"><path d="M0 5C-14-2-14-18 0-32C14-18 14-2 0 5Z" fill="${tint}" stroke="#b98a9b" stroke-width=".9"/><path d="M0 2Q-3-12 0-25" fill="none" stroke="#cf9eaa" stroke-width=".7"/><circle cx="-3" cy="-9" r=".8" fill="#bc798d"/><circle cx="3" cy="-14" r=".8" fill="#bc798d"/></g>`).join('')}<path d="M0 5L-10-9M0 5L0-14M0 5L10-9" fill="none" stroke="#9b9961" stroke-width="1.4"/><g fill="#b98645"><ellipse cx="-10" cy="-9" rx="3.5" ry="1.5" transform="rotate(-35 -10 -9)"/><ellipse cy="-14" rx="3.5" ry="1.5"/><ellipse cx="10" cy="-9" rx="3.5" ry="1.5" transform="rotate(35 10 -9)"/></g></g>`;
 const heads=arrangement==='single'?[[100,50]]:arrangement==='small'?[[79,65],[120,65],[100,38]]:[[66,67],[134,67],[79,37],[121,37],[100,60]];
 const flowers=heads.map(([x,y])=>`<path d="M${x} ${y+18}Q${x-8} 113 100 166" fill="none" stroke="#7e967b" stroke-width="2.4"/>`+(type.id==='tulip'?`<path d="M99 145Q57 124 61 91Q90 110 99 145M103 147Q143 127 138 96Q115 111 103 147" fill="#a5b59a"/>`:'')+(type.id==='lily'?`<path d="M98 132Q69 123 72 104Q90 110 98 132M102 147Q130 136 130 117Q110 124 102 147" fill="#a5b59a"/>`:'')+(type.id==='daisy'?daisy(x,y):type.id==='tulip'?tulip(x,y):type.id==='lily'?lily(x,y):rose(x,y))).join('');
 const custom='<path d="M100 150V65M100 110Q53 102 62 73Q96 74 100 110M100 125Q148 116 140 87Q104 89 100 125" stroke="#8b9f84" stroke-width="3" fill="#bac7ad"/><circle cx="100" cy="48" r="30" fill="#f1dfeb"/><text x="100" y="60" text-anchor="middle" fill="#a16e8a" font-family="Georgia" font-size="36">?</text>';
 return `<svg viewBox="0 0 200 190" aria-hidden="true" focusable="false"><ellipse cx="100" cy="176" rx="53" ry="7" fill="#63394c0c"/>${type.id==='other'?custom:flowers}${arrangement==='single'?'':`<path d="M53 101L100 171L147 101L132 173Q100 187 68 173Z" fill="#efd6df" fill-opacity=".84" stroke="#d6b4c4" stroke-width="1"/>`}<path d="M84 154Q57 133 67 151Q71 166 99 156Q130 134 132 151Q128 167 99 156M99 156L89 178M100 156L111 178" fill="none" stroke="#b87796" stroke-width="2"/></svg>`;
}
