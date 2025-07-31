import { supabase } from '../../config/supabaseClient.js';

let isRendering = false;

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

const Komentar = {
  async show(postId, currentUser) {
    if (isRendering) return;
    isRendering = true;

    const app = document.getElementById('app');
    if (!app) { isRendering = false; return; }

    app.innerHTML = '';

    const oldContainer = document.querySelector('#komentar-page');
    if (oldContainer) oldContainer.remove();

    const commentContainer = document.createElement('div');
    commentContainer.classList.add('komentar-page');
    commentContainer.id = 'komentar-page';

    const { data: post, error: postError } = await supabase
      .from('journal')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      commentContainer.innerHTML = `<p class="error">Gagal memuat postingan.</p>`;
      app.appendChild(commentContainer);
      isRendering = false;
      return;
    }

    const { data: comments, error: commentError } = await supabase
      .from('comments')
      .select(`
        id, content, created_at, user_id, username,
        data_pengguna (username)
      `)
      .eq('journal_id', postId)
      .order('created_at', { ascending: true });

    const backButton = document.createElement('button');
    backButton.textContent = '← Kembali';
    backButton.classList.add('back-button');
    backButton.addEventListener('click', () => {
      app.innerHTML = '';
      window.location.href = '#/journaling';
    });

    const totalKomentar = comments?.length || 0;

    const { data: existingLikes } = await supabase
      .from('journal_likes')
      .select('*')
      .eq('journal_id', postId)
      .eq('user_id', currentUser.id)
      .limit(1);

    const isLiked = (existingLikes || []).length > 0;

    const { data: allLikes } = await supabase
      .from('journal_likes')
      .select('id')
      .eq('journal_id', postId);

    const totalLikes = allLikes?.length || 0;
    const emoji = getMoodEmoji(post.mood);

    const tanggalWIB = new Date(new Date(post.created_at).getTime() + 7 * 60 * 60 * 1000);
    const postElement = document.createElement('div');
    postElement.classList.add('post-detail');
    postElement.innerHTML = `
      <div class="post-header">
        <div class="post-user">
          <div class="user-icon-journal"><i class="fas fa-user-circle"></i></div>
          <div class="user-info-journal">
            <strong>${post.username}</strong>
            <span>${tanggalWIB.toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
        <div class="mood-badge ${post.mood?.toLowerCase() || 'neutral'}">${emoji} ${post.mood || ''}</div>
      </div>
      <p>${post.content}</p>
<div class="post-interactions">
  <button id="like-button" class="icon-text like-button ${isLiked ? 'liked' : ''}">
    <img src="${isLiked ? '/icons/favorite.png' : '/icons/like.png'}" alt="like icon">
    <span>${totalLikes}</span>
  </button>

  <div class="icon-text comment-button">
    <img src="/icons/comment.png" alt="comment icon">
    <span>${totalKomentar}</span>
  </div>
</div>

    `;

    const likeButton = postElement.querySelector('#like-button');
   likeButton.addEventListener('click', async () => {
  if (likeButton.disabled) return;
  likeButton.disabled = true;

  const { data: likeCheck } = await supabase
    .from('journal_likes')
    .select('*')
    .eq('journal_id', postId)
    .eq('user_id', currentUser.id)
    .limit(1);

  const alreadyLiked = (likeCheck || []).length > 0;

  const { data: postData } = await supabase
    .from('journal')
    .select('likes')
    .eq('id', postId)
    .single();

  let newLikes = postData?.likes || 0;

  if (alreadyLiked) {
    const { error } = await supabase
      .from('journal_likes')
      .delete()
      .eq('journal_id', postId)
      .eq('user_id', currentUser.id);

    if (!error) newLikes = Math.max(0, newLikes - 1);
  } else {
    const { error } = await supabase
      .from('journal_likes')
      .insert([{ journal_id: postId, user_id: currentUser.id }]);

    if (!error) newLikes += 1;
  }

  await supabase
    .from('journal')
    .update({ likes: newLikes })
    .eq('id', postId);

  // DOM Update langsung (tanpa refresh)
  const icon = likeButton.querySelector('img');
  const countSpan = likeButton.querySelector('span');
  if (alreadyLiked) {
    icon.src = '/icons/like.png';
    likeButton.classList.remove('liked');
  } else {
    icon.src = '/icons/favorite.png';
    likeButton.classList.add('liked');
  }
  countSpan.textContent = newLikes;
  likeButton.disabled = false;
});


    const commentList = document.createElement('div');
    commentList.classList.add('comment-list');

    if (commentError) {
      commentList.innerHTML = `<p class="error">Gagal memuat komentar.</p>`;
    } else if (comments.length === 0) {
      commentList.innerHTML = `<p>Belum ada komentar.</p>`;
    } else {
      comments.forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.classList.add('comment-item');
        const isOwner = comment.user_id === currentUser?.id;

        commentItem.innerHTML = `
          <div class="comment-user">
            <div class="user-icon-journal"><i class="fas fa-user-circle"></i></div>
            <div class="user-info-journal">
              <strong>${comment.username || comment.data_pengguna?.username || 'Pengguna'}</strong>
              <span>${new Date(new Date(comment.created_at).getTime() + 7 * 60 * 60 * 1000)
                .toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
            </div>
          </div>
          <p>${comment.content}</p>
          ${isOwner ? '<button class="delete-comment">Hapus</button>' : ''}
        `;

        if (isOwner) {
          const deleteBtn = commentItem.querySelector('.delete-comment');
          deleteBtn.addEventListener('click', async () => {
            deleteBtn.disabled = true;
            const { error } = await supabase
              .from('comments')
              .delete()
              .eq('id', comment.id)
              .eq('user_id', currentUser.id);

            if (error) {
              alert('Gagal menghapus komentar.');
              deleteBtn.disabled = false;
            } else {
              await this.show(postId, currentUser);
            }
          });
        }

        commentList.appendChild(commentItem);
      });
    }

    const form = document.createElement('form');
    form.classList.add('comment-form');
    form.innerHTML = `
      <h3>Tulis Komentar</h3>
      <textarea id="content" rows="4" placeholder="Tulis komentarmu di sini..." required></textarea>
      <div class="anon-checkbox">
        <input type="checkbox" id="is_anon" name="is_anon">
        <label for="is_anon">Komentar sebagai Anonim</label>
      </div>
      <button type="submit">Kirim</button>
    `;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      const content = form.querySelector('#content').value.trim();
      const isAnonymous = form.querySelector('#is_anon').checked;

      if (!content) {
        submitBtn.disabled = false;
        return;
      }

      const { error } = await supabase
        .from('comments')
        .insert([{
          journal_id: parseInt(postId),
          user_id: parseInt(currentUser.id),
          username: isAnonymous ? 'anonim' : currentUser.username,
          content
        }]);

      if (!error) {
        form.reset();
        // DOM update manual
const newComment = document.createElement('div');
newComment.classList.add('comment-item');
newComment.innerHTML = `
  <div class="comment-user">
    <div class="user-icon-journal"><i class="fas fa-user-circle"></i></div>
    <div class="user-info-journal">
      <strong>${isAnonymous ? 'anonim' : currentUser.username}</strong>
      <span>${new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</span>
    </div>
  </div>
  <p>${content}</p>
  <button class="delete-comment">Hapus</button>
`;

const deleteBtn = newComment.querySelector('.delete-comment');
deleteBtn.addEventListener('click', async () => {
  deleteBtn.disabled = true;
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('journal_id', postId)
    .eq('user_id', currentUser.id)
    .eq('content', content);

  if (!error) newComment.remove();
  else alert('Gagal menghapus komentar.');
});

commentList.prepend(newComment);

// Update jumlah komentar
const commentCounter = postElement.querySelector('.comment-button span');
commentCounter.textContent = parseInt(commentCounter.textContent) + 1;

        await this.show(postId, currentUser);
      } else {
        console.error('Gagal menambahkan komentar:', error);
      }

      submitBtn.disabled = false;
    });

    commentContainer.appendChild(postElement);
    commentContainer.appendChild(commentList);
    commentContainer.appendChild(form);
    commentContainer.appendChild(backButton);

    app.appendChild(commentContainer);
    isRendering = false;
  },

  async render(id) {
    if (!id) {
      document.getElementById('app').innerHTML = '<p>Halaman komentar tidak ditemukan.</p>';
      return '';
    }

    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    await this.show(id, currentUser);
    return '';
  },

  async afterRender() {}
};

export default Komentar;
