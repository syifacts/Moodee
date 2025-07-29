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
        <div id="comment-modal" class="modal hidden">
  <div class="modal-content">
    <h3>Komentar</h3>
    <div id="comment-list"></div>
    <form id="comment-form">
      <textarea name="content" placeholder="Tulis komentarmu..." required></textarea>
      <label>
        <input type="checkbox" name="is_anon"> Kirim secara anonim
      </label>
      <div class="button-group">
        <button type="submit">Kirim</button>
        <button type="button" id="close-comment-modal">Tutup</button>
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
    const addBtn = document.querySelector('.btn-add');
    const modal = document.getElementById('journal-modal');
    const closeModal = document.getElementById('close-modal');
    const form = document.getElementById('journal-form');

    const fetchTrendingPosts = async () => {
      const { data, error } = await supabase
        .from('journal')
        .select(`
    *,
    journal_likes(user_id)
  `)
        .eq('is_private', false)
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
        .select(`
    *,
    journal_likes(user_id)
  `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my posts:', error);
      }

      return data || [];
    };

    function getMoodEmoji(mood) {
      switch (mood?.toLowerCase()) {
        case 'happy': return '😄';
        case 'good': return '😊';
        case 'bad': return '😕';
        case 'sad': return '😢';
        case 'angry': return '😠';
        default: return '🙂';
      }
    }
const renderPosts = (posts) => {
  const activeTab = document.querySelector('.tab-button.active')?.dataset.tab;

  if (posts.length === 0) {
    container.innerHTML = `<p style="text-align:center;">Belum ada postingan.</p>`;
    return;
  }

  container.innerHTML = posts.map(post => {
    const moodClass = post.mood?.toLowerCase() || 'neutral';
    const emoji = getMoodEmoji(post.mood);
    const isLiked = post.journal_likes?.some(like => like.user_id === currentUser.id);
    const likeIcon = isLiked ? '/icons/favorite.png' : '/icons/like.png';
    const likeClass = isLiked ? 'liked' : '';

    return `
      <div class="postingan" data-id="${post.id}">
        <div class="postingan-header">
          <div class="user-info">
            <div class="avatar"></div>
            <div>
              <div class="name-row">
                <span class="username">${post.username}</span>
                ${post.is_private ? '<span class="badge private">Private</span>' : ''}
              </div>
              <span class="date">${new Date(post.created_at).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}</span>
            </div>
          </div>
          <div class="badge-wrapper">
            <span class="badge mood-badge ${moodClass}">${emoji} ${post.mood || 'Neutral'}</span>
          </div>
        </div>

        <div class="postingan-content">${post.content || '(tidak ada konten)'}</div>
        <div class="postingan-footer">
          <button type="button" class="icon-text like-button ${likeClass}" data-id="${post.id}">
            <img src="${likeIcon}" alt="Like Icon" style="width: 20px; vertical-align: middle;" />
            <span>${post.likes || 0}</span>
          </button>
          <button type="button" class="icon-text comment-button">
  <img src="/icons/comment.png" alt="Comment Icon" style="width: 20px; vertical-align: middle;" />
  <span>${post.comment_count || 0}</span>
</button>

        </div>

        ${activeTab === 'mine' ? `
          <div class="post-actions">
            <button class="toggle-privacy-btn" data-id="${post.id}" data-private="${post.is_private}">
              ${post.is_private ? 'Ubah ke Public' : 'Ubah ke Private'}
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
};
const attachCommentListeners = () => {
  const commentButtons = document.querySelectorAll('.comment-button');
  commentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const postId = btn.closest('.postingan')?.dataset.id;
      openCommentModal(postId);
    });
  });
};



