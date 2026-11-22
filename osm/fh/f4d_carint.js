
/* ============ COCHES v3: habitáculo completo y detalle exterior ============
   salpicadero moldeado, cuadro de instrumentos con agujas reales, pantalla central con el GPS del juego,
   volante que gira, palanca, pedales, asientos con laterales y reposacabezas, paneles de puerta, techo tapizado,
   cinturones, retrovisor, parasoles, conductor; por fuera: líneas de puertas y capó, limpiaparabrisas,
   ópticas con proyectores, matrícula española, aleta de antena, tuercas de rueda */
const INTC={dash:'#1d1e21',dashTop:'#151618',seat:'#232427',ins:'#3a3c41',carpet:'#141416',door:'#1f2023',liner:'#3c3d41',chrome:'#c9ced3',black:'#0b0c0d',screen:'#040506',stitch:'#8a1c1c'};
function rboxG(w,h,d,r){const k='rb'+w+'_'+h+'_'+d+'_'+r;if(GCACHE[k])return GCACHE[k];r=Math.min(r,w/2-.001,h/2-.001);const s=new THREE.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  const b=Math.min(.015,d/4),g=new THREE.ExtrudeGeometry(s,{depth:d-2*b,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:2,curveSegments:4});g.translate(0,0,-(d-2*b)/2);g.computeVertexNormals();return GCACHE[k]=g}
/* tira fina de A a B (para cinturones, líneas, limpiaparabrisas) */
function stripPart(a,b,w,t,col){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz)||1e-3;return[boxG(w,t,L),(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,-Math.asin(dy/L),Math.atan2(dx,dz),0,1,1,1,col]}
function plateNum(seed){const R=lcg(seed*977+31),L='BCDFGHJKLMNPRSTVWXYZ';let n=String(Math.floor(R()*9000)+1000)+' ';for(let i=0;i<3;i++)n+=L[Math.floor(R()*L.length)];return n}
function plateTex(num){const k='pl'+num;if(MATS[k])return MATS[k];const c=cvs(520,112),g=c.getContext('2d');g.fillStyle='#f4f4f0';g.fillRect(0,0,520,112);g.strokeStyle='#222';g.lineWidth=4;g.strokeRect(2,2,516,108);
  g.fillStyle='#1f3f9a';g.fillRect(4,4,62,104);g.fillStyle='#ffcc00';for(let i=0;i<12;i++){const a=i/12*TAU;g.beginPath();g.arc(35+Math.cos(a)*17,36+Math.sin(a)*17,2.6,0,TAU);g.fill()}
  g.fillStyle='#fff';g.font='bold 34px Arial,sans-serif';g.textAlign='center';g.fillText('E',35,96);g.fillStyle='#111';g.font='bold 78px "Arial Narrow",Arial,sans-serif';g.textBaseline='middle';g.fillText(num,292,60);
  return MATS[k]=new THREE.MeshStandardMaterial({map:tex(c),roughness:.35,metalness:.2})}
