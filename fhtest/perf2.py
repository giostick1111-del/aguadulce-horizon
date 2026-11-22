pg.wait_for_timeout(1500)
pg.evaluate("(()=>{const m=__g.ME;m.x=2805;m.z=2140;m.y=__g.H(m.x,m.z);window.__cam=[2790,__g.H(2790,2160)+3,2160,2805,__g.H(2805,2140)+2,2120]})()")
pg.wait_for_timeout(2500)
print('env perf',pg.evaluate("""JSON.stringify((()=>{const i=renderer.info.render;let meshes=0,inst=0,grp=0,mats=new Set(),tris=0;const byParent={};scene.traverse(o=>{if(o.isInstancedMesh)inst++;else if(o.isMesh){meshes++;mats.add(o.material.uuid)}});
 const t0=performance.now();for(let k=0;k<5;k++)renderer.render(scene,camera);const dt=(performance.now()-t0)/5;return{calls:i.calls,tris:i.triangles,meshes,inst,mats:mats.size,geoms:renderer.info.memory.geometries,tex:renderer.info.memory.textures,ms:+dt.toFixed(1),pr:renderer.getPixelRatio(),sh:sun.shadow.mapSize.x}})())"""))