const addLikeListeners = () => {
  const likeButtons = document.querySelectorAll('.like-button');

  likeButtons.forEach(button => {
    let isProcessing = false;

    button.addEventListener('click', async () => {
      if (isProcessing) return;
      isProcessing = true;

      const postId = button.dataset.id;
      const img = button.querySelector('img');
      const likeCountSpan = button.querySelector('span');

      // Cek apakah user sudah like
      const { data: existingLikes, error: checkError } = await supabase
        .from('journal_likes')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('journal_id', postId)
        .maybeSingle();

      if (checkError) {
        console.error('Gagal cek like:', checkError);
        isProcessing = false;
        return;
      }

      const alreadyLiked = !!existingLikes;

      // Ambil jumlah like saat ini
      const { data: postData, error: fetchError } = await supabase
        .from('journal')
        .select('likes')
        .eq('id', postId)
        .single();

      if (fetchError || !postData) {
        console.error('Gagal ambil data post:', fetchError);
        isProcessing = false;
        return;
      }

      let newLikes = postData.likes || 0;

      if (alreadyLiked) {
        // UNLIKE
        const { error: deleteError } = await supabase
          .from('journal_likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('journal_id', postId);

        if (deleteError) {
          console.error('Gagal menghapus like:', deleteError);
          isProcessing = false;
          return;
        }

        newLikes = Math.max(0, newLikes - 1);
        button.classList.remove('liked');
        if (img) img.src = '/icons/like.png';
      } else {
        // LIKE
        const { error: insertError } = await supabase
          .from('journal_likes')
          .insert([{ user_id: currentUser.id, journal_id: postId }]);

        if (insertError) {
          if (insertError.code === '23505') {
            console.warn('Like sudah ada.');
          } else {
            console.error('Gagal menyimpan like:', insertError);
            isProcessing = false;
            return;
          }
        } else {
          newLikes += 1;
          button.classList.add('liked');
          if (img) img.src = '/icons/favorite.png';
        }
      }

      // Update jumlah like di database
      const { error: updateError } = await supabase
        .from('journal')
        .update({ likes: newLikes })
        .eq('id', postId);

      if (updateError) {
        console.error('Gagal update jumlah like:', updateError);
      }

      // Update jumlah like di tampilan
      if (likeCountSpan) {
        likeCountSpan.textContent = newLikes;
      }

      setTimeout(() => {
        isProcessing = false;
      }, 300); // debounce 300ms
    });
  });
};


    const addToggleListeners = () => {
  setTimeout(() => {
    const toggleButtons = document.querySelectorAll('.toggle-privacy-btn');

    toggleButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const postId = button.dataset.id;
        const currentPrivacy = button.dataset.private === 'true';

        const { error } = await supabase
          .from('journal')
          .update({ is_private: !currentPrivacy })
          .eq('id', postId);

        if (error) {
          console.error('Gagal mengubah status privasi:', error);
          alert('Gagal mengubah privasi jurnal.');
          return;
        }

        const posts = await fetchMyPosts();
        renderPosts(posts);
        // Reattach event listeners
        addToggleListeners(); // ini penting!
        addLikeListeners();
        attachCommentListeners();
      });
    });
  }, 0); // biarkan DOM selesai render
};


    // Tab switching
    tabButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const posts = btn.dataset.tab === 'trending'
          ? await fetchTrendingPosts()
          : await fetchMyPosts();

        renderPosts(posts);
        if (btn.dataset.tab === 'mine') addToggleListeners();
        addLikeListeners();
        attachCommentListeners();
      });
    });

    // Initial load (Trending)
    renderPosts(await fetchTrendingPosts());
    addLikeListeners();
attachCommentListeners();
    // Modal handling
    addBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeModal.addEventListener('click', () => modal.classList.add('hidden'));

    // Submit form
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const isAnonymous = formData.get('is_anon') === 'on';

      const newJournal = {
        is_private: formData.get('visibility') === 'true',
        mood: formData.get('mood'),
        content: formData.get('content'),
        user_id: currentUser?.id || null,
        username: isAnonymous ? 'anonim' : currentUser?.username || 'Unknown',
        likes: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('journal').insert([newJournal]);

      if (error) {
        console.error(error);
        alert('Gagal menambahkan jurnal.');
        return;
      }

      modal.classList.add('hidden');
      form.reset();

      const tab = document.querySelector('.tab-button.active')?.dataset.tab;
      const posts = tab === 'mine' ? await fetchMyPosts() : await fetchTrendingPosts();
      renderPosts(posts);
      if (tab === 'mine') addToggleListeners();
      addLikeListeners();
      attachCommentListeners();
    });
    const commentModal = document.getElementById('comment-modal');
const closeCommentModal = document.getElementById('close-comment-modal');
const commentList = document.getElementById('comment-list');
const commentForm = document.getElementById('comment-form');

let currentPostId = null;

const openCommentModal = async (postId) => {
  currentPostId = postId;
  commentModal.classList.remove('hidden');
  await loadComments(postId);
};

const loadComments = async (postId) => {
  const { data, error } = await supabase
    .from('journal_comments')
    .select('*')
    .eq('journal_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Gagal mengambil komentar:', error);
    commentList.innerHTML = `<p>Gagal memuat komentar.</p>`;
    return;
  }

  commentList.innerHTML = data.map(c => `
    <div class="comment-item">
      <strong>${c.username}</strong> <small>${new Date(c.created_at).toLocaleString('id-ID')}</small>
      <p>${c.content}</p>
    </div>
  `).join('');
};

// Handle form kirim komentar
commentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentPostId) return;

  const formData = new FormData(commentForm);
  const isAnon = formData.get('is_anon') === 'on';
  const content = formData.get('content');

  const { error } = await supabase.from('journal_comments').insert([{
    journal_id: currentPostId,
    username: isAnon ? 'anonim' : currentUser?.username || 'User',
    content,
    created_at: new Date().toISOString(),
  }]);

  if (error) {
    console.error('Gagal mengirim komentar:', error);
    alert('Gagal mengirim komentar.');
    return;
  }

  commentForm.reset();
  await loadComments(currentPostId);

  // Update jumlah komentar di UI dan DB
  const { data: post, error: postError } = await supabase
    .from('journal')
    .select('comment_count')
    .eq('id', currentPostId)
    .single();

  if (!postError) {
    await supabase
      .from('journal')
      .update({ comment_count: (post.comment_count || 0) + 1 })
      .eq('id', currentPostId);

    // Refresh post list (optional)
    const tab = document.querySelector('.tab-button.active')?.dataset.tab;
    const posts = tab === 'mine' ? await fetchMyPosts() : await fetchTrendingPosts();
    renderPosts(posts);
    if (tab === 'mine') addToggleListeners();
    addLikeListeners();
    attachCommentListeners(); // penting agar tombol komentar tetap aktif
  }
});

closeCommentModal.addEventListener('click', () => {
  commentModal.classList.add('hidden');
});

  }
};

export default Journaling;
