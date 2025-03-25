// Redirect to login if user is not authenticated
if (!localStorage.getItem('username')) {
  window.location.href = 'index.html';
}

// Load user data from localStorage
const username = localStorage.getItem('username') || 'Guest';
const profilePic = localStorage.getItem('profilePic');
const homeAvatar = document.getElementById('homeAvatar');
const profilePicInputHome = document.getElementById('profilePicInputHome');

const storedPic = localStorage.getItem('profilePic');
if (storedPic) {
  homeAvatar.textContent = '';
  homeAvatar.style.backgroundImage = `url(${storedPic})`;
}


document.querySelector('.username').textContent = username;
if (profilePic) {
  document.querySelector('.avatar').src = profilePic;
}

const postFeed = document.getElementById('post-feed');

// Load saved posts on page load
const savedPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
savedPosts.forEach((postData) => {
  const post = document.createElement('div');
  post.className = 'post';
  post.id = `post-${postData.id}`;
  post.innerHTML = `
    <div class="post-header">
      <div>
        <div class="post-username">${postData.username}</div>
        <div class="post-description">${postData.description}</div>
      </div>
      <div class="post-time">
        ${postData.time}
        ${postData.username === username ? '<button class="delete-btn" title="Delete Post">🗑️</button>' : ''}
      </div>
    </div>
    <div class="review-wrapper">
      <img class="post-image" src="${postData.imageUrl}" alt="Uploaded Image" />
    </div>
  `;
  postFeed.prepend(post); // ⬅️ Always prepend newest on top
});
const savedReviews = JSON.parse(localStorage.getItem('userReviews')) || [];

savedReviews.forEach((review) => {
  const postElement = document.getElementById(`post-${review.postId}`);
  if (!postElement) return;

  const wrapper = postElement.querySelector('.review-wrapper');
  const image = wrapper.querySelector('.post-image');

  const marker = document.createElement('div');
  marker.className = 'review-marker';
  marker.style.left = `${review.x}px`;
  marker.style.top = `${review.y}px`;
  marker.style.opacity = '0.5';

  const colorMap = {
    nice: '#aee9ae',
    maybe: '#fff4a8',
    well: '#ffc5c5'
  };
  marker.style.background = colorMap[review.rating] || '#ccc';
  const likeCountValue = review.likes || (review.likedBy ? review.likedBy.length : 0);
  const popup = document.createElement('div');
  popup.className = 'review-popup-hover';
  popup.style.opacity = '0.5';
  popup.style.background = colorMap[review.rating] || '#eee';
  popup.innerHTML = `
    <div class="popup-header">
      <span class="review-username">@${review.username}</span>
    </div>
    <div class="popup-text">${review.text}</div>
    <div class="popup-buttons">
      <button class="like-btn">Like <span class="like-count">${likeCountValue}</span></button>
      <button class="thank-btn">Thank You</button>
    </div>
  `;

  const likeBtn = popup.querySelector('.like-btn');
  const likeCount = popup.querySelector('.like-count');
  const thankBtn = popup.querySelector('.thank-btn');
  const postOwner = postElement.querySelector('.post-username')?.textContent;
  const hasThanked = review.thankedBy?.includes(username);

  // If user is post owner, enable thank you logic
  if (username === postOwner) {
    if (hasThanked) {
      thankBtn.disabled = true;
      thankBtn.style.opacity = '0.5';
      thankBtn.style.cursor = 'default';
      marker.style.outline = '2px solid white';
      popup.style.outline = '2px solid white';
    } else {
      thankBtn.addEventListener('click', () => {
        marker.style.outline = '2px solid white';
        popup.style.outline = '2px solid white';
        thankBtn.disabled = true;
        thankBtn.style.opacity = '0.5';
        thankBtn.style.cursor = 'default';

        const allReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        const target = allReviews.find(r =>
          r.postId == review.postId &&
          r.username == review.username &&
          r.text == review.text &&
          r.x == review.x &&
          r.y == review.y
        );
        if (target) {
          target.thankedBy = target.thankedBy || [];
          target.thankedBy.push(username);
          localStorage.setItem('userReviews', JSON.stringify(allReviews));
        }
      });
    }
  } else {
    // Disable for non-owners
    thankBtn.disabled = true;
    thankBtn.style.opacity = '0.5';
    thankBtn.style.cursor = 'default';
  }


  let liked = review.likedBy?.includes(username);
  if (liked) {
    likeBtn.disabled = true;
  }

  likeBtn.addEventListener('click', () => {
    if (!liked) {
      let count = parseInt(likeCount.textContent);
      count++;
      likeCount.textContent = count;
      liked = true;
      likeBtn.disabled = true;

      const allReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
      const target = allReviews.find(r =>
        r.postId == review.postId &&
        r.username == review.username &&
        r.text == review.text &&
        r.x == review.x &&
        r.y == review.y
      );
      if (target) {
        target.likes = count;
        target.likedBy = target.likedBy || [];
        target.likedBy.push(username);
        localStorage.setItem('userReviews', JSON.stringify(allReviews));
      }
    }
  });
  // Interactivity logic
  let isHoveringMarker = false;
  let isHoveringPopup = false;
  let isHoveringImage = false;

  const updateVisibility = () => {
    marker.style.display = isHoveringImage || isHoveringMarker ? 'block' : 'none';
    popup.style.display = isHoveringMarker || isHoveringPopup ? 'block' : 'none';
  };

  marker.addEventListener('mouseenter', () => {
    isHoveringMarker = true;
    updateVisibility();
  });
  marker.addEventListener('mouseleave', () => {
    isHoveringMarker = false;
    updateVisibility();
  });
  popup.addEventListener('mouseenter', () => {
    isHoveringPopup = true;
    updateVisibility();
  });
  popup.addEventListener('mouseleave', () => {
    isHoveringPopup = false;
    updateVisibility();
  });
  image.addEventListener('mouseenter', () => {
    isHoveringImage = true;
    updateVisibility();
  });
  image.addEventListener('mouseleave', () => {
    isHoveringImage = false;
    updateVisibility();
  });

  requestAnimationFrame(() => {
    const wrapperRect = wrapper.getBoundingClientRect();
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;

    let left = review.x + 16;
    let top = review.y - popupHeight / 2;

    if (left + popupWidth > wrapper.offsetWidth) left = wrapper.offsetWidth - popupWidth;
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (top + popupHeight > wrapper.offsetHeight) {
      top = wrapper.offsetHeight - popupHeight;
    }

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  });

  wrapper.appendChild(marker);
  wrapper.appendChild(popup);
});


