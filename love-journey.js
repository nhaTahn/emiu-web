import {normaliseAvatar} from './avatar-profile.js';
import {validFlower,validPresent,LEGACY_FLOWERS} from './preferences.js';

export const STATIONS=Object.freeze([
 {id:'ticket',icon:'♡',name:'Vé hẹn hò',short:'Bắt đầu',gift:'Một lời hẹn',description:'Hôm nay, anh giữ riêng một cuộc hẹn nhỏ cho em.'},
 {id:'drink',icon:'☕',name:'Quán của hai mình',short:'Quán nhỏ',gift:'Một ly yêu thích',description:'Em chọn món mình thích. Anh chọn ngồi cạnh em.'},
 {id:'reason',icon:'✉',name:'Những điều anh thương',short:'Lời thương',gift:'Một điều đáng yêu',description:'Có những điều rất nhỏ, mà làm anh thương em nhiều hơn.'},
 {id:'present',icon:'◇',name:'Món quà em thích',short:'Chọn quà',gift:'Một món em thích',description:'Em cho anh một chút gợi ý, để món quà thật đúng gu em.'},
 {id:'bouquet',icon:'✿',name:'Tiệm hoa tặng em',short:'Tiệm hoa',gift:'Một bó hoa',description:'Không cần đợi một dịp thật lớn để được nhận hoa.'},
 {id:'promise',icon:'∞',name:'Chiếc lọ dịu dàng',short:'Lời hứa',gift:'Một lời hứa',description:'Một điều anh muốn cùng em giữ, kể cả những ngày bình thường.'},
 {id:'memory',icon:'▧',name:'Khung trời hai đứa',short:'Kỷ niệm',gift:'Một khung nhớ',description:'Giữ lại một tấm ảnh, hay một khoảnh khắc em muốn nhớ.'},
 {id:'letter',icon:'♥',name:'Chỉ dành cho em',short:'Thư gửi em',description:'Bảy món quà nhỏ. Và một lời thương anh để dành ở cuối đường.'}
]);
export const DRINKS=['Trà sữa trân châu','Matcha latte','Trà đào','Cacao ấm','Cà phê sữa','Một ly em tự chọn'];
export const REASONS=['Nụ cười của em','Sự dịu dàng rất riêng','Cách em quan tâm','Những ý tưởng đáng yêu','Cả những lúc em mè nheo','Đơn giản, vì đó là em'];
export const FLOWERS=['Hồng phấn','Tulip hồng','Cúc họa mi'];
export const PROMISES=['Lắng nghe em nhiều hơn.','Dành thời gian cho hai đứa.','Ôm em vào những ngày mệt.','Cùng em làm những điều nhỏ xíu.'];
const clean=(s,fallback)=>typeof s==='string'&&s.trim()?Array.from(s.trim()).slice(0,40).join(''):fallback;
export function normaliseProfile(value={},defaults={}){value=value&&typeof value==='object'?value:{};return {sender:clean(value.sender,clean(defaults.sender,'Anh')),receiver:clean(value.receiver,clean(defaults.receiver,'Em yêu')),avatar:normaliseAvatar(value.avatar)};}
export function validGift(index,value){
 if(index===0)return value==='Một lời hẹn';
 if(index===1)return DRINKS.includes(value);
 if(index===2)return REASONS.includes(value);
 if(index===3)return validPresent(value);
 if(index===4)return validFlower(value)||typeof value==='string'&&Object.hasOwn(LEGACY_FLOWERS,value);
 if(index===5)return PROMISES.includes(value);
 if(index===6)return value&&typeof value.caption==='string'&&value.caption.length<=180&&typeof value.photoId==='string'&&value.photoId.length<=150;
 return false;
}
export function progress(gifts={}){const collected=STATIONS.slice(0,7).map((_,i)=>validGift(i,gifts[i])===true);let next=collected.indexOf(false);if(next<0)next=7;return {collected,count:collected.filter(Boolean).length,next,complete:next===7};}
export function canVisit(index,gifts){return Number.isInteger(index)&&index>=0&&index<8&&index<=progress(gifts).next;}
export function normaliseJourney(value={},defaults={}){value=value&&typeof value==='object'?value:{};const gifts={};for(let i=0;i<7;i++){const entry=value.gifts?.[i];if(!validGift(i,entry))continue;gifts[i]=i===3?{id:entry.id,note:entry.note}:i===4&&typeof entry==='object'?{kind:entry.kind,color:entry.color,arrangement:entry.arrangement,note:entry.note}:i===6?{caption:entry.caption,photoId:entry.photoId}:entry;}return {version:2,started:value.started===true,profile:normaliseProfile(value.profile,defaults),gifts};}
export function collectGift(journey,index,value){if(!canVisit(index,journey.gifts)||!validGift(index,value))return journey;return {...journey,gifts:{...journey.gifts,[index]:value}};}
export function loadJourney(storage,defaults){try{return normaliseJourney(JSON.parse(storage?.getItem('emiu-journey-v1')||'{}'),defaults);}catch{return normaliseJourney({},defaults);}}
export function saveJourney(storage,journey){try{storage?.setItem('emiu-journey-v1',JSON.stringify(journey));return true;}catch{return false;}}
