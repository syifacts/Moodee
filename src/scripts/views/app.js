import UrlParser from '../routes/url-parser';
import routes from '../routes/routes';

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

    this._updateNavigation(url);
  }
}

export default App;
