import { supabase } from '../../config/supabaseClient.js';

const Beranda = {
  async render() {
    return `
      <section class="hero">
        <div class="hero-content">
          <img src="icons/header2.gif" alt="Illustration" class="hero-image" />
          <div class="hero-text">
            <h2 id="rotating-quote">“ Tidak apa-apa merasa lelah — jangan lupa istirahat ”</h2>
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
        <div class="scroll-wrapper-article">
  <button id="scroll-article-left" aria-label="Scroll Left" class="scroll-button left">
    <i class="fas fa-chevron-left"></i>
  </button>
  <div class="article-cards" id="article-container"></div>
  <button id="scroll-article-right" aria-label="Scroll Right" class="scroll-button right">
    <i class="fas fa-chevron-right"></i>
  </button>
</div>

      </section>
    `;
  },

  async afterRender() {
    console.log('afterRender Beranda dipanggil');

    // ========== Quotes Rotasi Tiap Menit ========== //
    const quotes = [
      '“ Tidak apa-apa merasa lelah — jangan lupa istirahat ”',
      '“ Hari yang buruk bukan berarti hidup yang buruk ”',
      '“ Kamu berhak istirahat tanpa merasa bersalah ”',
      '“ Perasaanmu valid, jangan abaikan itu ”',
      '“ Pelan-pelan saja, kamu sedang berproses ”',
    ];

    const quoteEl = document.getElementById('rotating-quote');
    let quoteIndex = 0;

    setInterval(() => {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      quoteEl.textContent = quotes[quoteIndex];
    }, 60000); // 1 menit

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
if (scrollLeftBtn && scrollRightBtn) {
  scrollLeftBtn.addEventListener('click', () => {
    const currentScrollLeft = combinedContainer.scrollLeft;

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

    if (currentScrollLeft >= maxScrollLeft - 5) {
      combinedContainer.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      combinedContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  });
}


    // ========== Artikel ========== //
    const articleContainer = document.querySelector('#article-container');
    articleContainer.innerHTML = '';

    const { data: artikelData, error: artikelError } = await supabase
      .from('artikel')
      .select('*')
      .order('id', { ascending: true });

    if (artikelError) {
      console.error('Gagal mengambil artikel:', artikelError);
      articleContainer.innerHTML = '<p>Gagal memuat artikel.</p>';
      return;
    }

    artikelData.forEach((item) => {
      const existing = articleContainer.querySelector(`.article-card[data-id="${item.id}"]`);
      if (existing) return;

      const card = document.createElement('div');
      card.classList.add('article-card');
      card.setAttribute('data-id', item.id);

      card.innerHTML = `
        <img src="${item.gambar}" alt="${item.judul}" />
        ${item.judul ? `<h4>${item.judul}</h4>` : ''}
        <p>${item.isi}</p>
        ${item.url ? `<a href="${item.url}" target="_blank">Baca selengkapnya</a>` : ''}
      `;

      articleContainer.appendChild(card);
    });
    // Geser artikel ke kiri/kanan
const articleScrollLeftBtn = document.getElementById('scroll-article-left');
const articleScrollRightBtn = document.getElementById('scroll-article-right');
const articleContainerScroll = document.getElementById('article-container');

const articleCard = document.querySelector('.article-card');
const articleCardWidth = articleCard?.offsetWidth || 300;
const articleCardGap = 32;
const articleScrollAmount = articleCardWidth + articleCardGap;

if (articleScrollLeftBtn && articleScrollRightBtn && articleContainerScroll) {
  articleScrollLeftBtn.addEventListener('click', () => {
    const currentScroll = articleContainerScroll.scrollLeft;
    if (currentScroll <= 5) {
      const maxScroll = articleContainerScroll.scrollWidth - articleContainerScroll.clientWidth;
      articleContainerScroll.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      articleContainerScroll.scrollBy({ left: -articleScrollAmount, behavior: 'smooth' });
    }
  });

  articleScrollRightBtn.addEventListener('click', () => {
    const maxScroll = articleContainerScroll.scrollWidth - articleContainerScroll.clientWidth;
    const currentScroll = articleContainerScroll.scrollLeft;
    if (currentScroll >= maxScroll - 5) {
      articleContainerScroll.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      articleContainerScroll.scrollBy({ left: articleScrollAmount, behavior: 'smooth' });
    }
  });
}

  },
};

export default Beranda;
