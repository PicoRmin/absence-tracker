function roundRect(ctx,x,y,w,h,r){
  const rr = Math.max(0, Math.min(r, w/2, h/2));
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  ctx.closePath();
}

function waveform(ctx,x,y,w,amp,color,alpha,seed){
  ctx.save(); ctx.globalAlpha=alpha; ctx.strokeStyle=color; ctx.lineWidth=3; ctx.beginPath();
  const N=48;
  for(let i=0;i<=N;i++){
    const px = x + (w*i/N);
    const py = y + Math.sin(i*0.55+seed)*amp*Math.sin(i/N*Math.PI);
    if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  }
  ctx.stroke(); ctx.restore();
}

function bars(ctx,x,y,w,color,alpha,seed){
  ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=color;
  const N=28, gap=6, bw=(w-gap*(N-1))/N;
  for(let i=0;i<N;i++){
    const h = 10 + Math.abs(Math.sin(i*0.7+seed))*46;
    const px = x + i*(bw+gap);
    const py = y - h/2;
    roundRect(ctx, px, py, bw, h, Math.max(0, bw/2));
    ctx.fill();
  }
  ctx.restore();
}

function wrapText(ctx,text,x,y,maxWidth,lineHeight,align){
  const words = text.split(' ');
  let line=''; const lines=[];
  for(const w of words){
    const test = line ? line+' '+w : w;
    if(ctx.measureText(test).width > maxWidth && line){ lines.push(line); line=w; }
    else line=test;
  }
  lines.push(line);
  lines.forEach((l,i)=>{
    ctx.textAlign = align;
    ctx.fillText(l, x, y + i*lineHeight);
  });
  return lines.length;
}

function drawFooter(ctx,W,H,theme,options){
  const accent = options.accent || theme.accentDefault;
  const align = options.alignment === 'left' ? 'left' : 'right';
  const x = align==='right' ? W-72 : 72;
  ctx.save();
  ctx.font='500 26px Inter, sans-serif';
  ctx.fillStyle = theme.textDim;
  ctx.textAlign = align;
  if(options.watermark) ctx.fillText('storycraft.app', x, H-64);
  if(options.brand){
    const bx = align==='right' ? 72 : W-72;
    ctx.beginPath(); ctx.arc(bx, H-72, 16, 0, Math.PI*2);
    ctx.fillStyle = accent; ctx.fill();
  }
  ctx.restore();
}

function applyCardOverlay(ctx,W,H,options){
  if(!options.shadowIntensity) return;
  ctx.save();
  const alpha = Math.min(0.4, options.shadowIntensity / 220);
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(0,0,W,H);
  ctx.restore();
}

function layoutMeeting(ctx,W,H,theme,texts,options){
  theme.bg(ctx,W,H);
  const accent = options.accent || theme.accentDefault;
  const align = options.alignment === 'left' ? 'left' : 'right';
  const tx = align==='right' ? W-84 : 84;
  ctx.textAlign = align;
  ctx.fillStyle = theme.textDim; ctx.font='500 32px Inter, sans-serif';
  ctx.fillText(texts.title, tx, H*0.30);
  ctx.fillStyle = theme.text; ctx.font='600 64px Fraunces, serif';
  ctx.fillText(texts.subtitle, tx, H*0.30+72);
  ctx.font='600 168px Fraunces, serif'; ctx.fillStyle = accent;
  ctx.fillText(texts.value, tx, H*0.52);
  ctx.font='400 34px Inter, sans-serif'; ctx.fillStyle = theme.textDim;
  ctx.fillText(texts.caption, tx, H*0.52+64);
  waveform(ctx, 84, H*0.68, W-168, 34, accent, .85, 1.2);
  bars(ctx, 84, H*0.74, W-168, theme.text, .16, 2.4);
  roundRect(ctx, 60, 60, W-120, H-120, options.radius);
  ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
  drawFooter(ctx,W,H,theme,options);
}

