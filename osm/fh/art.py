import re
h=open('/home/claude/osm/aguadulce-horizon.html',encoding='utf8').read()
a=re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>','',h)
a=a.replace('</head>','').replace('<body>','').replace('</body>','').replace('</html>','')
a=re.sub(r'<meta charset="utf-8">\s*','',a)
a=re.sub(r'<meta name="viewport"[^>]*>','<meta name="claude:viewport-fit-sides" content="cover">',a)
open('/home/claude/aguadulce-horizon-art.html','w',encoding='utf8').write(a)
print(len(a))
