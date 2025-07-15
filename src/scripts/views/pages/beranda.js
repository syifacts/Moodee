import { supabase } from '../../config/supabaseClient.js'

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
  <h3>💡 Fakta dan Tips</h3>

  <div class="scroll-wrapper">
    <button id="scroll-left" aria-label="Scroll Left" class="scroll-button left">
      <i class="fas fa-chevron-left"></i>
    </button>

    <div id="combined-list" class="card-list"></div>

    <button id="scroll-right" aria-label="Scroll Right" class="scroll-button right">
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
</section>


     <section class="articles">
  <h3>🗞️ Artikel</h3>
  <div class="article-cards" id="article-container"></div>
</section>

    `;
  },

async afterRender() {
  console.log('afterRender Beranda dipanggil');

  // ========== Faktatips ========== //
  const combinedContainer = document.querySelector('#combined-list');
  combinedContainer.innerHTML = '';

  const { data: tipsData, error: tipsError } = await supabase
    .from('card_tips')
    .select('judul, konten')
    .order('id', { ascending: true });

  if (tipsData && tipsData.length > 0) {
    tipsData.forEach((item) => {
      const card = document.createElement('div');
      card.classList.add('card', item.judul.toLowerCase().replace(/\s/g, '-'));
      card.innerHTML = `
        <strong>${item.judul}</strong>
        <p>${item.konten}</p>
      `;
      combinedContainer.appendChild(card);
    });
  } else {
    console.error('Gagal memuat data dari Supabase:', tipsError);
    combinedContainer.innerHTML = '<p>Tidak ada data tersedia.</p>';
  }
  // Geser kiri-kanan
const scrollLeftBtn = document.getElementById('scroll-left');
const scrollRightBtn = document.getElementById('scroll-right');
const card = document.querySelector('.card');
const cardWidth = card?.offsetWidth || 590;
const cardGap = 50;
const scrollAmount = cardWidth + cardGap;


scrollLeftBtn.addEventListener('click', () => {
  const currentScrollLeft = combinedContainer.scrollLeft;

  // Jika sudah di paling kiri (dengan toleransi)
  if (currentScrollLeft <= 5) {
    const maxScrollLeft = combinedContainer.scrollWidth - combinedContainer.clientWidth;
    combinedContainer.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
  } else {
    combinedContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }
});

scrollRightBtn.addEventListener('click', () => {
  const maxScrollLeft = combinedContainer.scrollWidth - combinedContainer.clientWidth;
  const currentScrollLeft = combinedContainer.scrollLeft;

  // Periksa apakah sudah benar-benar mentok kanan (pakai toleransi lebih besar)
  if (currentScrollLeft >= maxScrollLeft - 5) {
    // Balik ke awal
    combinedContainer.scrollTo({ left: 0, behavior: 'smooth' });
  } else {
    // Masih bisa geser kanan
    combinedContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
});



  // ========== Artikel ========== //
const articleContainer = document.querySelector('#article-container');
articleContainer.innerHTML = ''; // ✅ Bersihkan dulu sebelum isi ulang

const { data: artikelData, error: artikelError } = await supabase
  .from('artikel')
  .select('*')
  .order('id', { ascending: true }); // optional: urutkan biar konsisten

if (artikelError) {
  console.error('Gagal mengambil artikel:', artikelError);
  articleContainer.innerHTML = '<p>Gagal memuat artikel.</p>';
  return;
}

artikelData.forEach((item) => {
  // Cek apakah sudah ada artikel dengan judul yang sama
  const existing = articleContainer.querySelector(`.article-card[data-id="${item.id}"]`);
  if (existing) return; // Skip kalau sudah ada

  const card = document.createElement('div');
  card.classList.add('article-card');
  card.setAttribute('data-id', item.id); // Simpan ID unik sebagai atribut

  card.innerHTML = `
    <img src="${item.gambar}" alt="${item.judul}" />
    ${item.judul ? `<h4>${item.judul}</h4>` : ''}
    <p>${item.isi}</p>
    ${item.url ? `<a href="${item.url}" target="_blank">Baca selengkapnya</a>` : ''}
  `;

  articleContainer.appendChild(card);
});

}
};

export default Beranda;
