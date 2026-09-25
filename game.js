(() => {
  const W = 640, H = 400;
  const canvas = document.getElementById("view");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const panel = document.getElementById("panel");
  const hud = document.getElementById("hud");
  const msgEl = document.getElementById("msg");
  const FOV = Math.PI / 3;
  const MOVE = 3.1;
  const TURN = 2.4;
  const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,3,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,5,0,0,0,3,0,0,5,0,0,1,0,0,0,6,0,0,1],
    [1,0,0,0,1,0,0,0,0,0,3,0,0,0,0,0,4,0,0,0,0,0,0,1],
    [1,1,4,1,1,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,4,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,4,0,0,0,4,0,0,0,0,5,0,0,0,0,0,0,4,0,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,1,1,1,1,2,2,2,1,1,1,4,1,1,1,1,2,2,2,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,4,0,0,0,0,0,0,4,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,4,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,4,1,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,4,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,4,1,1,0,0,0,0,0,0,1,1,4,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,3,0,0,0,5,0,0,3,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];
  const MW = MAP[0].length, MH = MAP.length;
  const SECTORS = [
    { name:"AIRLOCK", x:2, y:18 }, { name:"COOLANT", x:6, y:10 },
    { name:"SPINE", x:12, y:10 }, { name:"HAB", x:19, y:10 }, { name:"CORE", x:20, y:2 }
  ];
  function makeTex(paint) {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"); paint(g, 64); return g.getImageData(0,0,64,64);
  }
  const textures = {
    1: makeTex((g,s)=>{g.fillStyle="#1b242c";g.fillRect(0,0,s,s);g.fillStyle="#24303a";for(let y=0;y<s;y+=8)for(let x=0;x<s;x+=16)g.fillRect(x+(y%16?8:0),y,14,6);g.strokeStyle="#0d1216";for(let i=0;i<=s;i+=8){g.beginPath();g.moveTo(0,i);g.lineTo(s,i);g.stroke();}g.fillStyle="#3ee0ff22";g.fillRect(28,28,8,8);}),
    2: makeTex((g,s)=>{g.fillStyle="#2a1a10";g.fillRect(0,0,s,s);g.fillStyle="#d48a12";for(let i=-s;i<s*2;i+=12)g.fillRect(i,0,6,s);g.fillStyle="#00000055";g.fillRect(0,0,s,s);}),
    3: makeTex((g,s)=>{g.fillStyle="#101820";g.fillRect(0,0,s,s);g.fillStyle="#2a8a9a";g.fillRect(10,0,8,s);g.fillRect(28,0,10,s);g.fillRect(48,0,6,s);g.fillStyle="#3ee0ff";g.fillRect(13,0,2,s);g.fillRect(31,0,2,s);}),
    4: makeTex((g,s)=>{g.fillStyle="#3a4048";g.fillRect(0,0,s,s);g.fillStyle="#11151a";g.fillRect(8,6,48,52);g.fillStyle="#ff2a3a";g.fillRect(26,28,12,8);}),
    5: makeTex((g,s)=>{g.fillStyle="#1a0e14";g.fillRect(0,0,s,s);g.fillStyle="#5a1a38";for(let i=0;i<40;i++){g.beginPath();g.arc(Math.random()*s,Math.random()*s,2+Math.random()*6,0,6.3);g.fill();}g.fillStyle="#ff2a3a55";g.fillRect(0,20,s,8);}),
    6: makeTex((g,s)=>{g.fillStyle="#081018";g.fillRect(0,0,s,s);g.fillStyle="#3ee0ff";g.beginPath();g.arc(32,32,18,0,6.3);g.fill();g.fillStyle="#081018";g.beginPath();g.arc(32,32,10,0,6.3);g.fill();})
  };
  function spriteAlien(kind){
    const c=document.createElement("canvas");c.width=c.height=64;const g=c.getContext("2d");g.clearRect(0,0,64,64);
    if(kind==="crawler"){g.fillStyle="#2a4a22";g.beginPath();g.ellipse(32,40,18,12,0,0,6.3);g.fill();g.fillStyle="#3a6a28";g.beginPath();g.ellipse(32,28,12,14,0,0,6.3);g.fill();g.fillStyle="#ff2a3a";g.beginPath();g.arc(26,24,3,0,6.3);g.fill();g.beginPath();g.arc(38,24,3,0,6.3);g.fill();g.fillStyle="#1a3018";g.fillRect(14,44,6,12);g.fillRect(44,44,6,12);}
    else{g.fillStyle="#3a2030";g.fillRect(22,18,20,28);g.fillStyle="#5a3048";g.beginPath();g.ellipse(32,14,10,12,0,0,6.3);g.fill();g.fillStyle="#3ee0ff";g.beginPath();g.arc(28,12,2.5,0,6.3);g.fill();g.beginPath();g.arc(36,12,2.5,0,6.3);g.fill();g.fillStyle="#201018";g.fillRect(18,46,10,16);g.fillRect(36,46,10,16);}
    return g.getImageData(0,0,64,64);
  }
  const SPR={crawler:spriteAlien("crawler"),stalker:spriteAlien("stalker")};
  let state="title", player={x:2.5,y:18.5,a:-Math.PI/2,hp:100,ammo:24,kills:0};
  let enemies=[], pickups=[], zbuf=new Float32Array(W), keys=Object.create(null);
  let shooting=false, shootCD=0, muzzle=0, last=0, msgT=0, pointer=false;
  let joy={x:0,y:0};
  function wall(x,y){const ix=x|0,iy=y|0;if(ix<0||iy<0||ix>=MW||iy>=MH)return 1;return MAP[iy][ix];}
  function blocked(x,y){return wall(x,y)>0;}
  function toast(t){msgEl.textContent=t;msgEl.classList.add("show");msgT=2.2;}
  function resetGame(){
    player={x:2.5,y:18.5,a:-Math.PI/2,hp:100,ammo:24,kills:0};
    enemies=[
      {x:6.5,y:18.5,hp:18,kind:"crawler",speed:1.15,dmg:8,hit:0},
      {x:10.5,y:18.5,hp:18,kind:"crawler",speed:1.2,dmg:8,hit:0},
      {x:6.5,y:10.5,hp:22,kind:"crawler",speed:1.3,dmg:9,hit:0},
      {x:3.5,y:6.5,hp:20,kind:"crawler",speed:1.25,dmg:8,hit:0},
      {x:11.5,y:6.5,hp:28,kind:"stalker",speed:1.55,dmg:12,hit:0},
      {x:18.5,y:6.5,hp:22,kind:"crawler",speed:1.2,dmg:9,hit:0},
      {x:19.5,y:10.5,hp:26,kind:"stalker",speed:1.45,dmg:11,hit:0},
      {x:21.5,y:14.5,hp:20,kind:"crawler",speed:1.2,dmg:8,hit:0},
      {x:14.5,y:14.5,hp:24,kind:"stalker",speed:1.5,dmg:12,hit:0},
      {x:11.5,y:10.5,hp:30,kind:"stalker",speed:1.6,dmg:13,hit:0},
      {x:19.5,y:2.5,hp:40,kind:"stalker",speed:1.35,dmg:14,hit:0},
      {x:21.5,y:2.5,hp:22,kind:"crawler",speed:1.25,dmg:10,hit:0}
    ];
    pickups=[
      {x:3.5,y:14.5,type:"ammo",n:12,taken:false},{x:6.5,y:6.5,type:"hp",n:35,taken:false},
      {x:14.5,y:10.5,type:"ammo",n:16,taken:false},{x:18.5,y:14.5,type:"hp",n:30,taken:false},
      {x:21.5,y:6.5,type:"ammo",n:18,taken:false},{x:2.5,y:2.5,type:"hp",n:40,taken:false}
    ];
    shooting=false;shootCD=0;muzzle=0;
  }
  function showTitle(){
    state="title";hud.classList.remove("on");overlay.classList.remove("hidden");
    panel.innerHTML='<h1>VOIDSTATION</h1><div class="sub">SECTOR HELIX-9</div><p class="lore">The station went dark after the biomass hit the coolant loop. You are the last tech still answering comms. Purge the corridors. Reach the CORE.</p><p class="hint">WASD MOVE &nbsp; MOUSE LOOK &nbsp; CLICK / SPACE FIRE</p><button class="cta" id="go">DEPLOY</button>';
    document.getElementById("go").onclick=startPlay;
  }
  function showEnd(win){
    state=win?"win":"dead";hud.classList.remove("on");overlay.classList.remove("hidden");
    try{document.exitPointerLock();}catch(e){}
    pointer=false;
    panel.innerHTML=win?('<h1>PURGE COMPLETE</h1><div class="sub">CORE STABILIZED</div><p class="lore">Hostiles down: '+player.kills+'. Helix-9 still holds pressure.</p><button class="cta" id="go">RUN IT BACK</button>'):('<h1>SIGNAL LOST</h1><div class="sub">HULL BREACH</div><p class="lore">Kills '+player.kills+'. Get up. The pumps are still running.</p><button class="cta" id="go">REDEPLOY</button>');
    document.getElementById("go").onclick=startPlay;
  }
  function startPlay(){resetGame();state="play";overlay.classList.add("hidden");hud.classList.add("on");toast("AIRLOCK SEALED — SWEEP FORWARD");canvas.requestPointerLock&&canvas.requestPointerLock();}
  function sectorName(){let best="VOID",bd=99;for(const s of SECTORS){const d=Math.hypot(player.x-s.x,player.y-s.y);if(d<bd){bd=d;best=s.name;}}return best;}
  function tryMove(nx,ny){const r=0.18;if(!blocked(nx-r,player.y)&&!blocked(nx+r,player.y))player.x=nx;if(!blocked(player.x,ny-r)&&!blocked(player.x,ny+r))player.y=ny;}
  function cast(rayA){
    const sin=Math.sin(rayA),cos=Math.cos(rayA);
    let mapX=player.x|0,mapY=player.y|0;
    const deltaX=Math.abs(1/(cos||1e-8)),deltaY=Math.abs(1/(sin||1e-8));
    let stepX,stepY,sideX,sideY,side=0,hit=0,guard=0;
    if(cos<0){stepX=-1;sideX=(player.x-mapX)*deltaX;}else{stepX=1;sideX=(mapX+1-player.x)*deltaX;}
    if(sin<0){stepY=-1;sideY=(player.y-mapY)*deltaY;}else{stepY=1;sideY=(mapY+1-player.y)*deltaY;}
    while(!hit&&guard++<48){if(sideX<sideY){sideX+=deltaX;mapX+=stepX;side=0;}else{sideY+=deltaY;mapY+=stepY;side=1;}if(mapX<0||mapY<0||mapX>=MW||mapY>=MH){hit=1;break;}hit=MAP[mapY][mapX];}
    let dist=side===0?(mapX-player.x+(1-stepX)/2)/cos:(mapY-player.y+(1-stepY)/2)/sin;
    dist=Math.max(0.05,dist);
    let wallX=side===0?player.y+dist*sin:player.x+dist*cos;wallX-=Math.floor(wallX);
    return {dist,side,hit:hit||1,wallX};
  }
  function drawWorld(){
    const img=ctx.createImageData(W,H),d=img.data;
    for(let y=0;y<H;y++){
      const ceil=y<H/2,t=ceil?1-y/(H/2):(y-H/2)/(H/2);
      let r,g,b;if(ceil){r=4+t*8;g=8+t*14;b=14+t*22;}else{r=8+t*18;g=10+t*16;b=12+t*10;}
      for(let x=0;x<W;x++){const i=(y*W+x)*4,fl=((x^y)&16)?2:0;d[i]=r+fl;d[i+1]=g+fl;d[i+2]=b;d[i+3]=255;}
    }
    for(let x=0;x<W;x++){
      const rayA=player.a-FOV/2+(x/W)*FOV,c=cast(rayA),dist=c.dist*Math.cos(rayA-player.a);
      zbuf[x]=dist;
      const lineH=Math.min(H*4,(H/dist)|0);let y0=((H-lineH)/2)|0,y1=y0+lineH;if(y0<0)y0=0;if(y1>H)y1=H;
      const tex=textures[c.hit]||textures[1],tx=Math.min(63,(c.wallX*64)|0);
      const shade=Math.max(0.18,Math.min(1,1.15/(1+dist*0.22)))*(c.side?0.72:1);
      const step=64/lineH;let texY=(y0-(H-lineH)/2)*step;
      for(let y=y0;y<y1;y++){const ty=Math.min(63,texY|0);texY+=step;const pi=(ty*64+tx)*4,i=(y*W+x)*4;d[i]=tex.data[pi]*shade;d[i+1]=tex.data[pi+1]*shade;d[i+2]=tex.data[pi+2]*shade;}
    }
    const sprites=[];
    for(const e of enemies){if(e.hp<=0)continue;sprites.push({x:e.x,y:e.y,img:SPR[e.kind],hit:e.hit,kind:"e"});}
    for(const p of pickups){if(p.taken)continue;sprites.push({x:p.x,y:p.y,kind:p.type,hit:0});}
    sprites.sort((a,b)=>((b.x-player.x)**2+(b.y-player.y)**2)-((a.x-player.x)**2+(a.y-player.y)**2));
    for(const s of sprites){
      const dx=s.x-player.x,dy=s.y-player.y,dist=Math.hypot(dx,dy);if(dist<0.15)continue;
      let a=Math.atan2(dy,dx)-player.a;while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;if(Math.abs(a)>FOV)continue;
      const sx=((a+FOV/2)/FOV)*W,size=Math.min(H*1.6,H/(dist*Math.cos(a))),x0=(sx-size/2)|0,y0=((H-size)/2)|0;
      if(s.kind==="ammo"||s.kind==="hp"){
        const col=s.kind==="hp"?[255,42,58]:[62,224,255];
        for(let x=0;x<size;x++){const cx=x0+x;if(cx<0||cx>=W||dist>=zbuf[cx])continue;const mid=Math.abs(x-size/2)<size*0.18;
          for(let y=0;y<size;y++){const cy=y0+y;if(cy<0||cy>=H)continue;const my=Math.abs(y-size/2)<size*0.18;if(!(mid||my))continue;if(Math.hypot(x-size/2,y-size/2)>size*0.42)continue;const i=(cy*W+cx)*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];}}
        continue;
      }
      const tex=s.img,flash=s.hit>0;
      for(let x=0;x<size;x++){const cx=x0+x;if(cx<0||cx>=W||dist>=zbuf[cx]+0.05)continue;const tx=Math.min(63,((x/size)*64)|0);
        for(let y=0;y<size;y++){const cy=y0+y;if(cy<0||cy>=H)continue;const ty=Math.min(63,((y/size)*64)|0);const pi=(ty*64+tx)*4;if(tex.data[pi+3]<20)continue;const i=(cy*W+cx)*4,sh=Math.max(0.25,1.1/(1+dist*0.18));d[i]=Math.min(255,tex.data[pi]*sh+(flash?80:0));d[i+1]=tex.data[pi+1]*sh;d[i+2]=tex.data[pi+2]*sh;}}
    }
    if(muzzle>0){const gx=(W/2)|0,gy=(H*0.58)|0;for(let y=-18;y<=18;y++)for(let x=-8;x<=8;x++){if(x*x+y*y>80)continue;const i=((gy+y)*W+(gx+x))*4;d[i]=255;d[i+1]=220;d[i+2]=120;}}
    ctx.putImageData(img,0,0);
    ctx.save();ctx.translate(W*0.62,H*0.78);ctx.fillStyle="#1a2228";ctx.fillRect(-18,-10,90,70);ctx.fillStyle=muzzle>0?"#ffb020":"#2a333c";ctx.fillRect(20,-6,54,16);ctx.fillStyle="#0d1216";ctx.fillRect(-12,8,28,40);ctx.restore();
  }
  function fire(){
    if(state!=="play"||shootCD>0)return;if(player.ammo<=0){toast("CELL EMPTY — FIND A PACK");return;}
    player.ammo--;shootCD=0.22;muzzle=0.07;let best=null,bestD=14;
    for(const e of enemies){if(e.hp<=0)continue;const dx=e.x-player.x,dy=e.y-player.y,dist=Math.hypot(dx,dy);if(dist>12)continue;let a=Math.atan2(dy,dx)-player.a;while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;if(Math.abs(a)>0.12+0.04*dist)continue;const hit=cast(player.a);if(hit.dist+0.15<dist)continue;if(dist<bestD){bestD=dist;best=e;}}
    if(best){best.hp-=14;best.hit=0.12;if(best.hp<=0){player.kills++;toast(best.kind==="stalker"?"STALKER DOWN":"CRAWLER DOWN");if(enemies.every(e=>e.hp<=0))showEnd(true);}}
  }
  function update(dt){
    if(state!=="play")return;shootCD=Math.max(0,shootCD-dt);muzzle=Math.max(0,muzzle-dt);if(msgT>0){msgT-=dt;if(msgT<=0)msgEl.classList.remove("show");}
    let mx=0,my=0;if(keys.KeyW||keys.ArrowUp)my+=1;if(keys.KeyS||keys.ArrowDown)my-=1;if(keys.KeyA||keys.ArrowLeft)mx-=1;if(keys.KeyD||keys.ArrowRight)mx+=1;mx+=joy.x;my-=joy.y;if(keys.KeyQ)player.a-=TURN*dt;if(keys.KeyE)player.a+=TURN*dt;
    const c=Math.cos(player.a),s=Math.sin(player.a),spd=(keys.ShiftLeft||keys.ShiftRight)?1.35:1;
    tryMove(player.x+(c*my+-s*mx)*MOVE*spd*dt,player.y+(s*my+c*mx)*MOVE*spd*dt);
    if(shooting||keys.Space)fire();
    for(const p of pickups){if(p.taken)continue;if(Math.hypot(p.x-player.x,p.y-player.y)<0.55){p.taken=true;if(p.type==="hp"){player.hp=Math.min(100,player.hp+p.n);toast("MEDFOAM +"+p.n);}else{player.ammo+=p.n;toast("CELL PACK +"+p.n);}}}
    for(const e of enemies){if(e.hp<=0)continue;e.hit=Math.max(0,e.hit-dt);const dx=player.x-e.x,dy=player.y-e.y,dist=Math.hypot(dx,dy);if(dist<10&&dist>0.35){const nx=e.x+(dx/dist)*e.speed*dt,ny=e.y+(dy/dist)*e.speed*dt;if(!blocked(nx,e.y))e.x=nx;if(!blocked(e.x,ny))e.y=ny;}if(dist<0.55){player.hp-=e.dmg*dt*1.6;if(player.hp<=0){player.hp=0;showEnd(false);return;}}}
    document.getElementById("hp").textContent=Math.ceil(player.hp);
    document.getElementById("ammo").textContent=player.ammo;
    document.getElementById("kills").textContent=player.kills;
    document.getElementById("sec").textContent=sectorName();
  }
  function fit(){const s=Math.min(window.innerWidth/W,window.innerHeight/H);canvas.style.width=(W*s)+"px";canvas.style.height=(H*s)+"px";}
  function loop(t){const dt=Math.min(0.033,(t-last)/1000||0.016);last=t;update(dt);drawWorld();requestAnimationFrame(loop);}
  window.addEventListener("keydown",e=>{keys[e.code]=true;if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();if(e.code==="KeyF"&&canvas.requestFullscreen)canvas.requestFullscreen();if(state!=="play"&&(e.code==="Enter"||e.code==="Space"))startPlay();});
  window.addEventListener("keyup",e=>{keys[e.code]=false;});
  canvas.addEventListener("mousedown",()=>{if(state!=="play")return;if(!pointer&&canvas.requestPointerLock)canvas.requestPointerLock();shooting=true;fire();});
  window.addEventListener("mouseup",()=>shooting=false);
  document.addEventListener("pointerlockchange",()=>{pointer=document.pointerLockElement===canvas;});
  window.addEventListener("mousemove",e=>{if(state==="play"&&pointer)player.a+=e.movementX*0.0022;});
  window.addEventListener("resize",fit);
  const joyEl=document.getElementById("joy"),knob=document.getElementById("knob"),firebtn=document.getElementById("firebtn");
  function joyAt(ev){const r=joyEl.getBoundingClientRect(),t=ev.touches?ev.touches[0]:ev,cx=r.left+r.width/2,cy=r.top+r.height/2;let x=(t.clientX-cx)/(r.width/2),y=(t.clientY-cy)/(r.height/2);const m=Math.hypot(x,y)||1;if(m>1){x/=m;y/=m;}joy.x=x;joy.y=y;knob.style.left=(39+x*28)+"px";knob.style.top=(39+y*28)+"px";}
  joyEl.addEventListener("touchstart",e=>{e.preventDefault();joyAt(e);},{passive:false});
  joyEl.addEventListener("touchmove",e=>{e.preventDefault();joyAt(e);},{passive:false});
  joyEl.addEventListener("touchend",()=>{joy.x=0;joy.y=0;knob.style.left="39px";knob.style.top="39px";});
  firebtn.addEventListener("touchstart",e=>{e.preventDefault();shooting=true;fire();},{passive:false});
  firebtn.addEventListener("touchend",()=>shooting=false);
  fit();showTitle();requestAnimationFrame(loop);
})();
