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
          <p id="register-message" class="register-message"></p>
          </div>
        </div>

      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector('#register-form');
    const messageElement = document.querySelector('#register-message');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.querySelector('#name').value.trim();
      const username = form.querySelector('#username').value.trim();
      const password = form.querySelector('#password').value.trim();

      const { data: existingUser, error: checkError } = await supabase
        .from('data_pengguna')
        .select('username')
        .eq('username', username)
        .maybeSingle();
    
      if (existingUser) {
        messageElement.textContent = 'Registrasi gagal: Username sudah digunakan.';
        messageElement.style.color = 'red';
        return;
      }

      if (checkError) {
        messageElement.textContent = 'Terjadi kesalahan saat memeriksa username.';
        messageElement.style.color = 'red';
        return;
      }
    
      const { error: insertError } = await supabase
        .from('data_pengguna')
        .insert([{ name, username, password }]);

      if (insertError) {
        messageElement.textContent = 'Registrasi gagal, silakan coba lagi.';
        messageElement.style.color = 'red';
      } else {
        messageElement.textContent = 'Registrasi berhasil! Silakan login.';
        messageElement.style.color = 'green';
        setTimeout(() => {
          window.location.hash = '/login';
        }, 1500);
      }
    });
  },
};

export default Register;
