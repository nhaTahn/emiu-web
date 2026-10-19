import {validFlower,validPresent} from './preferences.js';

export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const person=value=>typeof value==='string'&&value.trim()&&Array.from(value.trim()).length<=40?value.trim():null;
export function preferenceSnapshot(journey){
 const flower=validFlower(journey?.gifts?.[4])?journey.gifts[4]:null,present=validPresent(journey?.gifts?.[3])?journey.gifts[3]:null;
 if(!flower&&!present)return null;
 return {sender:person(journey.profile?.sender)||'Anh',receiver:person(journey.profile?.receiver)||'Em yêu',flower:flower?{kind:flower.kind,color:flower.color,arrangement:flower.arrangement,note:flower.note.trim()}:null,present:present?{id:present.id,note:present.note.trim()}:null};
}
export function validatePreferencePayload(input,eventId){
 if(!input||input.schemaVersion!==1||input.eventId!==eventId||!UUID.test(input.sessionId||'')||!UUID.test(input.requestId||'')||!Number.isSafeInteger(input.sequence)||input.sequence<1||input.sequence>1000000000||!person(input.sender)||!person(input.receiver))throw Error('invalid');
 if(input.flower!==null&&!validFlower(input.flower)||input.present!==null&&!validPresent(input.present)||!input.flower&&!input.present)throw Error('invalid');
 return {schemaVersion:1,eventId,sessionId:input.sessionId,requestId:input.requestId,sequence:input.sequence,...preferenceSnapshot({profile:input,gifts:{3:input.present,4:input.flower}})};
}
// User text is never evaluated as a spreadsheet formula.
export function sheetText(value){const text=String(value??'');return /^[\s\u0000-\u001f]*[=+@-]/.test(text)?"'"+text:text;}
