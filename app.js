const STORAGE_KEY = 'storycraft-absence-tracker-state-v1';

const state = {
  category: 'meeting',
  templateId: 'golden-meeting',
  theme: 'nightRadio',
  accent: null,
  cornerRadius: 28,
  shadowIntensity: 40,
  alignment: 'right',
  watermark: true,
  brand: false,
  texts: {}
};

let format = FORMATS['1080x1920'];
let zoom = 1;
let activeMobileNav = 'categories';

const sidebarEl = document.getElementById('sidebar');
const galleryEl = document.getElementById('panel-gallery');
const customizeEl = document.getElementById('panel-customize');
const stageCanvas = document.getElementById('stage-canvas');
const stageCtx = stageCanvas.getContext('2d');
const phone = document.getElementById('phone');
const mobileSheet = document.getElementById('mobile-sheet');
const sheetContent = document.getElementById('sheet-content');
const navItems = document.querySelectorAll('.nav-item');
const tabs = document.querySelectorAll('.tab');
const sheetHandle = document.getElementById('sheet-handle');
const sheetBackdrop = document.getElementById('sheet-backdrop');

function loadState(){
  try{
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} 
}

function applySavedState(){
  const saved = loadState();
  if(!saved) return;
  if(saved.category) state.category = saved.category;
  if(saved.templateId) state.templateId = saved.templateId;
  if(saved.theme) state.theme = saved.theme;
  if(saved.accent !== undefined) state.accent = saved.accent;
  if(typeof saved.cornerRadius === 'number') state.cornerRadius = saved.cornerRadius;
  if(typeof saved.shadowIntensity === 'number') state.shadowIntensity = saved.shadowIntensity;
  if(saved.alignment) state.alignment = saved.alignment;
  if(typeof saved.watermark === 'boolean') state.watermark = saved.watermark;
  if(typeof saved.brand === 'boolean') state.brand = saved.brand;
  if(saved.texts) state.texts = saved.texts;
}

function currentTemplate(){
  return TEMPLATES.find(t=>t.id===state.templateId) || TEMPLATES[0];
}

function currentCategory(){
  return CATEGORIES.find(c=>c.id===state.category) || CATEGORIES[0];
}

function createCategoryCard(category){
  return `<div class="cat ${category.id===state.category?'active':''}" data-cat="${category.id}">
    <div class="icon"><svg viewBox="0 0 24 24">${ICONS[category.icon]}</svg></div>
    <div class="label">${category.label}</div>
    <div class="count">${TEMPLATES.filter(t=>t.cat===category.id).length}</div>
  </div>`;
}

function buildSidebar(){
  const groups = CATEGORIES.map(createCategoryCard).join('');
  sidebarEl.innerHTML = `<h4>دسته‌بندی خروجی</h4>${groups}`;
  sidebarEl.querySelectorAll('.cat').forEach(el=>{
    el.addEventListener('click', ()=>{
      const selected = el.dataset.cat;
      if(selected === state.category) return;
      state.category = selected;
      const category = currentCategory();
      state.texts = {...category.field};
      const firstTemplate = TEMPLATES.find(t=>t.cat===state.category);
      if(firstTemplate){ state.templateId = firstTemplate.id; state.theme = firstTemplate.theme; }
      saveState();
      updateView();
    });
  });
}

function buildGallery(){
  const groups = {};
  TEMPLATES.forEach(t=>{ const group = THEMES[t.theme].group; groups[group] = groups[group] || []; groups[group].push(t); });
  galleryEl.innerHTML = '';
  Object.entries(groups).forEach(([groupName, templates])=>{
    const section = document.createElement('div'); section.className='gallery-group';
    section.innerHTML = `<div class="gname">${groupName}</div><div class="gallery-grid"></div>`;
    const grid = section.querySelector('.gallery-grid');
    templates.forEach(t=>{
      const card = document.createElement('div'); card.className = 'tmpl-card' + (t.id===state.templateId ? ' active' : '');
      const canvas = document.createElement('canvas');
      canvas.className='thumb-canvas';
      canvas.width = 240; canvas.height = 427;
      const templateCategory = CATEGORIES.find(c=>c.id===t.cat) || currentCategory();
      renderThumbnail(canvas, t, templateCategory.field);
      const label = document.createElement('div'); label.className='tname'; label.textContent=t.name;
      card.appendChild(canvas);
      card.appendChild(label);
      card.addEventListener('click', ()=>{
        state.templateId = t.id; state.theme = t.theme; state.category = t.cat;
        state.texts = {...CATEGORIES.find(c=>c.id===t.cat).field};
        saveState();
        updateView();
      });
      grid.appendChild(card);
    });
    galleryEl.appendChild(section);
  });
}

