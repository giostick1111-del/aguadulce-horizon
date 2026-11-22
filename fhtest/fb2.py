pg.wait_for_timeout(1000);pg.evaluate("window.__fbauto=1")
for (pi,mode) in [(0,11),(1,7),(2,5)]:
    pg.evaluate(f"fbEnd(true);fbStart(FBP[{pi}],{mode})")
    r=pg.evaluate("""(()=>{try{const ev={};let lastS='';for(let i=0;i<4000;i++){updateFutbol(.05);if(FB.state!==lastS){ev[FB.state]=(ev[FB.state]||0)+1;lastS=FB.state}if(!FB.on)break}
      const b=FB.ball;return JSON.stringify({t:+FB.t.toFixed(0),state:FB.state,score:FB.score,ev,sh:FB.stats.sh,ot:FB.stats.ot,pos:FB.stats.pos.map(v=>+v.toFixed(0)),by:+(b.y-FB.f.y).toFixed(2),bl:fL(FB.f,b.x,b.z).map(v=>+v.toFixed(1))})}catch(e){return 'ERR '+e.stack}})()""")
    print('env m',mode,r[:700])