// Globals for review state
let holdTimer = null;
let longPressX = 0;
let longPressY = 0;
let currentReviewTarget = null;
let currentReviewWrapper = null;
let selectedRating = null;

// Upload Elements
const fileUploadInput = document.getElementById('file-upload');
const modal = document.getElementById('preUploadModal');
const closeModalBtn = document.getElementById('closeModal');
const imagePreview = document.getElementById('imagePreview');
const descriptionInput = document.getElementById('descriptionInput');
const postButton = document.getElementById('postButton');

fileUploadInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  const reader = new FileReader();

  reader.onload = async () => {
    img.onload = () => {
      // Resize and compress
      const maxSize = 800;
      let { width, height } = img;

      // Scale down while keeping aspect ratio
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // Show preview in modal
      imagePreview.style.backgroundImage = `url(${compressedDataUrl})`;
      modal.style.display = 'flex';
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
});


closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  fileUploadInput.value = '';
  descriptionInput.value = '';
  imagePreview.style.backgroundImage = '';
});

postButton.addEventListener('click', () => {
  const description = descriptionInput.value.trim();
  const bg = imagePreview.style.backgroundImage;

  // ✅ Check more reliably if an image exists
  const hasImage = bg && bg.startsWith('url("data:image/');


  if (!hasImage) {
    alert('Please select an image before posting.');
    return;
  }

  const imageUrl = bg.slice(5, -2); // strip url("...") wrapper
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const postId = Date.now();

  const post = document.createElement('div');
  post.id = `post-${postId}`;
  post.className = 'post';

  post.innerHTML = `
    <div class="post-header">
      <div>
        <div class="post-username">${username}</div>
        <div class="post-description">${description}</div>
      </div>
      <div class="post-time">
        ${currentTime}
        <button class="delete-btn" title="Delete Post">🗑️</button>
      </div>
    </div>
    <div class="review-wrapper">
      <img class="post-image" src="${imageUrl}" alt="Uploaded Image" />
    </div>
  `;

  postFeed.prepend(post);

  const allPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
  allPosts.unshift({ id: postId, username, description, imageUrl, time: currentTime });
  try {
    localStorage.setItem('userPosts', JSON.stringify(allPosts));
  } catch (e) {
    console.warn('Storage full, skipping local save.');
  }

  // ✅ Reset modal cleanly after successful upload
  console.log("Trying to hide modal. Modal is:", modal);
  modal.style.display = 'none';
  fileUploadInput.value = '';
  descriptionInput.value = '';
  imagePreview.style.backgroundImage = 'none'; // <- reset it for next time
});