function buildCustomizeContent(){
  const themeKeys = Object.keys(THEMES);
  return `
    <div class="field">
      <label>تم بصری</label>
      <div class="theme-row">
        ${themeKeys.map(key=>{
          const theme = THEMES[key];
          return `<div class="theme-opt ${state.theme===key?'active':''}" data-theme="${key}">
            <div class="swab" style="background:linear-gradient(135deg,${theme.swatch[0]},${theme.swatch[1]})"></div>${theme.name}</div>`;
        }).join('')}
      </div>
    </div>
    <div class="field">
      <label>رنگ تاکیدی</label>
      <div class="swatches" id="accent-swatches">
        ${['#C9A46B','#E2775A','#8FE3D0','#B27CFF','#F2C6C6','#8FB4E3'].map(color=>`<span class="swatch ${state.accent===color?'active':''}" style="background:${color}" data-color="${color}"></span>`).join('')}
      </div>
    </div>
    <div class="field"><label>عنوان</label><input type="text" id="in-title" value="${state.texts.title||''}"></div>
    <div class="field"><label>زیرعنوان</label><input type="text" id="in-subtitle" value="${state.texts.subtitle||''}"></div>
    ${state.texts.value !== undefined ? `<div class="field"><label>مقدار / عدد اصلی</label><input type="text" id="in-value" value="${state.texts.value||''}"></div>` : ''}
    ${state.texts.caption !== undefined ? `<div class="field"><label>توضیح کوتاه</label><input type="text" id="in-caption" value="${state.texts.caption||''}"></div>` : ''}
    <div class="field"><label>چیدمان متن</label><div class="align-row"><div class="align-btn ${state.alignment==='right'?'active':''}" data-align="right">راست</div><div class="align-btn ${state.alignment==='left'?'active':''}" data-align="left">چپ</div></div></div>
    <div class="field"><label>گردی گوشه‌ها <span class="rangeval">${state.cornerRadius}px</span></label><input type="range" id="rng-radius" min="0" max="60" value="${state.cornerRadius}"></div>
    <div class="field"><label>شدت سایه <span class="rangeval">${state.shadowIntensity}%</span></label><input type="range" id="rng-shadow" min="0" max="100" value="${state.shadowIntensity}"></div>
    <div class="field row2"><label style="margin:0">واترمارک</label><div class="toggle ${state.watermark?'on':''}" id="tg-watermark"><div class="dot"></div></div></div>
    <div class="field row2"><label style="margin:0">لوگوی برند</label><div class="toggle ${state.brand?'on':''}" id="tg-brand"><div class="dot"></div></div></div>
  `;
}

function attachCustomizeEvents(container){
  container.querySelectorAll('.theme-opt').forEach(el=>{
    el.addEventListener('click', ()=>{
      state.theme = el.dataset.theme;
      saveState();
      refreshCustomize();
      draw();
    });
  });
  container.querySelectorAll('.swatch').forEach(el=>{
    el.addEventListener('click', ()=>{
      state.accent = el.dataset.color;
      saveState();
      refreshCustomize();
      draw();
    });
  });
  const inputs = [
    {id:'in-title', field:'title'},
    {id:'in-subtitle', field:'subtitle'},
    {id:'in-value', field:'value'},
    {id:'in-caption', field:'caption'}
  ];
  inputs.forEach(item=>{
    const el = container.querySelector(`#${item.id}`);
    if(el){ el.addEventListener('input', e=>{ state.texts[item.field] = e.target.value; saveState(); draw(); }); }
  });
  container.querySelectorAll('.align-btn').forEach(el=>{
    el.addEventListener('click', ()=>{
      state.alignment = el.dataset.align;
      saveState();
      refreshCustomize();
      draw();
    });
  });
  const radius = container.querySelector('#rng-radius');
  if(radius){ radius.addEventListener('input', e=>{ state.cornerRadius = +e.target.value; saveState(); refreshCustomize(); draw(); }); }
  const shadow = container.querySelector('#rng-shadow');
  if(shadow){ shadow.addEventListener('input', e=>{ state.shadowIntensity = +e.target.value; saveState(); refreshCustomize(); draw(); }); }
  const watermark = container.querySelector('#tg-watermark');
  if(watermark){ watermark.addEventListener('click', ()=>{ state.watermark = !state.watermark; saveState(); refreshCustomize(); draw(); }); }
  const brand = container.querySelector('#tg-brand');
  if(brand){ brand.addEventListener('click', ()=>{ state.brand = !state.brand; saveState(); refreshCustomize(); draw(); }); }
}

