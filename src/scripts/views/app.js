import UrlParser from '../routes/url-parser';
import routes from '../routes/routes';

function checkSessionTimeout() {
  const lastActivity = parseInt(localStorage.getItem('lastActivity'), 10);
  const now = new Date().getTime();
  const sessionDuration = 15 * 60 * 1000; // 15 menit

  if (!lastActivity || now - lastActivity > sessionDuration) {
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    alert('Sesi Anda telah habis. Silakan login kembali.');
    window.location.hash = '/login';
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
    const url = UrlParser.parseActiveUrlWithCombiner();
    const page = routes[url] || routes['/404'];

    const protectedRoutes = ['/account', '/tracking', '/journaling'];
    if (protectedRoutes.includes(url) && !this._isLoggedIn()) {
      this._redirectToLogin();
      return;
    }

    this._content.innerHTML = await page.render();
    await page.afterRender();
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
