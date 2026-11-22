
/* ============ FACHADAS DE AGUADULCE (atlas 2048x1024, casilla 512x256 = 6 m x 3 m) ============
   Inspirado en las calles reales: bloques beige/ocre/salmón con persianas marrones, terrazas,
   primera línea con cristaleras, chalés blancos con rejas, ladrillo visto de los 70. */
function paintAtlas(){
  const A=cvs(2048,1024),g=A.getContext('2d'),CW=512,CH=256,PX=CW/6;// píxeles por metro
  const cell=(i,fn)=>{const x=(i%4)*CW,y=Math.floor(i/4)*CH;g.save();g.translate(x,y);g.beginPath();g.rect(0,0,CW,CH);g.clip();fn();g.restore()};
  const R=lcg(4242);const r=()=>R();
  const plaster=(c,grime)=>{g.fillStyle=c||'#f3f0ea';g.fillRect(0,0,CW,CH);for(let i=0;i<2600;i++){const v=r();g.fillStyle=v<.5?`rgba(0,0,0,${r()*.05})`:`rgba(255,255,255,${r()*.06})`;g.fillRect(r()*CW,r()*CH,1+r()*3,1+r()*3)}
    if(grime!==false){const gr=g.createLinearGradient(0,CH-60,0,CH);gr.addColorStop(0,'rgba(60,50,40,0)');gr.addColorStop(1,'rgba(60,50,40,.10)');g.fillStyle=gr;g.fillRect(0,CH-60,CW,60);
      for(let i=0;i<6;i++){const x=r()*CW,w=2+r()*5,gr2=g.createLinearGradient(0,0,0,CH*.7);gr2.addColorStop(0,'rgba(70,60,50,.08)');gr2.addColorStop(1,'rgba(70,60,50,0)');g.fillStyle=gr2;g.fillRect(x,0,w,CH*.7)}}};
  const glassP=(x,y,w,h,tone)=>{const gr=g.createLinearGradient(x,y,x+w*.4,y+h);gr.addColorStop(0,tone?'#8fb0c4':'#6d8798');gr.addColorStop(.5,tone?'#3d5566':'#2e3d48');gr.addColorStop(1,tone?'#5d7a8c':'#40535f');g.fillStyle=gr;g.fillRect(x,y,w,h);
    g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(x+w*.15,y);g.lineTo(x+w*.42,y);g.lineTo(x+w*.12,y+h);g.lineTo(x,y+h);g.lineTo(x,y+h*.75);g.closePath();g.fill()};
  const alu=(x,y,w,h,c)=>{g.strokeStyle=c||'#c9ced2';g.lineWidth=5;g.strokeRect(x+2.5,y+2.5,w-5,h-5);g.fillStyle=c||'#c9ced2';g.fillRect(x+w/2-2,y,4,h)};
  const persiana=(x,y,w,h,c)=>{g.fillStyle=c||'#8a6a4a';g.fillRect(x,y,w,h);g.fillStyle='rgba(0,0,0,.22)';for(let k=y+3;k<y+h;k+=5)g.fillRect(x,k,w,1.5);g.fillStyle='rgba(255,255,255,.10)';for(let k=y+1;k<y+h;k+=5)g.fillRect(x,k,w,1);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,y+h-3,w,3)};
  const cajon=(x,y,w)=>{g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x-4,y-14,w+8,14);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x-4,y-14,w+8,2)};
  const sill=(x,y,w,c)=>{g.fillStyle=c||'#e2dccf';g.fillRect(x-8,y,w+16,8);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-8,y+8,w+16,4)};
  const reja=(x,y,w,h,c)=>{g.fillStyle=c||'#2a2a2a';for(let k=x+5;k<x+w;k+=10)g.fillRect(k,y,2.5,h);g.fillRect(x,y,w,3);g.fillRect(x,y+h-3,w,3);g.fillRect(x,y+h*.5,w,2.5)};
  const ac=(x,y)=>{g.fillStyle='#d9dbdb';g.fillRect(x,y,58,40);g.fillStyle='#b9bcbd';for(let k=0;k<6;k++)g.fillRect(x+4,y+6+k*5,32,2);g.fillStyle='#8f9395';g.beginPath();g.arc(x+46,y+20,9,0,TAU);g.fill();g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x,y+40,58,4)};
  const floorLine=()=>{g.fillStyle='rgba(0,0,0,.07)';g.fillRect(0,CH-10,CW,10);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(0,CH-12,CW,2)};
  // 0: piso con puerta de terraza + ventana, persianas marrones (Carlos III)
  cell(0,()=>{plaster('#f4f1ea');const door=(x)=>{glassP(x,40,92,200);persiana(x,40,92,78);alu(x,40,92,200);cajon(x,40,92)};door(70);
    glassP(330,70,110,110,1);persiana(330,70,110,44,'#9a7a56');alu(330,70,110,110);cajon(330,70,110);sill(330,180,110);if(r()<.6)ac(260,140);floorLine()});
  // 1: dos ventanas con persiana beige y balconcito de forja
  cell(1,()=>{plaster('#f5f2ea');for(const x of [80,320]){glassP(x,60,112,130);persiana(x,60,112,56,'#c8b99a');alu(x,60,112,130,'#b8bcc0');cajon(x,60,112);
    g.fillStyle='#d4cec2';g.fillRect(x-14,190,140,10);reja(x-14,150,140,42,'#3a3a3a')}floorLine()});
  // 2: primera línea: cristaleras de suelo a techo, perfil blanco
  cell(2,()=>{g.fillStyle='#f7f7f5';g.fillRect(0,0,CW,CH);glassP(8,24,496,214,1);for(let x=8;x<=504;x+=124){g.fillStyle='#eef0f0';g.fillRect(x-3,24,7,214)}g.fillStyle='#fafafa';g.fillRect(0,0,CW,24);g.fillRect(0,238,CW,18);
    g.fillStyle='rgba(255,255,255,.18)';g.fillRect(8,24,496,30);persiana(140,24,110,30,'#e8e4dc')});
  // 3: chalé, planta alta: ventana con reja y arco
  cell(3,()=>{plaster('#fbfaf6');for(const x of [90,330]){g.fillStyle='#e9e4d8';g.beginPath();g.moveTo(x-10,190);g.lineTo(x-10,80);g.arc(x+46,80,56,Math.PI,0);g.lineTo(x+102,190);g.closePath();g.fill();
    glassP(x,80,92,108);persiana(x,80,92,40,'#efe8d8');reja(x-4,80,100,108,'#262626');sill(x,188,92,'#b5653f')}});
  // 4: nave
  cell(4,()=>{g.fillStyle='#b9bec2';g.fillRect(0,0,CW,CH);for(let k=0;k<CW;k+=16){g.fillStyle='rgba(255,255,255,.22)';g.fillRect(k,0,6,CH);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(k+10,0,4,CH)}g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,0,CW,8)});
  // 5: local comercial (el toldo es 3D)
  const shop=(sign,dark)=>{plaster('#efece5',false);g.fillStyle=sign;g.fillRect(0,0,CW,46);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,0,CW,4);
    glassP(14,58,484,190);g.fillStyle='#a9b0b5';g.fillRect(14,56,484,6);g.fillRect(200,58,6,190);g.fillRect(306,58,6,190);g.fillRect(14,240,484,8);
    for(let i=0;i<22;i++){g.fillStyle=['#e74c3c','#f1c40f','#ecf0f1','#3498db','#2ecc71','#e67e22','#9b59b6'][i%7];g.globalAlpha=.5;g.fillRect(24+r()*170+(i%2?290:0),170+r()*60,10+r()*20,14+r()*20);g.globalAlpha=1}
    if(dark){g.fillStyle='rgba(20,20,20,.5)';g.fillRect(206,70,100,178)}};
  cell(5,()=>shop('#3d4a57'));cell(12,()=>shop('#6b4a2e',true));
  // 6: portal de bloque: puerta de aluminio y cristal, portero automático
  cell(6,()=>{plaster('#efe9dc');g.fillStyle='#cdbfa6';g.fillRect(0,206,CW,50);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,204,CW,3);
    g.fillStyle='#8f969c';g.fillRect(190,46,132,210);glassP(200,56,112,190,1);g.fillStyle='#b0b6bb';g.fillRect(253,56,6,190);g.fillStyle='#2c2c2c';g.fillRect(332,140,22,34);g.fillStyle='#f3e6b0';g.fillRect(232,26,48,12);
    for(const x of [50,400]){glassP(x,70,80,110);persiana(x,70,80,40,'#8a6a4a');reja(x-4,70,88,110)}});
  // 7: chalé, planta baja: puerta de madera, ventana con reja, maceta
  cell(7,()=>{plaster('#fbf9f3');g.fillStyle='#c3b496';g.fillRect(0,222,CW,34);g.fillStyle='#5a3a22';g.fillRect(70,66,104,190);g.fillStyle='#6e4a2c';for(let i=0;i<4;i++)g.fillRect(80+(i%2)*46,78+Math.floor(i/2)*86,38,72);g.fillStyle='#c9a227';g.fillRect(160,160,6,14);
    glassP(300,80,130,110);persiana(300,80,130,44,'#efe8d8');reja(296,80,138,110);sill(300,190,130,'#b5653f');for(let i=0;i<5;i++){g.fillStyle='#a0522d';g.fillRect(304+i*26,200,18,16);g.fillStyle=['#c0392b','#e84393','#27ae60','#f39c12'][i%4];g.beginPath();g.arc(313+i*26,198,11,0,TAU);g.fill()}});
  cell(8,()=>{plaster('#f2efe8')});
  cell(9,()=>{g.fillStyle='#d4b393';g.fillRect(0,0,CW,CH);g.strokeStyle='rgba(90,50,30,.2)';g.lineWidth=1.5;g.beginPath();for(let k=0;k<=CW;k+=32){g.moveTo(k,0);g.lineTo(k,CH);g.moveTo(0,k/2);g.lineTo(CW,k/2)}g.stroke();noise(g,0,0,CW,CH,900,.1)});
  cell(10,()=>{g.fillStyle='#b05a3a';g.fillRect(0,0,CW,CH);for(let y=0;y<CH;y+=16){for(let x=((y/16)%2)*16;x<CW;x+=32){const gr=g.createLinearGradient(x,0,x+32,0);gr.addColorStop(0,'#8a3f25');gr.addColorStop(.5,'#cf7a52');gr.addColorStop(1,'#8a3f25');g.fillStyle=gr;g.fillRect(x,y,32,14)}g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,y+14,CW,2)}noise(g,0,0,CW,CH,700,.12)});
  cell(11,()=>{g.fillStyle='#eef2f3';g.fillRect(0,0,CW,CH);g.fillStyle='rgba(120,140,150,.35)';for(let k=0;k<CW;k+=32)g.fillRect(k,0,3,CH);g.fillStyle='rgba(255,255,255,.6)';g.fillRect(0,120,CW,12)});
  cell(13,()=>{plaster('#ece8df');g.fillStyle='#cdbfa6';g.fillRect(0,214,CW,42);g.fillStyle='#9fa5a9';g.fillRect(56,62,400,194);g.fillStyle='rgba(0,0,0,.16)';for(let k=70;k<256;k+=16)g.fillRect(56,k,400,3);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(56,58,400,5)});
  // 14: ladrillo visto (bloques de los 70)
  cell(14,()=>{g.fillStyle='#b9775a';g.fillRect(0,0,CW,CH);for(let y=0;y<CH;y+=11){for(let x=(y/11)%2*14;x<CW;x+=28){g.fillStyle=`rgb(${165+r()*35|0},${95+r()*25|0},${70+r()*20|0})`;g.fillRect(x+1,y+1,26,9)}}
    g.fillStyle='#e8e2d6';g.fillRect(0,0,CW,16);for(const x of [80,320]){glassP(x,60,112,130);persiana(x,60,112,60,'#7a5a3e');alu(x,60,112,130,'#9aa0a5');g.fillStyle='#e8e2d6';g.fillRect(x-10,190,132,10)}});
  cell(15,()=>{g.fillStyle='#a19c94';g.fillRect(0,0,CW,CH);noise(g,0,0,CW,CH,5000,.25)});
  const t=tex(A);t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=8;return t}