function refreshCustomize(){
  customizeEl.innerHTML = buildCustomizeContent();
  attachCustomizeEvents(customizeEl);
  if(activeMobileNav === 'customize'){
    sheetContent.innerHTML = buildCustomizeContent();
    attachCustomizeEvents(sheetContent);
  }
}

function updateView(){
  buildSidebar();
  buildGallery();
  refreshCustomize();
  if(activeMobileNav){ buildMobileSheet(activeMobileNav); }
  draw();
}

function setSheetTitle(type){
  const titleEl = document.getElementById('sheet-title');
  if(!titleEl) return;
  if(type === 'categories') titleEl.textContent = 'دسته‌بندی';
  else if(type === 'gallery') titleEl.textContent = 'گالری قالب‌ها';
  else if(type === 'customize') titleEl.textContent = 'تنظیمات';
}

function buildMobileSheet(type){
  activeMobileNav = type;
  setSheetTitle(type);
  let content = '';
  if(type === 'categories'){
    content = '<h4 style="margin-bottom:16px;">دسته‌بندی خروجی</h4>';
    content += CATEGORIES.map(createCategoryCard).join('');
  } else if(type === 'gallery'){
    const groups = {};
    TEMPLATES.forEach(t=>{ const group = THEMES[t.theme].group; groups[group] = groups[group] || []; groups[group].push(t); });
    content += '<div class="gallery-search"><label>جستجوی قالب</label><input id="gallery-search" type="search" placeholder="نام قالب را بنویس"></div>';
    Object.entries(groups).forEach(([groupName, templates])=>{
      content += `<div class="gallery-group"><div class="gname">${groupName}</div><div class="gallery-grid">`;
      templates.forEach(t=>{
        content += `<div class="tmpl-card ${t.id===state.templateId?'active':''}" data-template="${t.id}"><canvas width="240" height="427" data-template-id="${t.id}"></canvas><div class="tname">${t.name}</div></div>`;
      });
      content += '</div></div>';
    });
  } else if(type === 'customize'){
    content = `<div class="field"><button class="reset-btn" id="reset-customize" type="button">بازنشانی تنظیمات</button></div>${buildCustomizeContent()}`;
  }
  sheetContent.innerHTML = content;
  attachMobileSheetEvents(type);
}

function attachMobileSheetEvents(type){
  if(type === 'categories'){
    sheetContent.querySelectorAll('.cat').forEach(el=>{
      el.addEventListener('click', ()=>{
        const selected = el.dataset.cat;
        if(selected === state.category) return;
        state.category = selected;
        const category = currentCategory();
        state.texts = {...category.field};
        const firstTemplate = TEMPLATES.find(t=>t.cat===state.category);
        if(firstTemplate){ state.templateId = firstTemplate.id; state.theme = firstTemplate.theme; }
        saveState();
        updateView();
        closeMobileSheet();
      });
    });
  }
  if(type === 'gallery'){
    sheetContent.querySelectorAll('[data-template]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const selected = el.dataset.template;
        const tmpl = TEMPLATES.find(t=>t.id===selected);
        if(!tmpl) return;
        state.templateId = tmpl.id; state.theme = tmpl.theme; state.category = tmpl.cat;
        state.texts = {...CATEGORIES.find(c=>c.id===tmpl.cat).field};
        saveState();
        updateView();
        mobileSheet.classList.remove('open');
        sheetBackdrop.classList.remove('visible');
      });
    });
    const searchInput = sheetContent.querySelector('#gallery-search');
    if(searchInput){
      searchInput.addEventListener('input', e=>{
        const query = e.target.value.trim().toLowerCase();
        sheetContent.querySelectorAll('.tmpl-card').forEach(card=>{
          const title = card.querySelector('.tname').textContent.toLowerCase();
          card.style.display = title.includes(query) ? 'block' : 'none';
        });
      });
    }
    setTimeout(()=>{
      sheetContent.querySelectorAll('[data-template-id]').forEach(canvas=>{
        const tmplId = canvas.dataset.templateId;
        const tmpl = TEMPLATES.find(t=>t.id===tmplId);
        if(tmpl){ renderThumbnail(canvas, tmpl, currentCategory().field); }
      });
    }, 10);
  }
  if(type === 'customize'){
    attachCustomizeEvents(sheetContent);
    const resetBtn = sheetContent.querySelector('#reset-customize');
    if(resetBtn){
      resetBtn.addEventListener('click', ()=>{
        const category = currentCategory();
        state.theme = currentTemplate().theme;
        state.accent = null;
        state.cornerRadius = 28;
        state.shadowIntensity = 40;
        state.alignment = 'right';
        state.watermark = true;
        state.brand = false;
        state.texts = {...category.field};
        saveState();
        refreshCustomize();
        draw();
      });
    }
  }
}

