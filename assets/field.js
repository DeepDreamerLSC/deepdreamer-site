(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = byId('field-canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) { canvas.replaceWith(document.createTextNode('图形预览不可用，请从项目列表继续探索。')); return; }
  const rows = 18, cols = 44, tau = Math.PI*2;
  // One small canvas, four equal-sized point grids: no 3D engine or animation dependency.
  const shapes = Array.from({length:4},(_,shape) => Array.from({length:rows*cols},(_,i) => {
    const u = (i%cols)/cols*tau, v = Math.floor(i/cols)/(rows-1)*tau;
    if (shape===0) return [(1.03+.43*Math.cos(v))*Math.cos(u),(1.03+.43*Math.cos(v))*Math.sin(u),.43*Math.sin(v)];
    const latitude = v/2;
    if (shape===1) return [1.3*Math.sin(latitude)*Math.cos(u),1.3*Math.sin(latitude)*Math.sin(u),1.3*Math.cos(latitude)];
    if (shape===2) {
      const power = x => Math.sign(x)*Math.pow(Math.abs(x),.38);
      return [power(Math.sin(latitude))*power(Math.cos(u)),power(Math.sin(latitude))*power(Math.sin(u)),power(Math.cos(latitude))];
    }
    const radius = .87+.27*Math.cos(3*u)+.13*Math.cos(v);
    return [radius*Math.cos(2*u),radius*Math.sin(2*u),.49*Math.sin(3*u)+.13*Math.sin(v)];
  }));
  const scene = Math.max(0, Math.min(3, Number(canvas.dataset.scene) || 0));
  let points = shapes[scene].map(p => [...p]), width = 0, height = 0, rotation = .3;
  let pointerX = 0, pointerY = 0, paused = motionPreference.matches, inView = true, frame = 0, lastTime = 0;
  const motionButton = byId('motion-toggle');
  function updateMotionLabel() {
    if (!motionButton) return;
    motionButton.textContent = paused ? '播放动态 ▷' : '暂停动态 Ⅱ';
    motionButton.setAttribute('aria-pressed',String(paused));
  }
  function draw(animate=false) {
    context.clearRect(0,0,width,height);
    const ay = rotation+pointerX*.5, ax = .85+pointerY*.35;
    const cosY=Math.cos(ay),sinY=Math.sin(ay),cosX=Math.cos(ax),sinX=Math.sin(ax);
    const scale = Math.min(width,height)*.30;
    const projected = points.map((p,i) => {
      for(let d=0;d<3;d++) p[d] += (shapes[scene][i][d]-p[d])*(animate?.065:1);
      const x=p[0]*cosY-p[2]*sinY, z=p[0]*sinY+p[2]*cosY;
      const y=p[1]*cosX-z*sinX, depth=p[1]*sinX+z*cosX, perspective=4.7/(4.7-depth);
      return [width/2+x*scale*perspective,height/2+y*scale*perspective,depth];
    });
    const day = document.documentElement.classList.contains('theme-day');
    projected.forEach((p,i) => {
      const alpha = Math.max(.12,Math.min(.95,.45+p[2]*.3));
      const size = Math.max(.6,1.2+p[2]*.65);
      context.fillStyle = i%5===0 ? (day?`rgba(157,23,77,${alpha})`:`rgba(242,106,210,${alpha})`) : (day?`rgba(13,110,124,${alpha})`:`rgba(86,244,229,${alpha})`);
      context.beginPath(); context.arc(p[0],p[1],size,0,tau); context.fill();
    });
  }
  function tick(time) {
    frame=0;
    if (paused || !inView || document.hidden) return;
    if (time-lastTime>=32) { rotation += Math.min(time-lastTime,60)*.00012; draw(true); lastTime=time; }
    frame=requestAnimationFrame(tick);
  }
  function syncAnimation() {
    cancelAnimationFrame(frame); frame=0; lastTime=performance.now();
    if (!paused && inView && !document.hidden) frame=requestAnimationFrame(tick);
  }
  new ResizeObserver(() => {
    const r=canvas.getBoundingClientRect(), ratio=Math.min(devicePixelRatio||1,2);
    width=r.width; height=r.height; canvas.width=Math.round(width*ratio); canvas.height=Math.round(height*ratio);
    context.setTransform(ratio,0,0,ratio,0,0); draw();
  }).observe(canvas);
  new IntersectionObserver(entries => { inView=entries[0].isIntersecting; syncAnimation(); }).observe(canvas);
  document.addEventListener('visibilitychange',syncAnimation);
  document.addEventListener('dd-theme', () => draw());
  canvas.addEventListener('pointermove',event => {
    if(paused) return;
    const r=canvas.getBoundingClientRect(); pointerX=(event.clientX-r.left)/r.width-.5; pointerY=(event.clientY-r.top)/r.height-.5;
  });
  canvas.addEventListener('pointerleave',() => { pointerX=0; pointerY=0; });
  motionButton?.addEventListener('click',() => { paused=!paused; updateMotionLabel(); syncAnimation(); });
  motionPreference.addEventListener('change',event => { paused=event.matches; updateMotionLabel(); draw(); syncAnimation(); });
  updateMotionLabel(); syncAnimation();
})();
