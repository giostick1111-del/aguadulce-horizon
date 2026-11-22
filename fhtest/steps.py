pg.evaluate("""(()=>{const st={fr:0,take:0,air:0,wasG:true,stuckT:0};window.__st=st;
 const loop=()=>{const c=__g.ME;if(c&&__g.RACE&&__g.RACE.t>0&&!__g.RACE.done){st.fr++;if(st.wasG&&!c.onGround)st.take++;if(!c.onGround)st.air++;st.wasG=c.onGround;if(Math.abs(c.vf)<2)st.stuckT+=1/60}requestAnimationFrame(loop)};loop()})()""")
for k in range(20):
    pg.wait_for_timeout(8000)
    r=pg.evaluate("JSON.stringify({t:+__g.RACE.t.toFixed(1),cp:__g.RACE.cp,n:__g.RACE.ev.cps.length,done:__g.RACE.done,fin:+__g.RACE.finishT.toFixed(1),take:__st.take,airFr:__st.air,slowS:+__st.stuckT.toFixed(1),ai:__g.RACE.ai.map(a=>Math.round(a.ai.s))})")
    if '"done":true' in r or k==19: print(r,flush=True); break
