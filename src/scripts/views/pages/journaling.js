import { supabase } from '../../config/supabaseClient.js';

const Journaling = {
  async render() {
    return `
      <section class="hero">
        <div class="hero-content">
          <img src="icons/header_journ.png" />
        </div>
      </section>
      
      <section class="sectionjourn">
        <button class="tab-button active" data-tab="trending">Trending</button>
        <button class="tab-button" data-tab="mine">Postingan Saya</button>
      </section>

      <div id="posts-container"></div>

      <button class="btn-add">
        <img src="/icons/add.png" alt="Add Icon" />
      </button>
      <div id="journal-modal" class="modal hidden">
  <div class="modal-content">
    <h3>Tulis Jurnal Baru</h3>
    <form id="journal-form">
      <label>
        Posting ke:
        <select name="visibility">
          <option value="false">Public</option>
          <option value="true">Private</option>
        </select>
      </label>
      <label>
        Mood:
        <select name="mood">
          <option value="Happy">Happy</option>
          <option value="Good">Good</option>
          <option value="Bad">Bad</option>
          <option value="Sad">Sad</option>
          <option value="Angry">Angry</option>
        </select>
      </label>
      <textarea name="content" placeholder="Apa yang kamu rasakan sekarang?" required></textarea>
      <label class="anon-checkbox">
        <input type="checkbox" name="is_anon"> Kirim secara anonim
      </label>
     <div class="button-group">
  <button type="submit" class="modal-button">Kirim</button>
  <button type="button" id="close-modal" class="modal-button">Batal</button>
</div>


    </form>
  </div>
</div>

    `;
  },

  async afterRender() {
    const storedUser = localStorage.getItem('user');
if (!storedUser) {
  alert('Kamu belum login!');
  return;
}

const currentUser = JSON.parse(storedUser);



    const container = document.getElementById('posts-container');
    const tabButtons = document.querySelectorAll('.tab-button');

const fetchTrendingPosts = async () => {
  const { data, error } = await supabase
    .from('journal')
    .select('*')
    .eq('is_private', false) // hanya yang public
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching trending posts:', error);
  }

  return data || [];
};


const fetchMyPosts = async () => {
  if (!currentUser?.id) return [];

  const { data, error } = await supabase
    .from('journal')
    .select('*')
    .eq('user_id', currentUser.id)  // GANTI INI: gunakan user_id, BUKAN uuid
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching my posts:', error);
  }

  return data || [];
};

console.log('Trending Posts:', await fetchTrendingPosts());
console.log('My Posts:', await fetchMyPosts());


    const renderPosts = (posts) => {
      if (posts.length === 0) {
        container.innerHTML = `<p style="text-align:center;">Belum ada postingan.</p>`;
        return;
      }

      container.innerHTML = posts.map(post => `
        <div class="postingan">
          <div class="postingan-header">
            <div class="user-info">
              <div class="avatar"></div>
              <div>
                <span class="username">${post.username}</span>
                <span class="date">${new Date(post.created_at).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
            <span class="badge">${post.mood || 'Neutral'}</span>
${post.is_private ? '<span class="badge private">Private</span>' : ''}

          </div>
          <div class="postingan-content">
            ${post.content || '(tidak ada konten)'}
          </div>
          <div class="postingan-footer">
            <div class="icon-text">❤️ <span>${post.likes || 0}</span></div>
            <div class="icon-text">💬 <span>${post.comment_count || 0}</span></div>
          </div>
        </div>
      `).join('');
    };

    // Event listener tab
    tabButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.tab === 'trending') {
          const posts = await fetchTrendingPosts();
          renderPosts(posts);
        } else {
          const posts = await fetchMyPosts();
          renderPosts(posts);
        }
      });
    });

    // Load default tab: Trending
    const trending = await fetchTrendingPosts();
    renderPosts(trending);
    const addBtn = document.querySelector('.btn-add');
const modal = document.getElementById('journal-modal');
const closeModal = document.getElementById('close-modal');
const form = document.getElementById('journal-form');

addBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  // Ambil status anonim dari checkbox
  const isAnonymous = formData.get('is_anon') === 'on';

  // Data yang dikirim ke Supabase
  const newJournal = {
    is_private: formData.get('visibility') === 'true',
    mood: formData.get('mood'),
    content: formData.get('content'),
   user_id: currentUser?.id || null, // selalu isi user_id
username: isAnonymous ? 'anonim' : currentUser?.username || 'Unknown',

    uuid: currentUser?.uuid || null, // UUID Supabase user
    likes: 0,
    comment_count: 0,
    created_at: new Date().toISOString(),

  };

  const { error } = await supabase.from('journal').insert([newJournal]);

  if (error) {
    console.error(error);
    alert('Gagal menambahkan jurnal.');
  } else {
    modal.classList.add('hidden');
    form.reset();

    const updatedPosts = document.querySelector('.tab-button.active')?.dataset.tab === 'mine'
      ? await fetchMyPosts()
      : await fetchTrendingPosts();
    renderPosts(updatedPosts);
  }
});
console.log('currentUser:', currentUser);


  }
};

export default Journaling;
