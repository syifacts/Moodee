import { supabase } from '../../config/supabaseClient.js';

function getDominantMood(moods) {
  const count = {};
  moods.forEach(entry => {
    const mood = entry.mood;
    if (typeof mood === 'string') {
      count[mood] = (count[mood] || 0) + 1;
    } else if (mood && mood.mixed && Array.isArray(mood.mixed)) {
      mood.mixed.forEach(m => {
        count[m] = (count[m] || 0) + 1;
      });
    }
  });

  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return 'Neutral';

  const maxCount = sorted[0][1];
  const topMoods = sorted.filter(([_, count]) => count === maxCount).map(([mood]) => mood);
  return topMoods.length === 1 ? topMoods[0] : { mixed: topMoods };
}

    function formatTime(timeStr) {
  const date = new Date(`1970-01-01T${timeStr}`);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
const Account = {
  async render() {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      window.location.hash = '/login';
      return '';
    }

    const user = JSON.parse(rawUser);

    // Ambil data mood dari Supabase
    const { data: moods = [], error } = await supabase
      .from('mood')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Gagal mengambil data mood:', error.message);
      return '<p>Gagal memuat data statistik mood.</p>';
    }

    const totalEntries = moods.length;

    // Filter mood bulan ini
    const now = new Date();
    const monthMoods = moods.filter(m => {
      const d = new Date(m.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const dominantMood = getDominantMood(monthMoods);
    const moodText = typeof dominantMood === 'string'
      ? dominantMood
      : dominantMood.mixed.join(', ');

    // Riwayat 5 mood terakhir
    const moodHistoryHTML = moods
      .slice(-5)
      .reverse()
      .map(item => {
        const moodStr = typeof item.mood === 'string'
          ? item.mood
          : item.mood?.mixed?.join(', ') || 'Tidak diketahui';
        return `
          <div class="mood-item">
            <strong>${moodStr}</strong>
            <span>${formatTime(item.time)}</span>

          </div>
        `;
      }).join('');

    return `
      <section class="account-hero">
        <div class="hero-box">
          <div>
            <h2>Hi, ${user.name}</h2>
            <p>Setiap perasaan itu valid. <br>Mari lihat perjalanan emosionalmu.</p>
          </div>
          <img src="icons/mascot.png" alt="Mascot" class="hero-img" />
        </div>
      </section>

      <section class="account-stats">
        <div class="stat-box">Terima kasih telah berbagi perasaanmu sebanyak... <br><strong>${totalEntries}</strong></div>
        <div class="stat-box">Sebagian besar bulan ini, kamu dibalut perasaan... <br> <strong>${moodText}</strong></div>
      </section>

      <section class="account-info">
        <h3>Informasi Akun</h3>
        <div class="info-card">
          <img src="${user.avatar || 'icons/default-avatar.png'}" alt="Avatar" class="avatar-account" />
          <div class="info-fields">
            <label>Nama</label>
            <input type="text" value="${user.name}" disabled />
            <label>Username</label>
            <input type="text" value="${user.username}" disabled />
            <label>Password</label>
            <input type="password" value="******" disabled />
            <a href="#">Ubah Password</a>
          </div>
        </div>
      </section>

      <section class="mood-history">
        <h3>Riwayat Mood</h3>
        <div class="mood-list">
          ${moodHistoryHTML || '<p>Belum ada riwayat mood.</p>'}
        </div>
      </section>

      <section class="logout-section">
        <button id="logout-btn" class="logout-button">Logout</button>
      </section>
    `;
  },

  async afterRender() {
    const logoutBtn = document.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.hash = '/login';
      });
    }
  }
};

export default Account;
