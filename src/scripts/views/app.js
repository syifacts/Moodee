import UrlParser from '../routes/url-parser';
import routes from '../routes/routes';

function showSessionPopup() {
  const modal = document.getElementById('session-modal');
  const okButton = document.getElementById('session-ok');

  if (modal && okButton) {
    modal.classList.remove('hidden');

    okButton.onclick = () => {
      modal.classList.add('hidden');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivity');
      window.location.hash = '/login';
    };
  } else {
    // fallback jika modal tidak ditemukan
    alert('Sesi Anda telah habis. Silakan login kembali.');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    window.location.hash = '/login';
  }
}

function checkSessionTimeout() {
  const lastActivity = parseInt(localStorage.getItem('lastActivity'), 10);
  const now = new Date().getTime();
  const sessionDuration = 15 * 60 * 1000;

  if (!lastActivity || now - lastActivity > sessionDuration) {
    showSessionPopup();
  }
}

function resetSessionTimer() {
  localStorage.setItem('lastActivity', new Date().getTime());
}


class App {
  constructor({ content }) {
    this._content = content;
    this._initialAppShell();
  }

  _initialAppShell() {
    window.addEventListener('hashchange', () => this.renderPage());
    window.addEventListener('load', () => this.renderPage());
  }

  _isLoggedIn() {
    return localStorage.getItem('user') !== null;
  }

  _redirectToLogin() {
    window.location.hash = '/login'; // ✅ gunakan hash, bukan href
  }

  _updateNavigation(currentUrl = '') {
    const navLinks = document.querySelectorAll('.app-bar__nav a');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${currentUrl}` || (currentUrl === '/' && href === '#/')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  async renderPage() {
    const komentarPage = document.querySelector('#komentar-page');
if (komentarPage) komentarPage.remove();
    const url = UrlParser.parseActiveUrlWithCombiner();
    const page = routes[url] || routes['/404'];

    const protectedRoutes = ['/account', '/tracking', '/journaling', '/komentar{id}'];
    if (protectedRoutes.includes(url) && !this._isLoggedIn()) {
      this._redirectToLogin();
      return;
    }

    const { id } = UrlParser.parseActiveUrlWithoutCombiner();
     this._content.innerHTML = '';
this._content.innerHTML = await page.render(id);
await page.afterRender(id);

    checkSessionTimeout();

// Perbarui waktu jika ada aktivitas
window.addEventListener('mousemove', resetSessionTimer);
window.addEventListener('keydown', resetSessionTimer);
window.addEventListener('click', resetSessionTimer);

// Cek session setiap 1 menit
if (!this._sessionInterval) {
  this._sessionInterval = setInterval(checkSessionTimeout, 60 * 1000);
}


    this._updateNavigation(url);
  }
}

export default App;
