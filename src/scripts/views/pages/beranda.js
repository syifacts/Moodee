const Beranda = {
  async render() {
    return `
      <section class="hero">
        <div class="hero-content">
          <img src="icons/header_beranda.png" alt="Illustration" class="hero-image"  />
          <div class="hero-text">
            <h2>“ Tidak apa-apa merasa lelah — jangan lupa istirahat ”</h2>
            <p>Catat bagaimana perasaanmu setiap hari — senang, sedih, merasa buruk, marah, atau biasa saja. Kamu bisa pilih mood yang paling menggambarkan harimu.</p>
          </div>
        </div>
      </section>

      <section class="statistics">
        <h3>📊 Statistik Bulanan</h3>
        <div class="calendar-and-desc">
          <img src="/icons/Calendar.png" alt="Mood Calendar" />
           <img src="/icons/beranda1.png" alt="Mood" />
          <p>Pantau mood harianmu dan lihat pola emosimu dalam tampilan kalender interaktif. Dapatkan insight dari statistik pribadi untuk membantu kamu mengenali, memahami, dan merawat dirimu lebih baik setiap hari.</p>
        </div>
      </section>

      <section class="journaling">
        <h3>✍🏻 Journaling</h3>
        <div class="journaling-content">
          <p>Journaling sebagai tempat pribadi untuk mengekspresikan perasaan, mencatat pengalaman, dan merenungi keseharianmu. Kamu bisa menulis jurnal secara privat, hanya untuk dirimu sendiri, atau memilih untuk membagikannya secara publik agar bisa terhubung dan berdiskusi dengan pengguna lain yang mengalami hal serupa.</p>
          <img src="/icons/journaling.png" alt="Journaling Illustration" class="journal-image" />
        </div>
      </section>

      <section class="facts-tips">
        <div class="fact">
          <h4>Mood Fact</h4>
          <p>🍌 Tahukah Anda bahwa pisang dapat membantu meningkatkan suasana hati Anda? Pisang mengandung triptofan – zat kimia yang memberikan rasa senang yang juga ditemukan dalam cokelat!</p>
        </div>
        <div class="tips">
          <h4>Tips</h4>
          <p>🕯️ Menyalakan lilin aromaterapi bisa bantu redakan stres. Lavender, eucalyptus, dan peppermint dikenal bisa menenangkan pikiran dan tubuh. Ruangan juga jadi lebih nyaman dan tenang.</p>
        </div>
      </section>

      <section class="articles">
        <h3>📰 Artikel</h3>
        <div class="article-cards">
          <div class="article-card">
            <img src="/images/mood-bad.jpg" alt="Mood Bad" />
            <p>Ada berbagai penyebab mood swing, biasanya kondisi tersebut dikaitkan dengan perubahan hormon dan faktor gaya hidup yang tidak sehat.</p>
          </div>
          <div class="article-card">
            <img src="/images/mood-relax.jpg" alt="Mood Relax" />
            <p>Beberapa faktor yang dapat menyebabkan mood swing meliputi perubahan hormonal, stres..</p>
          </div>
          <div class="article-card">
            <img src="/images/makanan.jpg" alt="Makanan Mood" />
            <h4>MAKANAN SEHAT UNTUK BAD MOOD</h4>
            <p>Bad Mood menyebabkan kita menjadi sering marah, atau melepaskannya dengan mengonsumsi makanan yang tidak sehat...</p>
            <a href="https://www.studiemakelasi.com/artikel-utama-sehat-bad-temukan/makanan-sehat-untuk-bad-mood" target="_blank">Baca selengkapnya</a>
          </div>
          <div class="article-card">
            <img src="/images/musik.jpg" alt="Musik Mood" />
            <h4>Apakah Musik di Mobil Bisa Mempengaruhi Mood saat Berkendara?</h4>
            <p>Ternyata, musik di mobil bisa mempengaruhi mood dan keselamatan saat berkendara. Mengapa demikian?</p>
            <a href="https://www.studiemakelasi.com/artikel/musik-mood-saat-berkendara" target="_blank">Baca selengkapnya</a>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    // Tambahan efek, animasi, interaksi setelah render bisa di sini
  }
};

export default Beranda;
