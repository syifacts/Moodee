import { supabase } from '../../config/supabaseClient.js';
import Komentar from './komentar.js';


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
<div id="edit-modal" class="modal hidden">
  <div class="modal-content">
    <h3>Edit Jurnal</h3>
    <form id="edit-form">
      <label>
        Ubah ke:
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
      <textarea name="content" required></textarea>
      <div class="button-group">
        <button type="submit">Simpan</button>
        <button type="button" id="close-edit-modal">Batal</button>
      </div>
    </form>
  </div>
</div>
<div id="delete-modal" class="modal hidden">
  <div class="modal-content">
    <p>Apakah kamu yakin ingin menghapus jurnal ini?</p>
    <div class="modal-actions">
      <button id="cancel-delete">Batal</button>
      <button id="confirm-delete">Hapus</button>
    </div>
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
              <span class="date">${
  new Date(new Date(post.created_at).getTime() + 7 * 60 * 60 * 1000)
    .toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
}</span>

            </div>
          </div>
          <div class="badge-wrapper">
            <span class="badge mood-badge ${moodClass}">${emoji} ${post.mood || 'Neutral'}</span>
          </div>
        </div>

        <div class="postingan-content">${post.content || '(tidak ada konten)'}</div>
        <div class="postingan-footer">
          <button type="button" class="icon-text like-button ${likeClass}" data-id="${post.id}">
            <img src="${likeIcon}" alt="Like Icon" style="vertical-align: middle;" />
            <span>${post.likes || 0}</span>
          </button>
          <button type="button" class="icon-text comment-button">
  <img src="/icons/comment.png" alt="Comment Icon" style="vertical-align: middle;" />
  <span>${post.comment_count || 0}</span>
</button>

        </div>

        ${activeTab === 'mine' ? `
  <div class="post-actions">
    <button class="edit-post-btn" data-id="${post.id}">Edit</button>
    <button class="delete-post-btn" data-id="${post.id}">Delete</button>
  </div>
` : ''}

      </div>
    `;
  }).join('');
};
let postIdToDelete = null;

const showDeleteModal = (postId) => {
  postIdToDelete = postId;
  document.getElementById('delete-modal').classList.remove('hidden');
};

const hideDeleteModal = () => {
  postIdToDelete = null;
  document.getElementById('delete-modal').classList.add('hidden');
};

const attachDeleteListeners = () => {
  const deleteButtons = document.querySelectorAll('.delete-post-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const postId = button.dataset.id;
      showDeleteModal(postId);
    });
  });
};

// Event listener untuk tombol di modal
document.getElementById('cancel-delete').addEventListener('click', () => {
  hideDeleteModal();
});

document.getElementById('confirm-delete').addEventListener('click', async () => {
  if (!postIdToDelete) return;

  const { error } = await supabase
    .from('journal')
    .delete()
    .eq('id', postIdToDelete);

  if (error) {
    alert('Gagal menghapus jurnal.');
    console.error(error);
    return;
  }

  hideDeleteModal();

  // Refresh postingan
  const posts = await fetchMyPosts();
  renderPosts(posts);
  attachEditListeners();
  attachDeleteListeners();
  addLikeListeners();
  attachCommentListeners();
});


// Buka modal edit saat tombol "Edit" diklik
const attachEditListeners = () => {
  const editButtons = document.querySelectorAll('.edit-post-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const postId = button.dataset.id;
      currentEditId = postId;

      const { data: postData, error } = await supabase
        .from('journal')
        .select('*')
        .eq('id', postId)
        .single();

      if (error || !postData) {
        alert('Gagal mengambil data jurnal');
        return;
      }

      // Isi form edit
      editForm.elements['visibility'].value = postData.is_private ? 'true' : 'false';

      editForm.elements['mood'].value = postData.mood;
      editForm.elements['content'].value = postData.content;

      editModal.classList.remove('hidden');
    });
  });
};
const attachCommentListeners = () => {
  const commentButtons = document.querySelectorAll('.comment-button');
  commentButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const postId = btn.closest('.postingan')?.dataset.id;
      if (!postId) return;
       window.location.hash = `/komentar/${postId}`;

      // Navigasi ke route komentar, bisa dengan fungsi show pada Komentar
      await Komentar.show(postId, currentUser);
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
  .limit(1);  // ganti maybeSingle()

if (checkError) {
  console.error('Gagal cek like:', checkError);
  isProcessing = false;
  return;
}

const alreadyLiked = existingLikes.length > 0;


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
    isProcessing = false;
    return;
  } else {
    console.error('Gagal menyimpan like:', insertError);
    isProcessing = false;
    return;
  }
}
else {
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
        if (btn.dataset.tab === 'mine') 
        addLikeListeners();
       attachEditListeners();
        attachCommentListeners();
         attachDeleteListeners();
      });
    });

    // Initial load (Trending)
    renderPosts(await fetchTrendingPosts());
     attachEditListeners();
      attachDeleteListeners();
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
      if (tab === 'mine') 
      addLikeListeners();
     attachEditListeners();
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

closeCommentModal.addEventListener('click', () => {
  document.getElementById('comment-modal').classList.add('hidden');
});
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const closeEditModal = document.getElementById('close-edit-modal');
let currentEditId = null;



editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(editForm);

  const updates = {
    is_private: formData.get('visibility') === 'true',
    mood: formData.get('mood'),
    content: formData.get('content'),
  };

  const { error } = await supabase
    .from('journal')
    .update(updates)
    .eq('id', currentEditId);

  if (error) {
    alert('Gagal menyimpan perubahan');
    return;
  }

  editModal.classList.add('hidden');
  currentEditId = null;

  const posts = await fetchMyPosts();
  renderPosts(posts);
  attachEditListeners();
  addLikeListeners();
  attachCommentListeners();
});

closeEditModal.addEventListener('click', () => {
  editModal.classList.add('hidden');
});

  }
  

  }


export default Journaling;