function layoutGrid(ctx,W,H,theme,texts,options){
  theme.bg(ctx,W,H);
  const accent = options.accent || theme.accentDefault;
  ctx.textAlign='right'; ctx.fillStyle=theme.textDim; ctx.font='500 30px Inter, sans-serif';
  ctx.fillText(texts.subtitle, W-84, 190);
  ctx.fillStyle=theme.text; ctx.font='600 68px Fraunces, serif';
  ctx.fillText(texts.title, W-84, 260);
  const stats = [
    {n:'128', l:'قسمت منتشر شده'},
    {n:'46', l:'ساعت گفتگو'},
    {n:'12.4K', l:'شنونده فعال'},
    {n:'92٪', l:'نرخ تکمیل'}
  ];
  const gx=84, gy=380, gw=W-168, gap=24;
  const cw=(gw-gap)/2, ch=280;
  stats.forEach((s,i)=>{
    const cx = gx + (i%2)*(cw+gap);
    const cy = gy + Math.floor(i/2)*(ch+gap);
    roundRect(ctx,cx,cy,cw,ch,options.radius);
    ctx.fillStyle = theme.name==='Editorial Paper' ? 'rgba(36,31,43,0.04)' : 'rgba(255,255,255,0.045)'; ctx.fill();
    ctx.strokeStyle = theme.name==='Editorial Paper' ? 'rgba(36,31,43,0.12)' : 'rgba(255,255,255,0.10)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.textAlign='right'; ctx.fillStyle = accent; ctx.font='600 84px Fraunces, serif';
    ctx.fillText(s.n, cx+cw-28, cy+140);
    ctx.fillStyle = theme.textDim; ctx.font='500 26px Inter, sans-serif';
    ctx.fillText(s.l, cx+cw-28, cy+188);
  });
  waveform(ctx, 84, H-220, W-168, 22, accent, .5, .8);
  drawFooter(ctx,W,H,theme,options);
}

function layoutRing(ctx,W,H,theme,texts,options){
  theme.bg(ctx,W,H);
  const accent = options.accent || theme.accentDefault;
  ctx.textAlign='center'; ctx.fillStyle=theme.textDim; ctx.font='500 30px Inter, sans-serif';
  ctx.fillText(texts.title, W/2, 200);
  ctx.fillStyle=theme.text; ctx.font='600 54px Fraunces, serif';
  ctx.fillText(texts.subtitle, W/2, 258);
  const cx=W/2, cy=H*0.48, r=290;
  const pct = parseFloat(texts.value) / 100 || 0.64;
  ctx.save(); ctx.lineWidth=34; ctx.lineCap='round';
  ctx.strokeStyle = theme.name==='Editorial Paper' ? 'rgba(36,31,43,0.10)' : 'rgba(255,255,255,0.10)';
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI/2, -Math.PI/2 + Math.PI*2*pct); ctx.stroke();
  ctx.restore();
  ctx.fillStyle=theme.text; ctx.font='600 148px Fraunces, serif'; ctx.fillText(texts.value, cx, cy+50);
  ctx.fillStyle=theme.textDim; ctx.font='400 32px Inter, sans-serif'; ctx.fillText(texts.caption, cx, cy+r+90);
  drawFooter(ctx,W,H,theme,options);
}

function layoutTimeline(ctx,W,H,theme,texts,options){
  theme.bg(ctx,W,H);
  const accent = options.accent || theme.accentDefault;
  ctx.textAlign='right'; ctx.fillStyle=theme.textDim; ctx.font='500 30px Inter, sans-serif';
  ctx.fillText(texts.subtitle, W-84, 190);
  ctx.fillStyle=theme.text; ctx.font='600 68px Fraunces, serif'; ctx.fillText(texts.title, W-84, 260);
  const items = [
    {t:'شروع فصل', d:'فروردین ۱۴۰۳'},
    {t:'قسمت صدم', d:'مرداد ۱۴۰۳'},
    {t:'رکورد شنونده', d:'آبان ۱۴۰۳'},
    {t:'همکاری ویژه', d:'اکنون'}
  ];
  const lx = W-120, top=400, gap=190;
  ctx.save(); ctx.strokeStyle = theme.name==='Editorial Paper' ? 'rgba(36,31,43,0.18)' : 'rgba(255,255,255,0.16)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(lx, top); ctx.lineTo(lx, top+gap*(items.length-1)); ctx.stroke();
  items.forEach((it,i)=>{
    const y = top + i*gap;
    ctx.beginPath(); ctx.arc(lx,y,12,0,Math.PI*2);
    ctx.fillStyle = i===items.length-1 ? accent : theme.textDim; ctx.fill();
    ctx.textAlign='right'; ctx.fillStyle=theme.text; ctx.font='600 40px Fraunces, serif'; ctx.fillText(it.t, lx-40, y+6);
    ctx.fillStyle=theme.textDim; ctx.font='400 26px Inter, sans-serif'; ctx.fillText(it.d, lx-40, y+44);
  });
  ctx.restore();
  drawFooter(ctx,W,H,theme,options);
}

