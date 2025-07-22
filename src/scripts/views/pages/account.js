import { supabase } from '../../config/supabaseClient.js';
import Chart from 'chart.js/auto';

function getDominantMoodWithPercentage(moods) {
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

  const total = Object.values(count).reduce((a, b) => a + b, 0);
  if (total === 0) return { moodText: 'Netral', percentages: {} };

  const percentages = {};
  for (const [mood, val] of Object.entries(count)) {
    percentages[mood] = ((val / total) * 100).toFixed(1);
  }

  const max = Math.max(...Object.values(percentages).map(p => parseFloat(p)));
  const topMoods = Object.entries(percentages)
    .filter(([_, val]) => parseFloat(val) === max)
    .map(([mood]) => mood);

 let moodText;
let moodOnlyText;
if (topMoods.length > 4) {
  moodText = 'Netral';
  moodOnlyText = 'Netral';
} else if (topMoods.length === 1) {
  moodText = `${topMoods[0]} (${percentages[topMoods[0]]}%)`;
  moodOnlyText = topMoods[0];
} else {
  moodText = topMoods.map(m => `${m} (${percentages[m]}%)`).join(', ');
  moodOnlyText = topMoods.join(', ');
}

return { moodText, moodOnlyText, percentages };

}
function getMostFrequentMoodDate(moods) {
  const countByDateMood = {};

  moods.forEach(entry => {
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
    });

    if (typeof entry.mood === 'string') {
      const key = `${entry.mood}||${formattedDate}`;
      countByDateMood[key] = (countByDateMood[key] || 0) + 1;
    } else if (entry.mood && entry.mood.mixed && Array.isArray(entry.mood.mixed)) {
      entry.mood.mixed.forEach(m => {
        const key = `${m}||${formattedDate}`;
        countByDateMood[key] = (countByDateMood[key] || 0) + 1;
      });
    }
  });

  if (Object.keys(countByDateMood).length === 0) return null;

  const topEntry = Object.entries(countByDateMood).reduce((a, b) => b[1] > a[1] ? b : a);
  const [topMood, topDate] = topEntry[0].split('||');

  return { topMood, topDate };
}

const Account = {
  async render() {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      window.location.hash = '/login';
      return '';
    }

    const user = JSON.parse(rawUser);

    const { data: moods = [], error } = await supabase
      .from('mood')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Gagal mengambil data mood:', error.message);
      return '<p>Gagal memuat data statistik mood.</p>';
    }

    const totalEntries = moods.length;
    const now = new Date();
    const monthMoods = moods.filter(m => {
      const d = new Date(m.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const { moodText, moodOnlyText, percentages } = getDominantMoodWithPercentage(monthMoods);
const highlight = getMostFrequentMoodDate(moods);
const highlightHTML = highlight
  ? `<div class="highlight-box">
      <h2> 💡 Highlight Mood </h2>
      <h4>Kamu paling sering merasa <strong>${highlight.topMood}</strong> pada tanggal <strong>${highlight.topDate}</strong></h4>
    </div>`
  : '';


    return `
        <section class="account-wrapped">
      <section class="account-hero">
        <div class="hero-box">
          <div>
            <h2>Hai, ${user.name}👋🏻</h2>
            <p>Setiap perasaan itu valid, karena semua emosi memiliki makna dan cerita di baliknya. Sekarang, mari kita telusuri perjalanan emosionalmu untuk memahami diri lebih dalam.</p>
          </div>
          <img src="icons/mascot.png" alt="Mascot" class="hero-img" />
        </div>
      </section>

      <section class="account-stats">
  <div class="stat-box">
  <p>
    <span>Terima kasih telah berbagi perasaanmu sebanyak...</span>
    <strong>${totalEntries} Kali</strong>
  </p>
</div>

<div class="stat-box">
  <p>
    <span>Sebagian besar bulan ini, kamu dibalut perasaan...</span>
    <strong>${moodOnlyText}</strong>
  </p>
</div>

</section>

</section>

    <section class="account-summary-wrapper">
    <section class="left-column">
      <section class="account-info">
        <h3>🪪 Informasi Akun</h3>
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
      ${highlightHTML}
      </section>
    <section class="mood-history">
  <h3>📈 Persentase Mood Bulan Ini</h3>
  <p style="margin-top: -10px; font-size: 1.2rem; color: #666;">Diagram ini menunjukkan proporsi mood kamu selama bulan ini.</p>
  <canvas id="moodPieChart" width="300" height="300"></canvas>
  <div id="mood-percentage-list" class="mood-percentage-list"></div>
</section>
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

  const rawUser = localStorage.getItem('user');
  const user = JSON.parse(rawUser);

  const { data: moods = [] } = await supabase
    .from('mood')
    .select('*')
    .eq('user_id', user.id);

  const now = new Date();
  const monthMoods = moods.filter(m => {
    const d = new Date(m.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const { percentages } = getDominantMoodWithPercentage(monthMoods);

  if (Object.keys(percentages).length === 0) return;

  const moodLabels = Object.keys(percentages);
  const moodValues = Object.values(percentages);
  const moodColors = {
           Happy: '#01B26E',
        Good: '#F97243',
        Bad: '#368AE9',
        Sad: '#856EFA',
        Angry: '#DE385E',
    Mixed: '#AAAAAA'
  };
  const chartColors = moodLabels.map(label => moodColors[label] || '#ccc');

  const ctx = document.getElementById('moodPieChart')?.getContext('2d');
  if (ctx) {
    // 💡 Destroy chart lama hanya jika sudah pernah dibuat
    if (window.accountChartInstance) {
      window.accountChartInstance.destroy();
    }

    window.accountChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: moodLabels,
        datasets: [{
          data: moodValues,
          responsive: true,
    maintainAspectRatio: false,
          backgroundColor: chartColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value}%`;
              }
            }
          }
        }
      }
    });
    const listContainer = document.getElementById('mood-percentage-list');
  if (listContainer) {
    const listHtml = moodLabels.map((label, i) => {
  const color = moodColors[label] || '#ccc';
  return `
    <div class="mood-item">
      <div class="mood-color" style="background-color: ${color};"></div>
      ${label}: ${moodValues[i]}%
    </div>
  `;
}).join('');

    listContainer.innerHTML = listHtml;
  }
  }
}

};

export default Account;
