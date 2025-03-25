document.addEventListener('DOMContentLoaded', () => {
  const profilePicInput = document.getElementById('profilePicInput');
  const profilePic = document.getElementById('profile-pic');
  const profileUsername = document.getElementById('profile-username');
  const descriptionBox = document.getElementById('profile-description');
  const saveButton = document.getElementById('save-description');
  const reviewList = document.getElementById('review-list');

  // Load saved data
  const storedPic = localStorage.getItem('profilePic');
  const storedUsername = localStorage.getItem('username');
  const storedDesc = localStorage.getItem('profileDescription');

  if (storedPic) profilePic.src = storedPic;
  if (storedUsername) profileUsername.textContent = `@${storedUsername}`;
  if (storedDesc) descriptionBox.value = storedDesc;

  // Clicking profile picture opens file input
  profilePic.addEventListener('click', () => {
    profilePicInput.click();
  });

  // Upload and save new profile picture
  profilePicInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      profilePic.src = dataUrl;
      localStorage.setItem('profilePic', dataUrl);
    };
    reader.readAsDataURL(file);
  });

  // Save profile description
  saveButton.addEventListener('click', () => {
    const desc = descriptionBox.value.trim();
    localStorage.setItem('profileDescription', desc);
    descriptionBox.style.background = 'white';
    saveButton.style.display = 'none';
  });

  // Load user reviews
  const userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
  userReviews.forEach((review) => {
    const link = document.createElement('a');
    link.href = `home.html#post-${review.postId}`;
    link.className = 'review-item';
    link.textContent = `${review.text} (${review.time})`;
    reviewList.appendChild(link);
  });

  // Logout logic
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutModal = document.getElementById('logoutModal');
  const cancelLogout = document.getElementById('cancelLogout');
  const confirmLogout = document.getElementById('confirmLogout');

  logoutBtn.addEventListener('click', () => {
    logoutModal.style.display = 'flex';
  });

  cancelLogout.addEventListener('click', () => {
    logoutModal.style.display = 'none';
  });

  confirmLogout.addEventListener('click', () => {
    localStorage.removeItem('username');
    localStorage.removeItem('profilePic');
    localStorage.removeItem('profileDescription');
    localStorage.removeItem('userReviews');
    window.location.href = 'index.html';
  });
});
