import 'regenerator-runtime';
import '../public/styles/style.css';
import App from './views/app';
import swRegister from './utils/sw-register';
 
const app = new App({
  drawer: document.querySelector('#navigationDrawer'),
  content: document.querySelector('#mainContent'),
});
 
window.addEventListener('hashchange', () => {
  app.renderPage();
});
 
window.addEventListener('load', () => {
  app.renderPage();
  swRegister();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}