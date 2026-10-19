import {AVATAR_OPTIONS,normaliseAvatar} from './avatar-profile.js';
export const CARD_STYLES=[{id:'ballet',name:'Nơ hồng ballet',background:'#fff4f7',ink:'#773c53',accent:'#bb7a96',soft:'#f0cede'},{id:'rose',name:'Vườn hồng',background:'#fae9e5',ink:'#71434b',accent:'#ab6d78',soft:'#e9bcc5'},{id:'muse',name:'Pink Muse',background:'#f4c3d7',ink:'#702d4e',accent:'#a4446c',soft:'#ffe9f0'}];
export function safeFileName(name){return (String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'em-yeu');}
function rounded(ctx,x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function fit(ctx,value,size,width,font='Georgia'){while(size>18){ctx.font=`${size}px ${font}`;if(ctx.measureText(value).width<=width)break;size-=1;}return size;}
function centered(ctx,value,x,y,size,color,width=900,font='Georgia'){ctx.fillStyle=color;fit(ctx,value,size,width,font);ctx.textAlign='center';ctx.fillText(value,x,y);}
function lines(ctx,value,width,size,font){ctx.font=`${size}px ${font}`;const result=[];let row='';for(const word of value.split(/\s+/)){if(row&&ctx.measureText(row+' '+word).width>width){result.push(row);row=word;}else row=(row+' '+word).trim();}if(row)result.push(row);return result;}
function bow(ctx,x,y,scale,accent,soft){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle=soft;ctx.strokeStyle=accent;ctx.lineWidth=1.3;for(const s of [-1,1]){ctx.save();ctx.scale(s,1);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(20,-14,60,-40,62,-10);ctx.bezierCurveTo(65,16,20,14,0,0);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(2,4);ctx.bezierCurveTo(10,25,12,44,38,60);ctx.lineTo(23,53);ctx.lineTo(16,68);ctx.bezierCurveTo(4,43,0,21,-3,4);ctx.fill();ctx.stroke();ctx.restore();}ctx.fillStyle=accent;ctx.beginPath();ctx.ellipse(0,0,6,8,0,0,Math.PI*2);ctx.fill();ctx.restore();}
function bloom(ctx,x,y,r,soft,accent){ctx.fillStyle=soft;for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*r*.58,y+Math.sin(a)*r*.58,r*.52,r*.52,0,0,Math.PI*2);ctx.fill();}ctx.fillStyle=accent;ctx.beginPath();ctx.arc(x,y,r*.25,0,Math.PI*2);ctx.fill();}
export function drawAvatar(ctx,avatar,x,y,scale=1){
 const a=normaliseAvatar(avatar),color=key=>AVATAR_OPTIONS[key].find(v=>v.id===a[key]).color;
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 const hair=color('hairColor'),skin=color('skin'),cloth=color('color');
 const ellipse=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
 ellipse(0,155,92,15,'#663c4a18');
 if(a.hair==='long')rounded(ctx,-69,-137,138,180,58,hair);else ellipse(0,-77,70,a.hair==='pixie'?64:83,hair);
 if(a.hair==='bun')ellipse(0,-157,32,29,hair);
 rounded(ctx,-31,74,20,68,10,skin);rounded(ctx,11,74,20,68,10,skin);ellipse(-22,144,22,12,'#fff9ef');ellipse(22,144,22,12,'#fff9ef');
 if(a.outfit==='dress'){ctx.fillStyle=cloth;ctx.beginPath();ctx.moveTo(-38,-5);ctx.lineTo(38,-5);ctx.lineTo(64,95);ctx.lineTo(-64,95);ctx.closePath();ctx.fill();}else rounded(ctx,-48,-8,96,102,20,cloth);
 for(const d of [-1,1]){ellipse(52*d,24,17,30,cloth);ellipse(59*d,59,13,16,skin);}
 ellipse(0,-71,61,68,skin);ellipse(-30,-123,39,18,hair);ellipse(22,-132,40,15,hair);
 for(const d of [-1,1]){ellipse(23*d,-75,5.5,8,'#40353c');ellipse(21*d,-79,1.7,2.2,'#ffffff');ellipse(37*d,-49,12,5,'#d98b96');}
 ctx.strokeStyle='#664354';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-49,12,.12*Math.PI,.88*Math.PI);ctx.stroke();
 if(a.accessory==='flower')bloom(ctx,52,-117,18,'#fff8ee','#d9ac67');
 if(a.accessory==='glasses'){ctx.strokeStyle='#a47c43';for(const d of [-1,1]){ctx.beginPath();ctx.arc(d*24,-75,19,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.moveTo(-5,-77);ctx.lineTo(5,-77);ctx.stroke();}
 if(a.accessory==='headphones'){ctx.strokeStyle=cloth;ctx.lineWidth=9;ctx.beginPath();ctx.arc(0,-75,71,Math.PI,2*Math.PI);ctx.stroke();ellipse(-70,-67,10,23,cloth);ellipse(70,-67,10,23,cloth);}
 if(a.accessory==='hat'){ellipse(0,-133,87,15,'#ead9b3');rounded(ctx,-53,-177,106,47,18,'#fff6e5');rounded(ctx,-54,-141,108,9,3,cloth);}
 ctx.restore();
}
export function drawLoveCard(canvas,{profile,message,occasion='20 · 10',image,style='ballet',format='post'}){
 const theme=CARD_STYLES.find(v=>v.id===style)||CARD_STYLES[0];canvas.width=1080;canvas.height=format==='story'?1920:1350;const c=canvas.getContext('2d'),h=canvas.height,tall=h>1500;
 c.fillStyle=theme.background;c.fillRect(0,0,1080,h);c.strokeStyle=theme.accent;c.lineWidth=1;c.strokeRect(36,36,1008,h-72);
 c.textAlign='left';c.font='600 17px Arial';c.fillStyle=theme.accent;c.fillText('CHỈ DÀNH RIÊNG CHO EM',75,87);c.textAlign='right';c.fillText(occasion,1005,87);
 if(style==='muse'){c.textAlign='left';c.fillStyle=theme.ink;c.font='italic 110px Georgia';c.fillText('my muse.',75,230);}else{if(style==='ballet')bow(c,540,132,.75,theme.accent,theme.soft);else{bloom(c,135,183,46,theme.soft,theme.accent);bloom(c,950,183,46,theme.soft,theme.accent);}centered(c,'Em là điều dịu dàng nhất.',540,260,49,theme.ink,870,'Georgia');}
 const y=tall?370:320,ph=tall?900:590;
 rounded(c,86,y-14,908,ph+28,6,'#fffcf9');
 if(image){const scale=Math.max(880/image.naturalWidth,ph/image.naturalHeight),w=image.naturalWidth*scale,hh=image.naturalHeight*scale;c.save();c.beginPath();c.rect(100,y,880,ph);c.clip();c.drawImage(image,100+(880-w)/2,y+(ph-hh)/2,w,hh);c.restore();}else{rounded(c,100,y,880,ph,0,theme.soft);c.fillStyle=theme.background;c.beginPath();c.arc(540,y+ph*.47,ph*.39,0,Math.PI*2);c.fill();drawAvatar(c,profile.avatar,540,y+ph*.52,Math.min(1.8,ph/290));bloom(c,228,y+ph*.72,46,theme.background,theme.accent);bloom(c,854,y+ph*.25,36,theme.background,theme.accent);}
 const nameY=y+ph+110;centered(c,profile.receiver,540,nameY,58,theme.ink,880,'Georgia');
 const rows=lines(c,message,820,31,'Georgia').slice(0,3);rows.forEach((row,i)=>centered(c,row,540,nameY+73+i*43,31,theme.ink,880,'Georgia'));
 centered(c,'Gửi em, tất cả dịu dàng.  —  '+profile.sender,540,h-94,21,theme.accent,880,'Arial');
 return {width:canvas.width,height:canvas.height};
}
export function encodePng(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Chưa tạo được ảnh. Em thử lại nhé.')),'image/png'));}
