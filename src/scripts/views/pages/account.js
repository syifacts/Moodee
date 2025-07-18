const Account = {
  async render() {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      return `
        <section class="unauthorized">
          <p>Ups! Kamu belum login.</p>
        </section>
      `;
    }

    const user = JSON.parse(rawUser);

    return `
      <section class="account-hero">
        <div class="hero-box">
          <div>
            <h2>Hi, ${user.name}</h2>
            <p>Setiap perasaan itu valid. Mari lihat perjalanan emosionalmu.</p>
          </div>
          <img src="icons/hero-cat.png" alt="Mascot" class="hero-img" />
        </div>
      </section>

      <section class="account-stats">
        <div class="stat-box">Terima kasih telah berbagi perasaanmu sebanyak... <strong>${user.entries}</strong></div>
        <div class="stat-box">Sebagian besar bulan ini, kamu dibalut perasaan... <strong>${user.dominantMood}</strong></div>
      </section>

      <section class="account-info">
        <h3>Informasi Akun</h3>
        <div class="info-card">
          <img src="${user.avatar}" alt="Avatar" class="avatar" />
          <div class="info-fields">
            <label>Name</label>
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
          ${user.moodHistory.map(item => `
            <div class="mood-item">
              <strong>${item.mood}</strong>
              <span>${item.time}</span>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  },

  async afterRender() {
    // Post render logic here if needed
  },
};

export default Account;
