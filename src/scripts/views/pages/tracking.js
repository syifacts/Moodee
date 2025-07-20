import { supabase } from '../../config/supabaseClient.js';

const Tracking = {
  async render() {
    return `
      <section class="tracking-hero">
        <img src="icons/pic4.jpg" alt="Illustration" class="hero-image" />
        <p class="tracking-quote">❝ Mengetahui kapan kamu paling bahagia atau paling lelah adalah awal dari mencintai diri sendiri ❞</p>
        <div id="mood-log" class="mood-log"></div>
      </section>

      <section class="tracking-form">
        <img src="/icons/pic10.png" alt="Mood Calendar" />
        <h2>Bagaimana Perasaanmu Saat Ini?</h2>
        <p>Pilih suasana hati sesuai dengan perasaanmu saat ini</p>
        <div class="mood-buttons">
          <button class="img-button" data-mood="Happy"><img src="icons/happy.png" alt="Happy" /></button>
          <button class="img-button" data-mood="Good"><img src="icons/good.png" alt="Good" /></button>
          <button class="img-button" data-mood="Bad"><img src="icons/bad.png" alt="Bad" /></button>
          <button class="img-button" data-mood="Sad"><img src="icons/sad.png" alt="Sad" /></button>
          <button class="img-button" data-mood="Angry"><img src="icons/angry.png" alt="Angry" /></button>
        </div>
      </section>

      <section class="tracking-calendar">
        <h3>
          <button class="calendar-nav-btn" id="prev-month">&#8249;</button>
          <span id="month-year-title">July 2025</span>
          <button class="calendar-nav-btn" id="next-month">&#8250;</button>
        </h3>
        <div class="calendar-grid" id="calendar-grid"></div>
      </section>

     <section class="tracking-message">
  <div class="circle-message">
    <p>❝ Tracking suasana hatimu tidak berarti kamu lemah — itu berarti kamu sadar diri ❞</p>
  </div>
  <div class="message-text">
    <p>Setiap emosi itu penting. Pantau suasana hati Anda setiap hari dan renungkan dengan statistik kalender yang berwawasan!</p>
  </div>
  <div class="message-image">
    <img src="icons/tracking2.png" alt="Mood Illustration">
  </div>
</section>


      <div id="popup-toast" class="popup-toast hidden">Mood berhasil disimpan!</div>
    `;
  },

  async afterRender() {
  const moodButtons = document.querySelectorAll('.img-button');
  const log = document.getElementById('mood-log');

  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    alert('Silakan login!');
    window.location.hash = '/login';
    return;
  }

  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const currentDate = today.toISOString().split('T')[0];
  const currentTime = today.toTimeString().split(' ')[0].slice(0, 5);

  function getUserKey(key) {
    return `${key}_${user.id}`;
  }

  function canSubmitMood() {
    const lastClick = localStorage.getItem(getUserKey('lastMoodTime'));
    if (!lastClick) return true;
    const oneHour = 60 * 60 * 1000;
    return Date.now() - parseInt(lastClick) >= oneHour;
  }

  function updateMoodLog({ date, time, mood }) {
    log.innerHTML = `
      <p>Mood terakhir kamu:</p>
      <strong>${date}</strong> - <strong>${time}</strong> :
      <span style="color:${getMoodColor(mood)}">${typeof mood === 'string' ? mood : mood.mixed.join(', ')}</span>
    `;
  }

  function getMoodColor(mood) {
    const colors = {
      Happy: '#01B26E',
      Good: '#F97243',
      Bad: '#368AE9',
      Sad: '#856EFA',
      Angry: '#DE385E',
      Neutral: '#dfe6e9'
    };

    if (typeof mood === 'string') return colors[mood] || '#dcdde1';

    if (mood.mixed) {
      const hexToRgb = hex => {
        const bigint = parseInt(hex.slice(1), 16);
        return [bigint >> 16, (bigint >> 8) & 255, bigint & 255];
      };

      const avgRgb = mood.mixed
        .map(m => hexToRgb(colors[m] || '#dcdde1'))
        .reduce((acc, rgb) => acc.map((val, i) => val + rgb[i]), [0, 0, 0])
        .map(val => Math.round(val / mood.mixed.length));

      return `#${avgRgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
    }

    return '#dcdde1';
  }

  function getDominantMood(moods) {
    const count = {};
    moods.forEach(entry => {
      const mood = entry.mood;
      count[mood] = (count[mood] || 0) + 1;
    });

    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
    const maxCount = sorted[0][1];
    const topMoods = sorted.filter(([_, count]) => count === maxCount).map(([mood]) => mood);

    return topMoods.length === 1 ? topMoods[0] : { mixed: topMoods };
  }

  function showPopup(message) {
    const popup = document.getElementById('popup-toast');
    popup.textContent = message;
    popup.classList.remove('hidden');
    popup.classList.add('show');
    setTimeout(() => {
      popup.classList.remove('show');
      popup.classList.add('hidden');
    }, 3000);
  }

  moodButtons.forEach(button => {
    button.addEventListener('click', async () => {
      if (!canSubmitMood()) {
        showPopup('Tunggu 1 jam sebelum mengirim mood lagi!');
        return;
      }

      const selectedMood = button.dataset.mood;

      const { error } = await supabase
        .from('mood')
        .insert({
          user_id: user.id,
          date: currentDate,
          time: currentTime,
          mood: selectedMood
        });

      if (!error) {
        const lastMood = { date: currentDate, time: currentTime, mood: selectedMood };
        localStorage.setItem(getUserKey('lastMood'), JSON.stringify(lastMood));
        localStorage.setItem(getUserKey('lastMoodTime'), Date.now().toString());
        updateMoodLog(lastMood);
        showPopup('Mood berhasil disimpan!');
      } else {
        console.error('Gagal menyimpan mood:', error.message);
        alert('Gagal menyimpan mood!');
      }
    });
  });

  async function loadCalendarMood(skipAutoInsert = false) {
    try {
      const { data: moodsData, error } = await supabase
        .from('mood')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const moodByDate = {};

moodsData.forEach(entry => {
  const entryDate = new Date(entry.date);
  const isToday = entry.date === currentDate;
  const isInCurrentMonth = entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;

  if (isInCurrentMonth && !isToday) { // ⛔️ Jangan tampilkan mood hari ini di kalender
    const day = entryDate.getDate();
    if (!moodByDate[day]) moodByDate[day] = [];
    moodByDate[day].push(entry);
  }
});

      // Hitung dan render mayoritas mood KEMARIN (untuk ditampilkan di kalender)
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];
const yesterdayDay = yesterday.getDate();
const yesterdayMoods = moodsData.filter(entry => entry.date === yesterdayStr);

if (yesterdayMoods.length > 0) {
  const dominant = getDominantMood(yesterdayMoods);
  if (!moodByDate[yesterdayDay]) moodByDate[yesterdayDay] = [];
  // Simpan pseudo mood dominan hanya untuk rendering
  moodByDate[yesterdayDay].push({ mood: dominant });
}


      // ⬇️ Auto insert mood besok HANYA saat load awal, bukan setelah klik
      if (!skipAutoInsert) {
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

        const hasTomorrow = moodsData.some(entry => entry.date === tomorrowDateStr);
        const todayMoods = moodsData.filter(entry => entry.date === currentDate);

        if (!hasTomorrow && todayMoods.length > 0) {
          const dominant = getDominantMood(todayMoods);
          await supabase.from('mood').insert({
            user_id: user.id,
            date: tomorrowDateStr,
            time: 'Auto',
            mood: dominant
          });
        }
      }

      renderCalendarGrid(currentYear, currentMonth, moodByDate);

    } catch (error) {
      console.error('Gagal memuat data mood:', error.message);
    }
  }

  function renderCalendarGrid(year, month, moodByDate) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    const moodIcons = {
      Happy: '😊',
      Good: '🙂',
      Neutral: '😐',
      Bad: '😞',
      Angry: '😠',
      Sad: '😢',
    };

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDiv = document.createElement('div');
      dayDiv.classList.add('calendar-day');
      dayDiv.dataset.day = i;

      const moods = moodByDate?.[i];
      if (moods && moods.length > 0) {
        const dominantMood = getDominantMood(moods);
        dayDiv.style.backgroundColor = getMoodColor(dominantMood);

        if (typeof dominantMood === 'string') {
          dayDiv.innerHTML = `${i}<br><span>${moodIcons[dominantMood] || ''}</span>`;
          dayDiv.title = `Mayoritas mood: ${dominantMood}`;
        } else if (dominantMood.mixed) {
          const iconList = dominantMood.mixed.map(m => moodIcons[m] || '').join(' ');
          dayDiv.innerHTML = `${i}<br><span>${iconList}</span>`;
          dayDiv.title = `Mood imbang: ${dominantMood.mixed.join(', ')}`;
        }
      } else {
        dayDiv.textContent = i;
      }

      grid.appendChild(dayDiv);
    }

    document.getElementById('month-year-title').textContent = `${monthNames[month]} ${year}`;
  }

  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    loadCalendarMood(true); // ⬅️ skip auto-insert saat navigasi bulan
  });

  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    loadCalendarMood(true);
  });

  const storedLastMood = localStorage.getItem(getUserKey('lastMood'));
  if (storedLastMood) {
    updateMoodLog(JSON.parse(storedLastMood));
  }

  // ⬇️ Panggil dengan auto-insert ON saat awal render
  loadCalendarMood();
}
};

export default Tracking;
