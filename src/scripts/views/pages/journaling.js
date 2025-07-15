const Journaling = {
  async render() {
    return `
    <section class="hero">
        <div class="hero-content">
          <img src="icons/header_journ.png" />
        </div>
      </section>
      <section class="sectionjourn">
        <button class="tab-button active">Trending</button>
        <button class="tab-button">Postingan Saya</button>
      </section>

      <div class="postingan">
        <div class="postingan-header">
          <div class="user-info">
            <div class="avatar"></div>
            <div>
              <span class="username">Sipa org depok</span>
              <span class="date">09 juli</span>
            </div>
          </div>
          <span class="badge">Bad</span>
        </div>
        <div class="postingan-content">
          Hari yang buruk, semoga besok lebih baik !! Nggak apa-apa kalau hari ini berat. Besok, kita coba lagi.
        </div>
        <div class="postingan-footer">
          <div class="icon-text">
            ❤️ <span>1234</span>
          </div>
          <div class="icon-text">
            💬 <span>3564</span>
          </div>
        </div>
      </div>

      <div class="postingan">
        <div class="postingan-header">
          <div class="user-info">
            <div class="avatar"></div>
            <div>
              <span class="username">Sipa org depok</span>
              <span class="date">09 juli</span>
            </div>
          </div>
          <span class="badge">Bad</span>
        </div>
        <div class="postingan-content">
          Hari yang buruk, semoga besok lebih baik !! Nggak apa-apa kalau hari ini berat. Besok, kita coba lagi.
        </div>
        <div class="postingan-footer">
          <div class="icon-text">
            ❤️ <span>1234</span>
          </div>
          <div class="icon-text">
            💬 <span>3564</span>
          </div>
        </div>
      </div>

      <div class="postingan">
        <div class="postingan-header">
          <div class="user-info">
            <div class="avatar"></div>
            <div>
              <span class="username">Sipa org depok</span>
              <span class="date">09 juli</span>
            </div>
          </div>
          <span class="badge">Bad</span>
        </div>
        <div class="postingan-content">
          Hari yang buruk, semoga besok lebih baik !! Nggak apa-apa kalau hari ini berat. Besok, kita coba lagi.
        </div>
        <div class="postingan-footer">
          <div class="icon-text">
            ❤️ <span>1234</span>
          </div>
          <div class="icon-text">
            💬 <span>3564</span>
          </div>
        </div>
      </div>

      <div class="postingan">
        <div class="postingan-header">
          <div class="user-info">
            <div class="avatar"></div>
            <div>
              <span class="username">Sipa org depok</span>
              <span class="date">09 juli</span>
            </div>
          </div>
          <span class="badge">Bad</span>
        </div>
        <div class="postingan-content">
          Hari yang buruk, semoga besok lebih baik !! Nggak apa-apa kalau hari ini berat. Besok, kita coba lagi.
        </div>
        <div class="postingan-footer">
          <div class="icon-text">
            ❤️ <span>1234</span>
          </div>
          <div class="icon-text">
            💬 <span>3564</span>
          </div>
        </div>
      </div>

      <div class="postingan">
        <div class="postingan-header">
          <div class="user-info">
            <div class="avatar"></div>
            <div>
              <span class="username">Sipa org depok</span>
              <span class="date">09 juli</span>
            </div>
          </div>
          <span class="badge">Bad</span>
        </div>
        <div class="postingan-content">
          Hari yang buruk, semoga besok lebih baik !! Nggak apa-apa kalau hari ini berat. Besok, kita coba lagi.
        </div>
        <div class="postingan-footer">
          <div class="icon-text">
            ❤️ <span>1234</span>
          </div>
          <div class="icon-text">
            💬 <span>3564</span>
          </div>
        </div>
      </div>

      <button class="btn-add">
        <img src="/icons/add.png" alt="Add Icon" />
      </button>

    `;
  },

  async afterRender() {
    // Tambahkan JS logic jika perlu dijalankan setelah render
    console.log('Journ page rendered!');
  }
};

export default Journaling;
    