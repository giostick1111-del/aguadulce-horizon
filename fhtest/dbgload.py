import sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]));pg.on('console',lambda m:m.type=='error' and errs.append(m.text[:300]))
    pg.add_init_script("localStorage.setItem('ag3d',JSON.stringify({nick:'Bot'}))")
    pg.goto('file:///tmp/fhtest/index.html#nr');pg.wait_for_timeout(25000)
    print(pg.evaluate("document.getElementById('loadT').textContent"),pg.evaluate("document.getElementById('load').hidden"))
    print(errs[:5]);print(pg.evaluate("(document.querySelector('#err')||{}).textContent||''")[:500])
    b.close()
