const THEMES = {
  nightRadio: {
    name:'Night Radio', group:'Dark Premium',
    swatch:['#15121C','#C9A46B'],
    text:'#F3EEE3', textDim:'rgba(243,238,227,.62)', accentDefault:'#C9A46B',
    bg(ctx,W,H){
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#1B1726'); g.addColorStop(1,'#0F0D14');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      const r = ctx.createRadialGradient(W*0.18,H*0.14,10,W*0.18,H*0.14,W*0.9);
      r.addColorStop(0,'rgba(201,164,107,0.16)'); r.addColorStop(1,'rgba(201,164,107,0)');
      ctx.fillStyle = r; ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=2;
      for(let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(W*0.85,H*0.08,180+i*90,0,Math.PI*2); ctx.stroke(); }
      ctx.restore();
    }
  },
  auroraGlass: {
    name:'Aurora Glass', group:'Glassmorphism',
    swatch:['#1B1035','#59D6C7'],
    text:'#F5F3FF', textDim:'rgba(245,243,255,.66)', accentDefault:'#8FE3D0',
    bg(ctx,W,H){
      const g = ctx.createLinearGradient(0,0,W,H);
      g.addColorStop(0,'#1B1035'); g.addColorStop(0.55,'#241748'); g.addColorStop(1,'#12102A');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      const blob = (x,y,r,c)=>{
        const rg = ctx.createRadialGradient(x,y,0,x,y,r);
        rg.addColorStop(0,c); rg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=rg; ctx.fillRect(0,0,W,H);
      };
      blob(W*0.15,H*0.12,W*0.65,'rgba(89,214,199,0.28)');
      blob(W*0.9,H*0.28,W*0.55,'rgba(178,124,255,0.24)');
      blob(W*0.5,H*0.92,W*0.7,'rgba(226,119,90,0.16)');
    }
  },
  editorialPaper: {
    name:'Editorial Paper', group:'Editorial',
    swatch:['#F3EEE3','#C9522F'],
    text:'#241F2B', textDim:'rgba(36,31,43,.6)', accentDefault:'#C9522F',
    bg(ctx,W,H){
      ctx.fillStyle='#F3EEE3'; ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.strokeStyle='rgba(36,31,43,0.06)'; ctx.lineWidth=1;
      for(let y=90;y<H;y+=64){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      ctx.restore();
    }
  },
  luxuryNoir: {
    name:'Luxury Noir', group:'Luxury',
    swatch:['#0A0A0C','#C9A46B'],
    text:'#EDE6D8', textDim:'rgba(237,230,216,.6)', accentDefault:'#C9A46B',
    bg(ctx,W,H){
      ctx.fillStyle='#0A0A0C'; ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.strokeStyle='rgba(201,164,107,0.5)'; ctx.lineWidth=2;
      ctx.strokeRect(56,56,W-112,H-112);
      ctx.restore();
    }
  }
};

const CATEGORIES = [
  {id:'meeting', label:'آخرین ملاقات', icon:'mic', field:{title:'گفتگوی امروز با',subtitle:'رادیو بی‌نهایت',value:'۴۲ روز',caption:'از آخرین قسمت گذشته است'}},
  {id:'stats', label:'آمار کلی', icon:'chart', field:{title:'یک سال با شما',subtitle:'فصل هفتم',value:'',caption:''}},
  {id:'time', label:'گذر زمان', icon:'clock', field:{title:'زمان سپری‌شده',subtitle:'از اولین قسمت',value:'۶۴٪',caption:'تا مایل‌سنگ بعدی'}},
  {id:'milestones', label:'نقاط عطف', icon:'flag', field:{title:'مسیر طی‌شده',subtitle:'فصل دوم',value:'',caption:''}},
  {id:'quote', label:'نقل‌قول محبوب', icon:'quote', field:{title:'«هر قسمت، یک آغاز تازه است»',subtitle:'قسمت ۱۱۸ · صدای شب',value:'',caption:''}},
  {id:'custom', label:'استوری دلخواه', icon:'spark', field:{title:'عنوان دلخواه شما',subtitle:'زیرعنوان کوتاه',value:'',caption:'متن پایانی'}}
];

const ICONS = {
  mic:'<path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  flag:'<path d="M5 21V4"/><path d="M5 4h13l-3 4 3 4H5"/>',
  quote:'<path d="M7 8c-2 1-3 3-3 5s1.5 3 3 3 3-1.5 3-3-1-3-2-3M17 8c-2 1-3 3-3 5s1.5 3 3 3 3-1.5 3-3-1-3-2-3"/>',
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>'
};

const TEMPLATES = [
  {id:'golden-meeting', name:'Golden Hour', cat:'meeting', layout:'meeting', theme:'nightRadio'},
  {id:'afterglow', name:'Afterglow', cat:'meeting', layout:'meeting', theme:'auroraGlass'},
  {id:'neon-meeting', name:'Neon Split', cat:'meeting', layout:'neonSplit', theme:'nightRadio'},
  {id:'cover-meeting', name:'Cover', cat:'meeting', layout:'cover', theme:'luxuryNoir'},
  {id:'ledger', name:'The Ledger', cat:'stats', layout:'grid', theme:'luxuryNoir'},
  {id:'field-notes', name:'Field Notes', cat:'stats', layout:'grid', theme:'editorialPaper'},
  {id:'mosaic-stats', name:'Mosaic', cat:'stats', layout:'mosaic', theme:'auroraGlass'},
  {id:'cinematic-stats', name:'Cinematic', cat:'stats', layout:'cinematic', theme:'nightRadio'},
  {id:'orbit', name:'Orbit', cat:'time', layout:'ring', theme:'nightRadio'},
  {id:'halftime', name:'Halftime', cat:'time', layout:'ring', theme:'auroraGlass'},
  {id:'monogram-time', name:'Monogram', cat:'time', layout:'monogram', theme:'luxuryNoir'},
  {id:'postcard-time', name:'Postcard', cat:'time', layout:'postcard', theme:'editorialPaper'},
  {id:'waypoints', name:'Waypoints', cat:'milestones', layout:'timeline', theme:'editorialPaper'},
  {id:'ascent', name:'Ascent', cat:'milestones', layout:'timeline', theme:'luxuryNoir'},
  {id:'neon-milestone', name:'Neon Steps', cat:'milestones', layout:'neonSplit', theme:'auroraGlass'},
  {id:'cover-milestone', name:'Chapter', cat:'milestones', layout:'cover', theme:'nightRadio'},
  {id:'spoken-word', name:'Spoken Word', cat:'quote', layout:'quote', theme:'nightRadio'},
  {id:'marginalia', name:'Marginalia', cat:'quote', layout:'quote', theme:'editorialPaper'},
  {id:'cinematic-quote', name:'Cinematic', cat:'quote', layout:'cinematic', theme:'luxuryNoir'},
  {id:'postcard-quote', name:'Postcard', cat:'quote', layout:'postcard', theme:'auroraGlass'},
  {id:'open-canvas', name:'Open Canvas', cat:'custom', layout:'blank', theme:'auroraGlass'},
  {id:'blank-slate', name:'Blank Slate', cat:'custom', layout:'blank', theme:'luxuryNoir'},
  {id:'monogram-custom', name:'Monogram', cat:'custom', layout:'monogram', theme:'nightRadio'},
  {id:'mosaic-custom', name:'Mosaic', cat:'custom', layout:'mosaic', theme:'editorialPaper'}
];

const FORMATS = {
  '1080x1920':[1080,1920],
  '1080x1350':[1080,1350],
  '1080x1080':[1080,1080],
  '1200x630':[1200,630]
};