/* cuadro de instrumentos: velocímetro, cuentarrevoluciones, marcha, gasolina y temperatura */
function drawCluster(cv,kmh,rpm,gear,vmax){const g=cv.getContext('2d'),W=cv.width,Hh=cv.height;g.fillStyle='#050608';g.fillRect(0,0,W,Hh);
  const dial=(cx,max,val,lab,step,red)=>{const r=Hh*.42,a0=Math.PI*.75,a1=Math.PI*2.25;g.lineWidth=3;g.strokeStyle='#30343b';g.beginPath();g.arc(cx,Hh/2,r,a0,a1);g.stroke();
    for(let v=0;v<=max+1e-6;v+=step){const a=a0+(a1-a0)*v/max,big=Math.round(v/step)%2===0;g.strokeStyle=red&&v>=red?'#ff3b30':'#e8ecf2';g.lineWidth=big?3:1.5;g.beginPath();g.moveTo(cx+Math.cos(a)*(r-(big?14:8)),Hh/2+Math.sin(a)*(r-(big?14:8)));g.lineTo(cx+Math.cos(a)*r,Hh/2+Math.sin(a)*r);g.stroke();
      if(big){g.fillStyle='#cfd5dd';g.font='bold 15px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(String(Math.round(v)),cx+Math.cos(a)*(r-30),Hh/2+Math.sin(a)*(r-30))}}
    const a=a0+(a1-a0)*clamp(val/max,0,1.02);g.strokeStyle='#ff5a1f';g.lineWidth=4;g.beginPath();g.moveTo(cx-Math.cos(a)*12,Hh/2-Math.sin(a)*12);g.lineTo(cx+Math.cos(a)*(r-6),Hh/2+Math.sin(a)*(r-6));g.stroke();
    g.fillStyle='#1b1e23';g.beginPath();g.arc(cx,Hh/2,11,0,TAU);g.fill();g.fillStyle='#8d96a3';g.font='bold 12px Arial';g.fillText(lab,cx,Hh/2+r*.55)};
  const vm=Math.ceil(vmax*3.6/40)*40;dial(W*.27,vm,kmh,'km/h',20,0);dial(W*.73,8,rpm*7.2,'x1000 rpm',1,6.5);
  g.fillStyle='#eaf2ff';g.font='bold 40px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(gear<0?'R':String(gear),W*.5,Hh*.42);g.font='bold 22px Arial';g.fillText(String(Math.round(kmh)),W*.5,Hh*.68);
  g.fillStyle='#5dffb0';g.fillRect(W*.43,Hh*.84,W*.14*.72,6);g.strokeStyle='#30343b';g.strokeRect(W*.43,Hh*.84,W*.14,6)}
function carDetail(g,T,G,ti,ci,mt){const lift=T.lift||0,W=T.W,gl=T.glass.map(p=>[p[0],p[1]+lift]),prof=T.prof.map(p=>[p[0],p[1]+lift]),roof=z=>profTB(prof,z)[0];
  const wsZ=gl[3][0],wsY=gl[3][1],frZ=gl[2][0],rrZ=gl[1][0],sport=ti===2||ti===4,two=ti===4;
  const inX=z=>{const S=G.at(z);return S.P[4][0]-.075};
  const floorY=.31+lift,cushY=clamp(wsY-.5,floorY+.18,floorY+.45),seatZ=wsZ-(sport?1.05:.98),backZ=seatZ-.55,dx=.37*W/1.8;
  const eyeY=Math.min(Math.max(cushY+.66,wsY+.17),roof(backZ+.16)-.12),eyeZ=backZ+.16;
  const swZ=wsZ-.64,swY=wsY-.16,P=[],X=[],C=[];// P: interior (mate), X: exterior oscuro, C: cromado
  const ins=sport?INTC.stitch:INTC.ins;
  // ---- techo tapizado y pilares por dentro: la propia carrocería vista desde dentro
  const liner=stdMat('liner',{color:new THREE.Color(INTC.liner).convertSRGBToLinear(),roughness:.95,metalness:0,envMapIntensity:.2,side:THREE.BackSide}),hide=stdMat('hideM',{visible:false});
  const lm=new THREE.Mesh(G.body,[liner,hide,hide]);lm.receiveShadow=HQ;g.add(lm);
  // ---- suelo enmoquetado
  const hw=inX(seatZ)+.02;P.push([boxG(hw*2,.03,wsZ-rrZ+.1),0,floorY,(wsZ+rrZ)/2-.1,0,0,0,1,1,1,INTC.carpet]);
  // ---- salpicadero moldeado (perfil lateral extruido a lo ancho) con visera del cuadro
  const dw=Math.min(inX(wsZ-.3),inX(wsZ-.05))*2-.04;P.push([extrudeW([[wsZ-.06,wsY-.05],[wsZ-.22,wsY+.0],[wsZ-.4,wsY-.02],[wsZ-.47,wsY-.1],[wsZ-.43,wsY-.3],[wsZ-.3,floorY+.14],[wsZ-.06,floorY+.14]],dw,true),0,0,0,0,0,0,1,1,1,INTC.dash]);
  P.push([boxG(dw-.06,.012,.2),0,wsY-.012,wsZ-.2,-.1,0,0,1,1,1,INTC.dashTop]);
  // visera del cuadro: techo y dos mejillas (el cuadro queda dentro, a la sombra)
  P.push([rboxG(.46,.018,.22,.008),dx,wsY+.13,wsZ-.2,0,0,0,1,1,1,INTC.dashTop]);for(const e of [-1,1])P.push([extrudeW([[wsZ-.1,wsY-.02],[wsZ-.1,wsY+.13],[wsZ-.31,wsY+.13],[wsZ-.36,wsY-.03]],.02,false),dx+e*.22,0,0,0,0,0,1,1,1,INTC.dashTop]);
  // salidas de aire: dos en el centro y una en cada extremo, con lamas
  for(const vx of [-.12,.12,-dw/2+.14,dw/2-.14]){P.push([rboxG(.13,.07,.03,.015),vx,wsY-.1,wsZ-.47,0,0,0,1,1,1,'#2a2c30']);for(let k=0;k<3;k++)P.push([boxG(.11,.008,.01),vx,wsY-.12+k*.02,wsZ-.485,0,0,0,1,1,1,'#0d0e10'])}
  // consola central, palanca de cambios con fuelle, freno de mano y posavasos
  const conZ0=wsZ-.43,conZ1=backZ+.05;P.push([rboxG(.26,cushY-floorY+.02,conZ0-conZ1,.04),0,(cushY+floorY)/2,(conZ0+conZ1)/2,0,0,0,1,1,1,INTC.dash]);
  P.push([extrudeW([[wsZ-.43,wsY-.3],[wsZ-.43,floorY+.14],[wsZ-.62,cushY+.03],[wsZ-.62,wsY-.34]],.24,false),0,0,0,0,0,0,1,1,1,INTC.dash]);
  const gz=seatZ+.12;P.push([cylG(.05,.07,.07,10),0,cushY+.05,gz,0,0,0,1,1,1,'#101113'],[cylG(.012,.012,.16,6),0,cushY+.12,gz,.15,0,0,1,1,1,INTC.chrome],[sphG(.03,10,8),0,cushY+.2,gz+.012,0,0,0,1,1,1,'#18191b']);
  P.push([boxG(.035,.035,.24),0,cushY+.06,gz-.32,.22,0,0,1,1,1,'#18191b'],[cylG(.03,.03,.02,10),-.06,cushY+.035,gz-.12,0,0,0,1,1,1,'#08090a'],[cylG(.03,.03,.02,10),.06,cushY+.035,gz-.12,0,0,0,1,1,1,'#08090a']);
  // pedales
  for(const [px,w] of [[dx-.14,.07],[dx-.02,.1],[dx+.12,.06]])P.push([boxG(w,.11,.02),px,floorY+.14,wsZ-.26,-.5,0,0,1,1,1,'#2b2d30']);
  // asientos delanteros: banqueta y respaldo con laterales, reposacabezas sobre varillas cromadas
  const seat=(sx,z0,back)=>{const sw=sport?.5:.48;
    P.push([extrudeW([[z0+.02,cushY-.02],[z0-.02,cushY+.02],[z0-.48,cushY+.0],[z0-.52,cushY-.1],[z0-.45,floorY+.06],[z0,floorY+.06]],sw,true),sx,0,0,0,0,0,1,1,1,INTC.seat]);
    P.push([boxG(sw*.56,.012,.4),sx,cushY+.022,z0-.24,0,0,0,1,1,1,ins]);
    for(const e of [-1,1])P.push([rboxG(.08,sport?.1:.06,.44,.03),sx+e*(sw/2-.05),cushY+(sport?.04:.02),z0-.24,0,0,0,1,1,1,INTC.seat]);
    if(!back)return;const bz=z0-.5,bh=Math.min(.62,eyeY-cushY-.08),tilt=-.22;
    P.push([rboxG(sw,bh,.13,.05),sx,cushY+bh/2,bz-.04,tilt,0,0,1,1,1,INTC.seat]);P.push([boxG(sw*.5,bh*.75,.012),sx,cushY+bh*.48,bz+.03-.012,tilt,0,0,1,1,1,ins]);
    for(const e of [-1,1])P.push([rboxG(.08,bh*.8,.17,.03),sx+e*(sw/2-.04),cushY+bh*.45,bz-.02,tilt,0,0,1,1,1,INTC.seat]);
    const hy=cushY+bh+.1,hz=bz-.04-Math.sin(-tilt)*bh;for(const e of [-1,1])P.push([cylG(.007,.007,.1,6),sx+e*.07,hy-.07,hz,tilt,0,0,1,1,1,INTC.chrome]);
    P.push([rboxG(.26,.16,.09,.04),sx,hy,hz-.01,tilt*.6,0,0,1,1,1,INTC.seat])};
  for(const s of [-1,1])seat(s*dx,seatZ,true);
  // asiento trasero corrido con tres reposacabezas (no en el biplaza)
  const rearOk=!two&&rrZ<backZ-.45;if(rearOk){const rz0=backZ-.22,rw=hw*2-.12,rcY=cushY+.02;
    P.push([extrudeW([[rz0,rcY],[rz0-.46,rcY],[rz0-.5,rcY-.1],[rz0-.44,floorY+.06],[rz0,floorY+.06]],rw,true),0,0,0,0,0,0,1,1,1,INTC.seat]);
    const rbh=Math.min(.58,roof(rz0-.5)-rcY-.24);if(rbh>.2){P.push([rboxG(rw,rbh,.12,.05),0,rcY+rbh/2,rz0-.56,-.2,0,0,1,1,1,INTC.seat]);
      for(const hx of [-rw/3,0,rw/3])P.push([rboxG(.24,.13,.08,.035),hx,rcY+rbh+.08,rz0-.6-rbh*.2,-.12,0,0,1,1,1,INTC.seat])}}
  // paneles de puerta: tapizado, reposabrazos, maneta, altavoz e interruptores
  for(const s of [-1,1]){const z0=wsZ-.35,z1=rearOk?rrZ+.35:backZ-.25,zm=(z0+z1)/2,x=s*(inX(zm)+.03);
    P.push([boxG(.03,wsY-floorY-.12,z0-z1),x,(wsY+floorY)/2-.04,zm,0,0,0,1,1,1,INTC.door]);
    P.push([rboxG(.07,.05,.42,.02),x-s*.04,cushY+.2,seatZ-.2,0,0,0,1,1,1,INTC.seat]);P.push([boxG(.015,.03,.09),x-s*.03,cushY+.33,seatZ-.02,0,0,0,1,1,1,INTC.chrome]);
    P.push([cylG(.07,.07,.012,14),x-s*.018,floorY+.2,seatZ+.05,0,0,Math.PI/2,1,1,1,'#2c2e32']);P.push([boxG(.04,.012,.1),x-s*.07,cushY+.226,seatZ-.08,0,0,0,1,1,1,'#0c0d0f'])}
  // retrovisor interior y parasoles
  const ry0=roof(frZ-.05);P.push([cylG(.008,.008,.06,6),0,ry0-.04,frZ-.06,0,0,0,1,1,1,'#202124'],[rboxG(.25,.065,.03,.02),0,ry0-.1,frZ-.08,.1,0,0,1,1,1,'#18191b']);const mirY=ry0-.1,mirZ=frZ-.097;
  for(const s of [-1,1])P.push([rboxG(.3,.012,.14,.005),s*dx,roof(frZ-.14)-.022,frZ-.14,.05,0,0,1,1,1,'#3e3f43']);
  // cinturones (del pilar B al anclaje junto a la banqueta)
  for(const s of [-1,1]){const bx=s*(inX(backZ)-.02);P.push(stripPart([bx,eyeY-.05,backZ-.08],[s*(dx-.28),cushY+.06,seatZ-.38],.045,.006,'#141518'));P.push(stripPart([s*(dx-.28),cushY+.06,seatZ-.38],[s*(dx+.26),cushY+.04,seatZ-.3],.045,.006,'#141518'))}
  // pilares A por dentro (la luna delantera ahora es más ancha)
  for(const s of [-1,1]){let pp=null;for(let k=0;k<=6;k++){const z=wsZ+(frZ-wsZ)*k/6,S=G.at(z),q=S.P[5],p=[s*(q[0]-.03),q[1]+(S.P[6][1]-q[1])*.15,S.z];if(pp)P.push(stripPart(pp,p,.07,.03,INTC.liner));pp=p}}
  const intMesh=new THREE.Mesh(linVC(mergeParts(P)),stdMat('intVC',{vertexColors:true,roughness:.8,metalness:.02,envMapIntensity:.25}));intMesh.receiveShadow=HQ;g.add(intMesh);
  // ---- volante (gira con la dirección) sobre la columna
  const col=new THREE.Group();col.position.set(dx,swY,swZ);col.rotation.x=.33;g.add(col);
  const colM=new THREE.Mesh(cylG(.035,.045,.32,10),stdMat('swM',{color:0x0d0e10,roughness:.7,envMapIntensity:.2}));colM.rotation.x=Math.PI/2;colM.position.z=.17;col.add(colM);
  const sw=new THREE.Group();col.add(sw);const rimM=stdMat('swRim',{color:0x0b0c0d,roughness:.75,metalness:0,envMapIntensity:.12});
  sw.add(new THREE.Mesh(hcG('swRim',()=>new THREE.TorusGeometry(.185,.022,8,32)),rimM));
  const hub=new THREE.Mesh(hcG('swHub',()=>{const k=new THREE.CylinderGeometry(.06,.068,.05,18);k.rotateX(Math.PI/2);return k}),rimM);hub.position.z=.012;sw.add(hub);
  for(const a of [0,Math.PI,-Math.PI/2]){const sp=new THREE.Mesh(boxG(.11,.032,.018),stdMat('swSp',{color:0x1a1b1e,metalness:.6,roughness:.4,envMapIntensity:.35}));sp.position.set(Math.cos(a)*.13,Math.sin(a)*.13,.008);sp.rotation.z=a;sw.add(sp)}
  // ---- cuadro de instrumentos y pantalla central
  const clCv=cvs(512,192);drawCluster(clCv,0,.15,1,T.vmax);const clT=tex(clCv);const cl=new THREE.Mesh(new THREE.PlaneGeometry(.38,.145),new THREE.MeshBasicMaterial({map:clT,toneMapped:false}));
  cl.position.set(dx,wsY+.055,wsZ-.3);cl.rotation.set(-.2,Math.PI,0);g.add(cl);
  const scM=new THREE.MeshBasicMaterial({color:0x0b1a24,toneMapped:false});const sc=new THREE.Mesh(new THREE.PlaneGeometry(.25,.15),scM);sc.position.set(0,wsY-.15,wsZ-.475);sc.rotation.set(-.12,Math.PI,0);g.add(sc);
  // ---- conductor (se oculta en la vista interior)
  const R=lcg(ci*131+ti*17+3),shirt=['#2b4c7e','#a33a3a','#e7e7e2','#2f6b45','#3a3a3d','#c58b2b'][Math.floor(R()*6)],skin=['#e0b796','#c99a7a','#8d5f43'][Math.floor(R()*3)],hair=['#24170f','#5a3b22','#b9a68a','#121212'][Math.floor(R()*4)];
  const hx=dx,tz=backZ+.06,D=[[rboxG(.38,.5,.22,.08),hx,cushY+.3,tz,-.18,0,0,1,1,1,shirt],[cylG(.05,.055,.08,8),hx,cushY+.58,tz+.04,0,0,0,1,1,1,skin],[sphG(.1,12,10),hx,eyeY+.01,eyeZ-.02,0,0,0,.95,1.1,1.05,skin],[sphG(.104,12,10),hx,eyeY+.05,eyeZ-.045,0,0,0,.97,.95,1.05,hair],
    [rboxG(.16,.14,.44,.06),hx-.1,cushY+.07,seatZ-.22,0,0,0,1,1,1,'#2b3445'],[rboxG(.16,.14,.44,.06),hx+.1,cushY+.07,seatZ-.22,0,0,0,1,1,1,'#2b3445']];
  // brazos: el hombro es fijo y la mano va agarrada al aro del volante (gira con él); el codo se calcula cada fotograma
  const armM=stdMat('arm'+shirt,{color:new THREE.Color(shirt).convertSRGBToLinear(),roughness:.85,envMapIntensity:.3}),skinM=stdMat('skin'+skin,{color:new THREE.Color(skin).convertSRGBToLinear(),roughness:.7,envMapIntensity:.3});
  const arms=[];for(const e of [-1,1]){const hand=new THREE.Mesh(hcG('handG',()=>{const k=new THREE.SphereGeometry(.042,10,8);k.scale(1,.8,1.25);return k}),skinM);const a=e>0?.38:Math.PI-.38;hand.position.set(Math.cos(a)*.185,Math.sin(a)*.185,-.03);sw.add(hand);
    const up=new THREE.Mesh(hcG('armG',()=>new THREE.CylinderGeometry(.05,.045,1,8)),armM),fo=new THREE.Mesh(hcG('foreG',()=>new THREE.CylinderGeometry(.043,.036,1,8)),armM);g.add(up);g.add(fo);
    arms.push({sh:new THREE.Vector3(hx+e*.2,cushY+.48,tz+.04),e,hand,up,fo})}
  const drv=new THREE.Mesh(linVC(mergeParts(D)),stdMat('drvVC',{vertexColors:true,roughness:.8,envMapIntensity:.3}));drv.receiveShadow=HQ;g.add(drv);
  // ---- exterior: líneas de puertas, capó y maletero, limpiaparabrisas, antena
  const fz=G.fz,rz=G.rz;
  const sideLine=(z,j0,j1)=>{const S=G.at(z);for(const s of [-1,1])for(let j=j0;j<j1;j++){const a=S.P[j],b=S.P[j+1];X.push(stripPart([s*(a[0]+.004),a[1],S.z],[s*(b[0]+.004),b[1],S.z],.006,.006,INTC.black))}};
  const zB=zB_(T);sideLine(wsZ-.08,1,5);if(rearOk&&!two){sideLine(rrZ+.12,1,5)}sideLine(zB,1,4);
  const hoodL=(z0,z1,j)=>{for(const s of [-1,1]){let pz=null;for(let k=0;k<=8;k++){const z=z0+(z1-z0)*k/8,S=G.at(z),p=[s*(S.P[j][0]+.002),S.P[j][1]+.004,S.z];if(pz)X.push(stripPart(pz,p,.006,.006,INTC.black));pz=p}}};
  hoodL(wsZ+.06,fz-.22,6);{const S=G.at(fz-.22);X.push(stripPart([-S.P[6][0],S.P[6][1]+.006,S.z],[S.P[6][0],S.P[6][1]+.006,S.z],.006,.006,INTC.black))}
  if(!two&&ti!==0&&ti!==3)hoodL(rz+.2,gl[0][0]-.06,6);
  for(const s of [-1,1])X.push(stripPart([s*.05,wsY+.025,wsZ-.05],[s*.55,wsY+.04,wsZ-.09],.02,.012,INTC.black));
  X.push([sphG(.05,8,6),0,roof(rrZ+.2)+.03,rrZ+.2,0,0,0,.7,.9,2.6,'#0d0e10']);
  // rejilla del capó/torpedo y molduras de ventanilla
  for(const s of [-1,1]){let pz=null;for(let k=0;k<=10;k++){const z=gl[0][0]+.05+(wsZ-.05-gl[0][0]-.05)*k/10,S=G.at(z),bl=gl[0][1]+(gl[3][1]-gl[0][1])*clamp((z-gl[0][0])/((wsZ-gl[0][0])||1),0,1)-.02,p=[s*(S.P[4][0]+.006),bl,S.z];if(pz)C.push(stripPart(pz,p,.012,.012,INTC.chrome));pz=p}}
  if(X.length)g.add(new THREE.Mesh(linVC(mergeParts(X)),stdMat('extVC',{vertexColors:true,roughness:.5,metalness:.2})));
  if(C.length)g.add(new THREE.Mesh(linVC(mergeParts(C)),stdMat('chrVC',{vertexColors:true,roughness:.15,metalness:1})));
  // matrículas españolas (número propio por coche)
  const pm=plateTex(plateNum(ti*1000+ci*37+(g.id||0)));for(const [z,y,r] of [[fz+.028,.47+lift,0],[rz-.024,.5+lift,Math.PI]]){const p=new THREE.Mesh(hcG('plateG',()=>new THREE.PlaneGeometry(.52,.112)),pm);p.position.set(0,y,z);p.rotation.y=r;g.add(p)}
  // retrovisor interior: espejo de verdad en el coche del jugador (textura en directo), plateado en los demás
  const mir=new THREE.Mesh(hcG('mirP',()=>new THREE.PlaneGeometry(.23,.05)),stdMat('mirI',{color:0x9fb6c8,metalness:1,roughness:.08}));mir.position.set(0,mirY,mirZ-.003);mir.rotation.set(.1,Math.PI,0);g.add(mir);
  return{sw,col,cl,clCv,clT,sc,scM,drv,lm,arms,mir,mirPos:new THREE.Vector3(0,mirY,mirZ-.05),eye:new THREE.Vector3(dx,eyeY,eyeZ),swZ}}
/* mergeParts guarda los colores tal cual (sRGB); para que los oscuros se vean oscuros se pasan a lineal */
function linVC(g){const c=g.attributes.color.array;for(let i=0;i<c.length;i++)c[i]=Math.pow(c[i],2.2);return g}
function hcG(k,f){return GCACHE[k]||(GCACHE[k]=f())}
/* cada fotograma: volante y (sólo en la vista interior del jugador) agujas y GPS */
let _clT=0,_scTex=null;
const _yA=new THREE.Vector3(0,1,0),_va=new THREE.Vector3(),_vb=new THREE.Vector3(),_vc=new THREE.Vector3();
function limb(m,a,b){_vc.subVectors(b,a);const L=_vc.length()||1e-3;m.position.copy(a).addScaledVector(_vc,.5);m.quaternion.setFromUnitVectors(_yA,_vc.multiplyScalar(1/L));m.scale.set(1,L,1)}
/* espejo retrovisor en directo: una cámara mirando hacia atrás pinta una textura pequeña cada 3 fotogramas (no en móvil) */
const MIRR={rt:null,cam:null,n:0,mat:null};
function mirrorUpdate(c,I){if(!HQ||IS_TOUCH)return;if(!MIRR.rt){MIRR.rt=new THREE.WebGLRenderTarget(320,70);MIRR.rt.texture.wrapS=THREE.RepeatWrapping;MIRR.rt.texture.repeat.x=-1;MIRR.rt.texture.offset.x=1;
    MIRR.cam=new THREE.PerspectiveCamera(24,320/70,.3,260);MIRR.mat=new THREE.MeshBasicMaterial({map:MIRR.rt.texture,toneMapped:true})}
  if(I.mir.material!==MIRR.mat)I.mir.material=MIRR.mat;if((MIRR.n++%3)!==0)return;const b=c.m.userData.body;const p=I.mirPos.clone();b.localToWorld(p);const t=I.mirPos.clone().add(new THREE.Vector3(0,-.3,-20));b.localToWorld(t);
  MIRR.cam.position.copy(p);MIRR.cam.up.set(0,1,0);MIRR.cam.lookAt(t);I.mir.visible=false;const old=renderer.getRenderTarget();renderer.setRenderTarget(MIRR.rt);renderer.render(scene,MIRR.cam);renderer.setRenderTarget(old);I.mir.visible=true}
function carInterior(c,dt,inside){const u=c.m.userData;if(!u.int)return;const I=u.int;if(I.bike)return bikeInterior(c,dt,inside);I.sw.rotation.z=-c.steer*2.6;I.drv.visible=!inside;
  // brazos: solo si el coche está cerca de la cámara
  if(I.arms&&(inside||camera.position.distanceToSquared(c.m.position)<3600)){const b=u.body;c.m.updateMatrixWorld(true);for(const A of I.arms){A.hand.getWorldPosition(_va);b.worldToLocal(_va);const el=_vb.copy(A.sh).add(_va).multiplyScalar(.5);el.x+=A.e*.09;el.y-=.12;limb(A.up,A.sh,el);limb(A.fo,el,_va)}}
  if(!inside){if(I.mir.material===MIRR.mat&&MIRR.mat)I.mir.material=stdMat('mirI',{});return}mirrorUpdate(c,I);
  _clT-=dt;if(_clT>0)return;_clT=1/15;const kmh=Math.abs(c.vf||0)*3.6;drawCluster(I.clCv,kmh,c.rpm||.15,c.gear||1,CARS[c.t].vmax);I.clT.needsUpdate=true;
  const mini=$('mini');if(mini){if(!_scTex||_scTex.image!==mini){_scTex=new THREE.CanvasTexture(mini);_scTex.encoding=THREE.sRGBEncoding}if(I.scM.map!==_scTex){I.scM.map=_scTex;I.scM.color.set(0xffffff);I.scM.needsUpdate=true}_scTex.needsUpdate=true}}
