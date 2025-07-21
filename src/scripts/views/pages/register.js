import { supabase } from '../../config/supabaseClient.js';

const Register = {
  async render() {
    return `
      <section class="register-section">
        <h2>Daftar Akun Baru</h2>
        <form id="register-form">
          <label for="name">Nama</label>
          <input type="text" id="name" required>

          <label for="username">Username</label>
          <input type="text" id="username" required>

          <label for="password">Password</label>
          <input type="password" id="password" required>

          <button type="submit">Daftar</button>
        </form>
        <p id="register-message"></p>
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

  // Cek apakah username sudah ada
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

  // Simpan user langsung ke tabel (tanpa Supabase Auth)
  const { data, error: insertError } = await supabase
    .from('data_pengguna')
    .insert([{ name, username, password }]);

  if (insertError) {
    messageElement.textContent = 'Gagal menyimpan data pengguna: ' + insertError.message;
    messageElement.style.color = 'red';
    return;
  }

  messageElement.textContent = 'Registrasi berhasil! Silakan login.';
  messageElement.style.color = 'green';

  setTimeout(() => {
    window.location.hash = '/login';
  }, 1500);
});

  },
};

export default Register;