function layoutQuote(ctx,W,H,theme,texts,options){
  theme.bg(ctx,W,H);
  const accent = options.accent || theme.accentDefault;
  ctx.textAlign='center'; ctx.font='600 200px Fraunces, serif'; ctx.fillStyle=accent; ctx.globalAlpha=.5;
  ctx.fillText('“', W/2, 400);
  ctx.globalAlpha=1;
  ctx.fillStyle=theme.text; ctx.font='600 76px Fraunces, serif';
  wrapText(ctx, texts.title.replace(/[«»]/g,''), W/2, H*0.46, W-200, 90, 'center');
  ctx.fillStyle=theme.textDim; ctx.font='500 30px Inter, sans-serif'; ctx.fillText(texts.subtitle, W/2, H*0.72);
  waveform(ctx, 140, H*0.80, W-280, 26, accent, .6, 3.1);
  drawFooter(ctx,W,H,theme,options);
}

function layoutBlank(ctx,W,H,theme,texts,options){
  theme.bg(ctx,W,H);
  const accent = options.accent || theme.accentDefault;
  const align = options.alignment === 'left' ? 'left' : 'right';
  const tx = align==='right' ? W-84 : 84;
  ctx.textAlign = align;
  ctx.fillStyle=theme.textDim; ctx.font='500 30px Inter, sans-serif'; ctx.fillText(texts.subtitle, tx, H*0.42);
  ctx.fillStyle=theme.text; ctx.font='600 74px Fraunces, serif'; wrapText(ctx, texts.title, tx, H*0.42+70, W-168, 84, align);
  ctx.fillStyle=accent; ctx.font='500 32px Inter, sans-serif'; ctx.fillText(texts.caption, tx, H*0.62);
  roundRect(ctx,60,60,W-120,H-120,options.radius);
  ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
  drawFooter(ctx,W,H,theme,options);
}

function layoutNeonSplit(ctx,W,H,theme,texts,options){
  const accent = options.accent || theme.accentDefault;
  const split = W*0.42;
  ctx.fillStyle = theme.textDim;
  ctx.fillRect(0,0,W,H);
  ctx.fillStyle = accent; ctx.fillRect(0,0,split,H);
  ctx.save(); ctx.globalAlpha=0.08; ctx.fillStyle=theme.text; ctx.fillRect(split-60,0,160,H); ctx.restore();
  ctx.fillStyle=theme.text; ctx.font='600 68px Fraunces, serif'; ctx.textAlign='right'; ctx.fillText(texts.title, split-36, H*0.32);
  ctx.font='500 32px Inter, sans-serif'; ctx.fillText(texts.subtitle, split-36, H*0.42);
  ctx.fillStyle = '#FFFFFF'; ctx.font='700 178px Fraunces, serif'; ctx.fillText(texts.value || '•', split-36, H*0.64);
  ctx.fillStyle=theme.textDim; ctx.font='400 28px Inter, sans-serif'; ctx.fillText(texts.caption, split-36, H*0.72);
  ctx.fillStyle = theme.text; ctx.font='500 30px Inter, sans-serif'; ctx.textAlign='left'; ctx.fillText(texts.title, split+64, H*0.18);
  ctx.fillStyle = accent; ctx.font='600 48px Fraunces, serif'; ctx.fillText(texts.subtitle, split+64, H*0.38);
  ctx.fillStyle=theme.text; ctx.font='400 24px Inter, sans-serif'; ctx.fillText(texts.caption, split+64, H*0.48);
  drawFooter(ctx,W,H,theme,options);
}

function layoutCover(ctx,W,H,theme,texts,options){
  theme.bg(ctx,W,H);
  const accent = options.accent || theme.accentDefault;
  ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle=accent; ctx.font='500 28px Inter, sans-serif'; ctx.textAlign='left'; ctx.fillText(texts.subtitle, 84, 164);
  ctx.fillStyle=theme.text; ctx.font='700 112px Fraunces, serif'; ctx.fillText(texts.title, 84, 280);
  ctx.fillStyle=theme.textDim; ctx.font='400 28px Inter, sans-serif'; wrapText(ctx, texts.caption, 84, H-140, W-168, 42, 'left');
  drawFooter(ctx,W,H,theme,options);
}

