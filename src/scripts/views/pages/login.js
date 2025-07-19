import { supabase } from '../../config/supabaseClient';

const Login = {
  async render() {
    return `
      <section class="login-page">
        <img src="icons/login2.png" alt="Character" class="left-illustration" />

        <div class="login-card">
          <h2>Welcome back to Moodee!</h2>
          <p>Please enter your  details</p>

          <form id="login-form" class="login-form">
            <label for="username">Username</label>
            <input type="text" id="username" placeholder="Enter your username" required />

            <label for="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" required />

            <button type="submit">Login</button>

            <div class="signup-link">
              You don’t have account?
              <a href="#/register">Sign Up</a>
            </div>
          </form>

          <p id="login-message" class="login-message"></p>
        </div>

        <img src="icons/login1.png" alt="Emoji Mood" class="right-background" />
      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector('#login-form');
    const messageElement = document.querySelector('#login-message');

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
        messageElement.textContent = 'Username atau kata sandi salah';
        messageElement.style.color = 'red';
        return;
      }

      localStorage.setItem('user', JSON.stringify(data));

      messageElement.textContent = 'Login berhasil! Mengalihkan...';
      messageElement.style.color = 'green';

      setTimeout(() => {
        window.location.hash = '/';
      }, 1000);
    });
  },
};

export default Login;