let zoomLevel = 1;
const updateMarkerVisibilityOnZoom = () => {
  const markers = document.querySelectorAll('.review-marker');
  if (zoomLevel > 1) {
    markers.forEach(marker => marker.style.visibility = 'hidden');
  } else {
    setTimeout(() => {
      markers.forEach(marker => marker.style.visibility = 'visible');
    }, 200);
  }
};

document.addEventListener('dblclick', (e) => {
  const img = e.target;
  if (!img.classList.contains('post-image')) return;

  const rect = img.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const originX = (x / rect.width) * 100;
  const originY = (y / rect.height) * 100;

  let currentScale = parseFloat(img.getAttribute('data-zoom')) || 1;
  currentScale = currentScale === 1 ? 2 : currentScale === 2 ? 4 : 1;

  zoomLevel = currentScale;
  updateMarkerVisibilityOnZoom();

  img.setAttribute('data-zoom', currentScale);
  img.style.transformOrigin = `${originX}% ${originY}%`;
  img.style.transform = `scale(${currentScale})`;
});

// === Review Feature ===
const reviewPopup = document.getElementById('reviewPopup');
const reviewContent = document.getElementById('reviewContent');
const ratingButtons = document.querySelectorAll('.rating-btn');
const critiqueInput = document.getElementById('critiqueInput');
const publishCritique = document.getElementById('publishCritique');

document.addEventListener('mousedown', (e) => {
  if (!e.target.classList.contains('post-image')) return;

  const img = e.target;
  const rect = img.getBoundingClientRect();

  longPressX = e.clientX - rect.left;
  longPressY = e.clientY - rect.top;

  currentReviewTarget = img;
  currentReviewWrapper = img.parentElement;

  holdTimer = setTimeout(() => {
    reviewPopup.style.display = 'flex';
  }, 500);
});

document.addEventListener('mouseup', () => {
  clearTimeout(holdTimer);
});

reviewPopup.addEventListener('click', (e) => {
  if (e.target === reviewPopup) {
    reviewPopup.style.display = 'none';
    reviewContent.style.background = '#f0f0f0';
    critiqueInput.value = '';
    critiqueInput.style.display = 'none';
    publishCritique.style.display = 'none';
    selectedRating = null;
  }
});

ratingButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectedRating = btn.getAttribute('data-rating');

    reviewContent.style.background =
      selectedRating === 'nice' ? '#d9f8d9' :
      selectedRating === 'maybe' ? '#fff9d6' :
      '#ffe0e0';

    critiqueInput.style.display = 'block';
  });
});

critiqueInput.addEventListener('input', () => {
  publishCritique.style.display = critiqueInput.value.trim() ? 'block' : 'none';
});