function layoutMosaic(ctx,W,H,theme,texts,options){
  theme.bg(ctx,W,H);
  const accent = options.accent || theme.accentDefault;
  const rows = 3, cols = 3, gutter = 22;
  const cellW = (W - gutter*(cols+1)) / cols;
  const cellH = (H - 280 - gutter*(rows+1)) / rows;
  for(let row=0; row<rows; row++){
    for(let col=0; col<cols; col++){
      const x = gutter + col*(cellW+gutter);
      const y = 260 + row*(cellH+gutter);
      roundRect(ctx,x,y,cellW,cellH,14);
      ctx.fillStyle = row % 2 ? accent : theme.text;
      ctx.fill();
    }
  }
  ctx.fillStyle=theme.text; ctx.font='600 64px Fraunces, serif'; ctx.textAlign='right'; ctx.fillText(texts.title, W-84, 150);
  ctx.fillStyle=theme.textDim; ctx.font='500 28px Inter, sans-serif'; ctx.fillText(texts.subtitle, W-84, 210);
  drawFooter(ctx,W,H,theme,options);
}

function layoutCinematic(ctx,W,H,theme,texts,options){
  theme.bg(ctx,W,H);
  const accent = options.accent || theme.accentDefault;
  const barHeight = 70;
  ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.fillRect(0,H-barHeight*3-40,W,barHeight*3+40);
  ctx.fillStyle=accent; ctx.font='600 50px Fraunces, serif'; ctx.textAlign='center'; ctx.fillText(texts.title, W/2, H-160);
  ctx.fillStyle=theme.text; ctx.font='500 26px Inter, sans-serif'; ctx.fillText(texts.subtitle, W/2, H-110);
  ctx.fillStyle=theme.textDim; ctx.font='400 22px Inter, sans-serif'; ctx.fillText(texts.caption, W/2, H-70);
  drawFooter(ctx,W,H,theme,options);
}

function layoutMonogram(ctx,W,H,theme,texts,options){
  theme.bg(ctx,W,H);
  const accent = options.accent || theme.accentDefault;
  const initials = (texts.title || '').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'SC';
  ctx.save(); ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.font='800 240px Fraunces, serif'; ctx.textAlign='center'; ctx.fillText(initials, W/2, H*0.55); ctx.restore();
  ctx.fillStyle=theme.text; ctx.font='600 60px Fraunces, serif'; ctx.textAlign='center'; ctx.fillText(texts.title, W/2, H*0.18);
  ctx.fillStyle=accent; ctx.font='500 28px Inter, sans-serif'; ctx.fillText(texts.subtitle, W/2, H*0.28);
  ctx.fillStyle=theme.textDim; ctx.font='400 24px Inter, sans-serif'; ctx.fillText(texts.caption, W/2, H*0.82);
  drawFooter(ctx,W,H,theme,options);
}

function layoutPostcard(ctx,W,H,theme,texts,options){
  theme.bg(ctx,W,H);
  const accent = options.accent || theme.accentDefault;
  const margin = 84;
  roundRect(ctx, margin, margin, W-margin*2, H-margin*2, options.radius);
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle=theme.text; ctx.font='600 54px Fraunces, serif'; ctx.textAlign='left'; ctx.fillText(texts.title, margin+40, margin+110);
  ctx.fillStyle=accent; ctx.font='500 28px Inter, sans-serif'; ctx.fillText(texts.subtitle, margin+40, margin+158);
  ctx.fillStyle=theme.textDim; ctx.font='400 24px Inter, sans-serif'; wrapText(ctx, texts.caption, margin+40, margin+210, W-margin*2-80, 38, 'left');
  ctx.fillStyle=accent; ctx.fillRect(margin+40, H-margin-72, 120, 6);
  drawFooter(ctx,W,H,theme,options);
}

const LAYOUTS = {
  meeting: layoutMeeting,
  grid: layoutGrid,
  ring: layoutRing,
  timeline: layoutTimeline,
  quote: layoutQuote,
  blank: layoutBlank,
  neonSplit: layoutNeonSplit,
  cover: layoutCover,
  mosaic: layoutMosaic,
  cinematic: layoutCinematic,
  monogram: layoutMonogram,
  postcard: layoutPostcard
};

function render(ctx, W, H, tmpl, texts, options = {}){
  const theme = THEMES[options.theme || tmpl.theme] || THEMES[tmpl.theme];
  ctx.clearRect(0,0,W,H);
  if(!theme){
    ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
    return;
  }
  const layoutFn = LAYOUTS[tmpl.layout] || LAYOUTS.blank;
  layoutFn(ctx,W,H,theme,texts,options);
}

function renderThumbnail(canvas, tmpl, texts){
  canvas.width = 240; canvas.height = 427;
  const ctx = canvas.getContext('2d');
  render(ctx, 240, 427, tmpl, texts, {theme:tmpl.theme, radius:14, shadowIntensity:20, alignment:'right'});
}