function setActiveTab(tabKey){
  tabs.forEach(tab=>tab.classList.toggle('active', tab.dataset.tab===tabKey));
  document.querySelectorAll('.panel').forEach(panel=>panel.classList.toggle('active', panel.id===`panel-${tabKey}`));
}

function setActiveBottomNav(navKey){
  navItems.forEach(item=>item.classList.toggle('active', item.dataset.nav===navKey));
}

function draw(){
  const tmpl = currentTemplate();
  stageCanvas.width = format[0]; stageCanvas.height = format[1];
  render(stageCtx, format[0], format[1], tmpl, state.texts, {
    theme: state.theme,
    accent: state.accent,
    radius: state.cornerRadius,
    shadowIntensity: state.shadowIntensity,
    alignment: state.alignment,
    watermark: state.watermark,
    brand: state.brand
  });
  document.getElementById('tmpl-caption').textContent = `${tmpl.name} · ${THEMES[state.theme].name}`;
  layoutStage();
}

function layoutStage(){
  const maxH = Math.min(window.innerHeight - 200, 660) * zoom;
  const ratio = format[0] / format[1];
  const h = maxH;
  const w = h * ratio;
  stageCanvas.style.width = `${w}px`;
  stageCanvas.style.height = `${h}px`;
  phone.style.width = `${w+20}px`;
  phone.style.height = `${h+20}px`;
}

function initEvents(){
  document.getElementById('fmt-select').addEventListener('change', e=>{
    format = FORMATS[e.target.value];
    draw();
    saveState();
  });
  document.getElementById('zoom-in').addEventListener('click', ()=>{ zoom=Math.min(1.3,zoom+0.1); layoutStage(); });
  document.getElementById('zoom-out').addEventListener('click', ()=>{ zoom=Math.max(0.6,zoom-0.1); layoutStage(); });
  window.addEventListener('resize', layoutStage);
  document.getElementById('export-btn').addEventListener('click', ()=>{
    const tmpl = currentTemplate();
    const off = document.createElement('canvas');
    off.width = format[0]; off.height = format[1];
    const octx = off.getContext('2d');
    render(octx, format[0], format[1], tmpl, state.texts, {
      theme: state.theme,
      accent: state.accent,
      radius: state.cornerRadius,
      shadowIntensity: state.shadowIntensity,
      alignment: state.alignment,
      watermark: state.watermark,
      brand: state.brand
    });
    const link = document.createElement('a');
    link.download = `${tmpl.id}-${format[0]}x${format[1]}.png`;
    link.href = off.toDataURL('image/png');
    link.click();
  });
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{ setActiveTab(tab.dataset.tab); });
  });
  navItems.forEach(item=>{
    item.addEventListener('click', ()=>{
      const navType = item.dataset.nav;
      setActiveBottomNav(navType);
      buildMobileSheet(navType);
      mobileSheet.classList.add('open');
      sheetBackdrop.classList.add('visible');
    });
  });
  sheetHandle.addEventListener('click', ()=> closeMobileSheet());
  sheetBackdrop.addEventListener('click', ()=> closeMobileSheet());
  document.getElementById('sheet-close-btn').addEventListener('click', ()=> closeMobileSheet());
  mobileSheet.addEventListener('touchstart', e=>{ mobileSheet.dataset.startY = e.touches[0].clientY; });
  mobileSheet.addEventListener('touchmove', e=>{
    const startY = Number(mobileSheet.dataset.startY || 0);
    const currentY = e.touches[0].clientY;
    if(currentY - startY > 60){ closeMobileSheet(); }
  });
}

function closeMobileSheet(){
  mobileSheet.classList.remove('open');
  sheetBackdrop.classList.remove('visible');
}

function init(){
  const category = currentCategory();
  state.texts = {...category.field};
  applySavedState();
  buildSidebar();
  buildGallery();
  refreshCustomize();
  buildMobileSheet(activeMobileNav);
  initEvents();
  draw();
}

init();
