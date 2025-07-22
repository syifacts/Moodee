import { supabase } from '../../config/supabaseClient';

const Login = {
  async render() {
    return `
      <section class="login-page">
        <img src="icons/login2.png" alt="Character" class="left-illustration" />

        <div class="login-card">
          <h2>Welcome back to Moodee!</h2>
          <p>Please enter your details</p>

          <form id="login-form" class="login-form">
            <label for="username">Username</label>
            <input type="text" id="username" placeholder="Enter your username" required />

            <label for="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" required />

            <button type="submit">Login</button>

            <div class="signup-link">
              You don’t have an account?
              <a href="#/register">Sign Up</a>
            </div>
          </form>
        </div>

        <img src="icons/login1.png" alt="Emoji Mood" class="right-background" />

        <!-- Session Modal -->
        <div id="session-modal" class="modal hidden">
          <div class="modal-content">
            <p>Sesi Anda telah habis. Silakan login kembali.</p>
            <button id="session-ok">OK</button>
          </div>
        </div>

        <!-- Popup Notification (sama seperti register) -->
<div id="login-popup" class="popup-overlay">
  <div class="popup-card">
    <button class="close-btn">&times;</button>
    <p id="popup-message"></p>
  </div>
</div>

    `;
  },

  async afterRender() {
    const form = document.querySelector('#login-form');
    const popup = document.querySelector('#popup');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = form.querySelector('#username').value.trim();
      const password = form.querySelector('#password').value.trim();

      const { data, error } = await supabase
        .from('data_pengguna') 
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        showPopup('Username atau kata sandi salah', 'error');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('lastActivity', new Date().getTime());

      showPopup('Login berhasil!', 'success');

      setTimeout(() => {
        window.location.hash = '/';
      }, 1500);
    });

    function showPopup(message, type = 'error') {
  const popupOverlay = document.querySelector('#login-popup');
  const popupCard = popupOverlay.querySelector('.popup-card');
  const popupMessage = document.querySelector('#popup-message');
  const closeBtn = popupOverlay.querySelector('.close-btn');

  const icon = type === 'success' ? '✅' : '⚠️';
  popupMessage.innerHTML = `<span class="popup-icon">${icon}</span> ${message}`;

  popupCard.className = 'popup-card'; // Reset class
  popupCard.classList.add(type === 'success' ? 'popup-success' : 'popup-error');
  popupOverlay.classList.add('show');

  // Klik tombol close
  closeBtn.addEventListener('click', () => popupOverlay.classList.remove('show'));
  // Klik luar modal
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) popupOverlay.classList.remove('show');
  });

    }
  },
};

export default Login;
