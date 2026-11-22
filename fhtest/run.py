import sys,time
from playwright.sync_api import sync_playwright
hashv=sys.argv[1] if len(sys.argv)>1 else ''
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':960,'height':540})
    errs=[];pg.on('pageerror',lambda e:errs.append('PE '+str(e)));pg.on('console',lambda m:(m.type=='error' or m.text.startswith('env')) and errs.append(m.text[:200]))
    pg.add_init_script("localStorage.setItem('ag3d',JSON.stringify({nick:'Bot',cash:0,kills:0,deaths:0}))")
    t0=time.time();pg.goto('file:///tmp/fhtest/'+(sys.argv[3] if len(sys.argv)>3 else 'index.html')+'#'+hashv)
    pg.wait_for_function("document.getElementById('load').hidden||/Error/.test(document.getElementById('loadT').textContent)",timeout=180000)
    print('load',round(time.time()-t0,1),pg.evaluate("document.getElementById('loadT').textContent"),flush=True)
    exec(open('/tmp/fhtest/'+(sys.argv[2] if len(sys.argv)>2 else 'steps.py')).read())
    print('errs',[e for e in errs if 'TUNNEL' not in e and 'fonts' not in e][:20])
    b.close()
