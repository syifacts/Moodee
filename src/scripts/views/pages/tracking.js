import { supabase } from '../../config/supabaseClient.js';

const Tracking = {
  async render() {
    return `
      <section class="tracking-hero">
        <img src="icons/pic4.jpg" alt="Illustration" class="hero-image" />
        <p class="tracking-quote">❝ Mengetahui kapan kamu paling bahagia atau paling lelah adalah awal dari mencintai diri sendiri ❞</p>

        <!-- Info terakhir -->
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
        <h3>July 2025</h3>
        <div class="calendar-grid">
          ${Array.from({ length: 31 }, (_, i) => `
            <div class="calendar-day" data-day="${i + 1}">
              ${i + 1}
            </div>`).join('')}
        </div>
      </section>

      <section class="tracking-message">
        <div class="circle-message">
          <p>❝ Tracking suasana hatimu tidak berarti kamu lemah — itu berarti kamu sadar diri ❞</p>
        </div>
        <div>
          <p>Setiap emosi itu penting. Pantau suasana hati Anda setiap hari dan renungkan dengan statistik kalender yang berwawasan!</p>
        </div>
      </section>
      <div id="popup-toast" class="popup-toast hidden">Mood berhasil disimpan!</div>
    `;
  },

  async afterRender() {
    const moodButtons = document.querySelectorAll('.img-button');
    const calendarDays = document.querySelectorAll('.calendar-day');
    const log = document.getElementById('mood-log');

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Silakan login!');
      window.location.hash = '/login';
      return;
    }

    const today = new Date();
    const currentDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = today.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

    // Helper function to build unique localStorage key per user
    function getUserKey(key) {
      return `${key}_${user.id}`;
    }

    function canSubmitMood() {
      const lastClick = localStorage.getItem(getUserKey('lastMoodTime'));
      if (!lastClick) return true;

      const oneHour = 60 * 60 * 1000;
      const now = Date.now();
      return now - parseInt(lastClick) >= oneHour;
    }

    function updateMoodLog({ date, time, mood }) {
      log.innerHTML = `
        <p>Mood terakhir kamu: </p>
        <strong>${date}</strong> - <strong>${time}</strong> :
        <span style="color:${getMoodColor(mood)}">${mood}</span>
      `;
    }

    function getMoodColor(mood) {
      switch (mood) {
        case 'Happy': return '#00b894';
        case 'Good': return '#fdcb6e';
        case 'Bad': return '#0984e3';
        case 'Sad': return '#a29bfe';
        case 'Angry': return '#d63031';
        default: return '#dfe6e9';
      }
    }

    function getDominantMood(moods) {
      const freq = {};
      moods.forEach(m => freq[m] = (freq[m] || 0) + 1);
      return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
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

    // EVENT LISTENER: Klik tombol mood
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
          const lastMood = {
            date: currentDate,
            time: currentTime,
            mood: selectedMood
          };

          // Simpan mood terakhir & waktu kirim dengan key user-specific
          localStorage.setItem(getUserKey('lastMood'), JSON.stringify(lastMood));
          localStorage.setItem(getUserKey('lastMoodTime'), Date.now().toString());

          updateMoodLog(lastMood);
          showPopup('Mood berhasil disimpan!');
          loadCalendarMood();
        } else {
          console.error('Gagal menyimpan mood:', error.message);
          alert('Gagal menyimpan mood!');
        }
      });
    });

    // Load data mood untuk kalender
    async function loadCalendarMood() {
      const { data, error } = await supabase
        .from('mood')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Gagal memuat data mood:', error.message);
        return;
      }

      const moodByDate = {};
      data.forEach(entry => {
        const day = new Date(entry.date).getDate();
        if (!moodByDate[day]) moodByDate[day] = [];
        moodByDate[day].push(entry.mood);
      });

      calendarDays.forEach(day => {
        const dayNum = parseInt(day.dataset.day);
        const moods = moodByDate[dayNum];
        if (moods && moods.length > 0) {
          const dominantMood = getDominantMood(moods);
          day.style.backgroundColor = getMoodColor(dominantMood);
          day.title = `Mayoritas mood: ${dominantMood}`;
        }
      });

      // Auto-mood untuk besok
      const todayMoods = data.filter(entry => entry.date === currentDate);
      if (todayMoods.length > 0) {
        const moodFreq = {};
        todayMoods.forEach(m => {
          moodFreq[m.mood] = (moodFreq[m.mood] || 0) + 1;
        });

        const topMood = Object.entries(moodFreq).sort((a, b) => b[1] - a[1])[0][0];
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];

        const existing = data.find(entry => entry.date === tomorrowDate && entry.user_id === user.id);
        if (!existing) {
          await supabase.from('mood').insert({
            user_id: user.id,
            date: tomorrowDate,
            time: 'Auto',
            mood: topMood
          });
        }
      }
    }

    // Tampilkan mood terakhir dari localStorage jika ada
    const storedLastMood = localStorage.getItem(getUserKey('lastMood'));
    if (storedLastMood) {
      updateMoodLog(JSON.parse(storedLastMood));
    }

    // Load data kalender saat halaman selesai render
    loadCalendarMood();
  }
};

export default Tracking;
