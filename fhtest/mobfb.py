from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx=b.new_context(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,device_scale_factor=1)
    ctx.add_init_script(open('/tmp/fhtest/mockfb.js').read())
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.add_init_script("localStorage.setItem('ag3d',JSON.stringify({nick:'Ana'}))")
    pg.goto('file:///tmp/fhtest/index.html');pg.wait_for_function("document.getElementById('load').hidden",timeout=180000)
    pg.wait_for_timeout(2000)
    print(pg.evaluate("JSON.stringify({QL,cap:fpsCap(),post:POST.on,pr:renderer.getPixelRatio()})"))
    pg.evaluate("window.__fbauto=1;fbStart(FBP[1],7);for(let i=0;i<200;i++)updateFutbol(.05)")
    pg.wait_for_timeout(8000)
    pg.screenshot(path='/tmp/fhtest/mobfb.png',timeout=120000)
    print(pg.evaluate("window.__fe||'ok'"),errs[:3])
    b.close()
