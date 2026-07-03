const STORAGE_KEY = 'memory-timeline-absence-dashboard-v1';
const defaultStart = new Date(Date.now() - 412 * 24 * 60 * 60 * 1000);

const state = {
  absenceDate: defaultStart.toISOString().split('T')[0]
};

const heroDaysEl = document.getElementById('hero-days');
const heroClockEl = document.getElementById('hero-clock');
const heroNoteEl = document.getElementById('hero-note');
const perspectivesList = document.getElementById('perspectives-list');
const withoutList = document.getElementById('without-list');
const seasonRow = document.getElementById('season-row');
const reflectionText = document.getElementById('reflection-text');
const absenceDateInput = document.getElementById('absence-date');

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (parsed.absenceDate) state.absenceDate = parsed.absenceDate;
  } catch (error) {
    console.warn('Cannot load dashboard state', error);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Cannot save dashboard state', error);
  }
}

function parseDate(value) {
  const next = new Date(value + 'T00:00:00');
  return Number.isNaN(next.getTime()) ? new Date() : next;
}

function timeDifference(start) {
  const now = new Date();
  const diffMs = now - start;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return { seconds, minutes, hours, days, diffMs };
}

function seasonIndex(month) {
  if (month >= 2 && month <= 4) return 0; // spring
  if (month >= 5 && month <= 7) return 1; // summer
  if (month >= 8 && month <= 10) return 2; // autumn
  return 3; // winter
}

function seasonName(index) {
  return ['بهار', 'تابستان', 'پاییز', 'زمستان'][index];
}

function buildSeasonCounts(startDate) {
  const counts = [0, 0, 0, 0];
  const today = new Date();
  let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (cursor <= today) {
    counts[seasonIndex(cursor.getMonth())] += 1;
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return counts;
}

function buildPerspectives(diff) {
  return [
    { label: 'روز', value: diff.days },
    { label: 'هفته', value: Math.floor(diff.days / 7) },
    { label: 'ماه', value: Math.floor(diff.days / 30) },
    { label: 'سال + روز', value: `${Math.floor(diff.days / 365)} سال ${diff.days % 365} روز` },
    { label: 'فصل', value: Math.floor(diff.days / 91) },
    { label: 'ساعت', value: diff.hours },
    { label: 'دقیقه', value: diff.minutes },
    { label: 'ثانیه', value: diff.seconds }
  ];
}

function buildWithoutItems(diff) {
  return [
    { emoji: '👀', title: 'بدون دیدن عکس', value: `${diff.days} روز` },
    { emoji: '🎤', title: 'بدون شنیدن صدا', value: `${diff.days} روز` },
    { emoji: '💬', title: 'بدون پیام رد و بدل کردن', value: `${diff.days} روز` },
    { emoji: '🌙', title: 'بدون گفتن “شب‌ بخیر”', value: `${diff.days} شب` }
  ];
}

function formatClock(diff) {
  const hours = String(diff.hours % 24).padStart(2, '0');
  const minutes = String(diff.minutes % 60).padStart(2, '0');
  const seconds = String(diff.seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function buildReflection(diff, seasonCounts) {
  const parts = [];
  if (diff.days > 365) parts.push('یک سال و بیشتر از آن در این مسیر سپری شده است.');
  else if (diff.days > 120) parts.push('فصل‌های زیادی آمدند و رفتند. غیبت هنوز معنا دارد.');
  else parts.push('زمان به آرامی خاطره‌ها را عمیق‌تر کرده است.');

  if (seasonCounts[0] >= 2) parts.push('بهار دوبار از کنار ما گذشت.');
  if (seasonCounts[3] >= 1 && diff.days > 90) parts.push('زمستان زیر نورِ خاطره‌ها ایستاد.');

  return parts.join(' ');
}

function render() {
  const startDate = parseDate(state.absenceDate);
  const diff = timeDifference(startDate);
  heroDaysEl.textContent = diff.days;
  heroClockEl.textContent = formatClock(diff);
  heroNoteEl.textContent = buildReflection(diff, buildSeasonCounts(startDate));

  const perspectives = buildPerspectives(diff);
  perspectivesList.innerHTML = perspectives.map(item => `
    <div class="summary-item">
      <strong>${item.value}</strong>
      <span>${item.label}</span>
    </div>
  `).join('');

  const withoutItems = buildWithoutItems(diff);
  withoutList.innerHTML = withoutItems.map(item => `
    <div class="without-item">
      <div>
        <strong>${item.emoji} ${item.title}</strong>
      </div>
      <span>${item.value}</span>
    </div>
  `).join('');

  const seasonCounts = buildSeasonCounts(startDate);
  seasonRow.innerHTML = seasonCounts.map((count, index) => `
    <div class="season-chip">
      <strong>${seasonName(index)}</strong>
      <span>${count} بار</span>
    </div>
  `).join('');

  reflectionText.textContent = buildReflection(diff, seasonCounts);
}

function init() {
  loadState();
  absenceDateInput.value = state.absenceDate;
  absenceDateInput.addEventListener('change', (event) => {
    state.absenceDate = event.target.value;
    saveState();
    render();
  });

  render();
  setInterval(render, 1000);
}

init();
