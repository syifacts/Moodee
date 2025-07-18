const Tracking = {
  async render() {
    return `
      <section class="tracking-hero">
        <img src="icons/pic4.jpg" alt="Illustration" class="hero-image" />
        <p class="tracking-quote">❝ Mengetahui kapan kamu paling bahagia atau paling lelah adalah awal dari mencintai diri sendiri ❞</p>
      </section>

      <section class="tracking-form">
          <img src="/icons/pic10.png" alt="Mood Calendar" />
        <h2>Bagaimana Perasaanmu Saat Ini?</h2>
        <p>Pilih suasana hati sesuai dengan perasaanmu saat ini</p>
        <div class="mood-buttons">
  <button class="img-button"><img src="icons/happy.png" alt="Happy" /></button>
  <button class="img-button"><img src="icons/good.png" alt="Good" /></button>
  <button class="img-button"><img src="icons/bad.png" alt="Bad" /></button>
  <button class="img-button"><img src="icons/sad.png" alt="Sad" /></button>
  <button class="img-button"><img src="icons/angry.png" alt="Angry" /></button>
</div>


      </section>

      <section class="tracking-calendar">
        <h3>January 2024</h3>
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
    `;
  },

  async afterRender() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const calendarDays = document.querySelectorAll('.calendar-day');

    moodButtons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedMood = button.dataset.mood;
        alert(`Mood "${selectedMood}" tercatat!`);
        localStorage.setItem('selectedMood', selectedMood);
      });
    });

    calendarDays.forEach(day => {
      day.addEventListener('click', () => {
        const mood = localStorage.getItem('selectedMood');
        if (mood) {
          day.textContent += ` (${mood})`;
          day.style.backgroundColor = getMoodColor(mood);
        }
      });
    });

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
  }
};

export default Tracking;