function makeTextures2(){
  // aceras: baldosa hidráulica gris de 4 pastillas (la típica de las aceras), con juntas, tono variable y suciedad
  TX.walk=tileTex(512,512,(g,w,h)=>{const n=8,s=w/n;g.fillStyle='#8f8c86';g.fillRect(0,0,w,h);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=168+Math.random()*26|0,r=v,gg=v-3,b=v-9;g.fillStyle=`rgb(${r},${gg},${b})`;g.fillRect(x*s+1.5,y*s+1.5,s-3,s-3);
      const q=s/2;for(let a=0;a<2;a++)for(let c=0;c<2;c++){const px=x*s+a*q+q/2,py=y*s+c*q+q/2;const gr=g.createRadialGradient(px-4,py-4,2,px,py,q*.46);gr.addColorStop(0,'rgba(255,255,255,.16)');gr.addColorStop(1,'rgba(0,0,0,.10)');g.fillStyle=gr;g.fillRect(x*s+a*q+5,y*s+c*q+5,q-10,q-10)}
      g.strokeStyle='rgba(0,0,0,.22)';g.lineWidth=2;g.beginPath();g.moveTo(x*s+s/2,y*s+4);g.lineTo(x*s+s/2,y*s+s-4);g.moveTo(x*s+4,y*s+s/2);g.lineTo(x*s+s-4,y*s+s/2);g.stroke()}
    for(let i=0;i<22;i++){g.fillStyle=`rgba(${40+Math.random()*30|0},${35+Math.random()*25|0},30,${.04+Math.random()*.07})`;g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,8+Math.random()*40,6+Math.random()*26,Math.random()*3,0,TAU);g.fill()}
    noise(g,0,0,w,h,9000,.12)});
  // paseo marítimo: losa de piedra clara color arena con despiece a matajunta y una cenefa terracota
  TX.prom=tileTex(512,512,(g,w,h)=>{g.fillStyle='#bfae95';g.fillRect(0,0,w,h);const rh=64;
    for(let y=0;y<h/rh;y++){const off=(y&1)*64;for(let x=-1;x<w/128+1;x++){const v=Math.random()*18-9;g.fillStyle=`rgb(${222+v|0},${206+v|0},${180+v|0})`;g.fillRect(x*128+off+1.5,y*rh+1.5,125,rh-3)}}
    g.fillStyle='#b5654a';g.fillRect(0,h/2-10,w,20);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(0,h/2-11,w,1.5);g.fillRect(0,h/2+9.5,w,1.5);
    for(let i=0;i<18;i++){g.fillStyle=`rgba(90,70,50,${.03+Math.random()*.05})`;g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,10+Math.random()*50,8+Math.random()*30,Math.random()*3,0,TAU);g.fill()}
    noise(g,0,0,w,h,9000,.1)});
  TX.rail=tileTex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#f4f4f2';g.fillRect(0,0,w,7);g.fillRect(0,h-5,w,5);for(let x=3;x<w;x+=10)g.fillRect(x,0,3,h)});
  TX.railGlass=tileTex(64,64,(g,w,h)=>{g.fillStyle='rgba(170,210,225,.38)';g.fillRect(0,0,w,h);g.fillStyle='#e9eef0';g.fillRect(0,0,w,6);g.fillRect(0,0,3,h)});
  TX.balus=tileTex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#f3efe6';g.fillRect(0,0,w,9);g.fillRect(0,h-8,w,8);for(let x=8;x<w;x+=16){g.beginPath();g.ellipse(x,h/2,5,16,0,0,TAU);g.fill();g.fillRect(x-2.5,9,5,h-17)}});
  TX.awn=tileTex(64,64,(g,w,h)=>{for(let x=0;x<w;x+=16){g.fillStyle=(x/16)%2?'#ffffff':'#bdbdbd';g.fillRect(x,0,16,h)}g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,h-6,w,6)});
}
