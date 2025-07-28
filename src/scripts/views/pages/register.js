import { supabase } from '../../config/supabaseClient';

const Register = {
  async render() {
    return `
      <section class="register-page">
        <div class="register-card">
          <div class="register-img">
            <img src="icons/register.png" alt="Character"/>
          </div>
          <div class="register-content">
            <h2>Welcome to Moodee!</h2>
            <p>Register your account</p>
            
            <form id="register-form" class="register-form">
              <label for="name">Name</label>
              <input type="text" id="name" placeholder="Enter your name" required />

              <label for="username">Username</label>
              <input type="text" id="username" placeholder="Enter your username" required />

              <label for="password">Password</label>
              <input type="password" id="password" placeholder="Enter your password" required />

              <button type="submit">Register</button>

              <div class="signup-link">
                Already have an account?
                <a href="#/login">Sign In</a>
              </div>
            </form>
          </div>
          <div id="error-popup" class="popup-overlay">
            <div class="popup-card">
              <button class="close-btn">&times;</button>
              <p id="popup-message"></p>
            </div>
          </div>
        </div>

      </section>
    `;
  },

async afterRender() {
    // 1. Ambil semua elemen yang diperlukan
    const form = document.querySelector('#register-form');
    const popupOverlay = document.querySelector('#error-popup');
    const popupCard = popupOverlay.querySelector('.popup-card');
    const popupMessage = document.querySelector('#popup-message');
    const closeBtn = popupOverlay.querySelector('.close-btn');
    const submitButton = form.querySelector('button[type="submit"]');

    // 2. Fungsi showPopup yang lebih canggih (sesuai permintaan terakhir)
    function showPopup(message, type = 'error') {
        const icon = type === 'success' ? '✅' : '⚠';
        popupMessage.innerHTML = `<span class="popup-icon">${icon}</span> ${message}`;

        
        // Atur kelas pada kartu untuk mengubah warnanya
        popupCard.className = 'popup-card'; // Reset kelas menjadi dasar
        popupCard.classList.add(type === 'success' ? 'popup-success' : 'popup-error');

        popupOverlay.classList.add('show');
    }

    function closePopup() {
        popupOverlay.classList.remove('show');
    }

    // 3. Event listener untuk menutup pop-up
    closeBtn.addEventListener('click', closePopup);
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });

    // 4. Logika utama saat form di-submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Mendaftarkan...';

        const name = form.querySelector('#name').value.trim();
        const username = form.querySelector('#username').value.trim();
        const password = form.querySelector('#password').value.trim();

        const { data: existingUser, error: checkError } = await supabase
            .from('data_pengguna')
            .select('username')
            .eq('username', username)
            .maybeSingle();
        
        if (existingUser || checkError) {
            const message = existingUser ? 'Registrasi gagal: Username sudah digunakan.' : 'Terjadi kesalahan saat memeriksa username.';
            showPopup(message);
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
            return;
        }
        
        const { error: insertError } = await supabase
            .from('data_pengguna')
            .insert([{ name, username, password }]);

        if (insertError) {
            showPopup('Registrasi gagal: ' + insertError.message);
            // Perbaikan: Aktifkan kembali tombol jika terjadi error
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
        } else {
            showPopup('Registrasi berhasil! Anda akan dialihkan...', 'success');
            setTimeout(() => {
                window.location.hash = '/login';
            }, 15000);
        }
    });
},
};

export default Register;