publishCritique.addEventListener('click', () => {
  if (!currentReviewTarget || !selectedRating) return;

  const reviewText = critiqueInput.value.trim();
  const postElement = currentReviewTarget.closest('.post');
  const postId = postElement?.id?.replace('post-', '');

  if (postId) {
    const userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
    const reviewId = Date.now(); // Unique ID for the review
    userReviews.push({
      postId,
      text: reviewText,
      rating: selectedRating,
      x: longPressX,
      y: longPressY,
      username: username,
      time: new Date().toLocaleString(),
      likes: 0,
      likedBy: [],
      thankedBy: []
    });



    localStorage.setItem('userReviews', JSON.stringify(userReviews));
  }


  const marker = document.createElement('div');
  marker.className = 'review-marker';
  marker.style.left = `${longPressX}px`;
  marker.style.top = `${longPressY}px`;
  marker.style.opacity = '0.5';

  const popup = document.createElement('div');
  popup.className = 'review-popup-hover';
  popup.style.opacity = '0.5';
  popup.innerHTML = `
    <div class="popup-header">
      <span class="review-username">@${username}</span>
    </div>
    <div class="popup-text">${reviewText}</div>
    <div class="popup-buttons">
      <button class="like-btn">Like <span class="like-count">0</span></button>
      <button class="thank-btn">Thank You</button>
    </div>
  `;


  const colorMap = {
    nice: '#aee9ae',
    maybe: '#fff4a8',
    well: '#ffc5c5'
  };
  marker.style.background = colorMap[selectedRating];
  popup.style.background = colorMap[selectedRating];

  let isHoveringMarker = false;
  let isHoveringPopup = false;
  let isHoveringImage = false;

  const updateVisibility = () => {
    marker.style.display = isHoveringImage || isHoveringMarker ? 'block' : 'none';
    popup.style.display = isHoveringMarker || isHoveringPopup ? 'block' : 'none';
  };

  marker.addEventListener('mouseenter', () => {
    isHoveringMarker = true;
    updateVisibility();
  });
  marker.addEventListener('mouseleave', () => {
    isHoveringMarker = false;
    updateVisibility();
  });
  popup.addEventListener('mouseenter', () => {
    isHoveringPopup = true;
    updateVisibility();
  });
  popup.addEventListener('mouseleave', () => {
    isHoveringPopup = false;
    updateVisibility();
  });
  currentReviewTarget.addEventListener('mouseenter', () => {
    isHoveringImage = true;
    updateVisibility();
  });
  currentReviewTarget.addEventListener('mouseleave', () => {
    isHoveringImage = false;
    updateVisibility();
  });

  requestAnimationFrame(() => {
    const wrapper = currentReviewWrapper;
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;

    let left = longPressX + 16;
    let top = longPressY - popupHeight / 2;

    if (left + popupWidth > wrapper.offsetWidth) {
      left = wrapper.offsetWidth - popupWidth;
    }
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (top + popupHeight > wrapper.offsetHeight) {
      top = wrapper.offsetHeight - popupHeight;
    }

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  });

  const likeBtn = popup.querySelector('.like-btn');
  const likeCount = popup.querySelector('.like-count');
  let liked = false;
  const allReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
  const target = allReviews.find(r =>
    r.postId == postId &&
    r.username == username &&
    r.text == reviewText &&
    r.x == longPressX &&
    r.y == longPressY
  );


  likeBtn.addEventListener('click', () => {
    if (target) {
      target.likes = (target.likes || 0) + 1;
      target.likedBy = target.likedBy || [];
      target.likedBy.push(username);
      localStorage.setItem('userReviews', JSON.stringify(allReviews));
    }

  });

  const thankBtn = popup.querySelector('.thank-btn');
  const postOwner = currentReviewTarget.closest('.post').querySelector('.post-username')?.textContent;

  if (postOwner === username) {
    // Allow thank you if not already thanked
    if (review.thankedBy?.includes(username)) {
      marker.style.outline = '2px solid white';
      popup.style.outline = '2px solid white';
      thankBtn.disabled = true;
      thankBtn.style.opacity = '0.5';
      thankBtn.style.cursor = 'default';
    } else {
      thankBtn.addEventListener('click', () => {
        marker.style.outline = '2px solid white';
        popup.style.outline = '2px solid white';
        thankBtn.disabled = true;
        thankBtn.style.opacity = '0.5';
        thankBtn.style.cursor = 'default';

        const allReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        const target = allReviews.find(r =>
          r.postId == review.postId &&
          r.username == review.username &&
          r.text == review.text &&
          r.x == review.x &&
          r.y == review.y
        );
        if (target) {
          target.thankedBy = target.thankedBy || [];
          target.thankedBy.push(username);
          localStorage.setItem('userReviews', JSON.stringify(allReviews));
        }
      });
    }
  } else {
    thankBtn.disabled = true;
    thankBtn.style.opacity = '0.5';
    thankBtn.style.cursor = 'default';
  }

  currentReviewWrapper.appendChild(marker);
  currentReviewWrapper.appendChild(popup);

  reviewPopup.style.display = 'none';
  reviewContent.style.background = '#f0f0f0';
  critiqueInput.value = '';
  critiqueInput.style.display = 'none';
  publishCritique.style.display = 'none';
  selectedRating = null;
});
let postToDelete = null;

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    postToDelete = e.target.closest('.post');
    document.getElementById('deleteModal').style.display = 'flex';
  }
});

document.getElementById('cancelDelete').addEventListener('click', () => {
  document.getElementById('deleteModal').style.display = 'none';
  postToDelete = null;
});

document.getElementById('confirmDelete').addEventListener('click', () => {
  if (postToDelete) {
    const postId = postToDelete.id.replace('post-', '');
    postToDelete.remove();

    // Remove from localStorage
    let posts = JSON.parse(localStorage.getItem('userPosts')) || [];
    posts = posts.filter(p => p.id != postId);
    localStorage.setItem('userPosts', JSON.stringify(posts));
  }

  document.getElementById('deleteModal').style.display = 'none';
  postToDelete = null;
});
