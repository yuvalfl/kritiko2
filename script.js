const profilePicInput = document.getElementById('profile-pic');
const profilePicPreview = document.getElementById('profile-pic-preview');
const usernameInput = document.getElementById('username');
const continueBtn = document.getElementById('continue-btn');

// Preview uploaded image
profilePicInput.addEventListener('change', () => {
  const file = profilePicInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      profilePicPreview.style.backgroundImage = `url(${reader.result})`;
      profilePicPreview.textContent = '';
    };
    reader.readAsDataURL(file);
  }
});

// Enable button only when username is typed
usernameInput.addEventListener('input', () => {
  continueBtn.disabled = usernameInput.value.trim() === '';
});

// Handle submit
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const profilePic = profilePicInput.files[0];

  if (!username) return;

  if (profilePic) {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem('username', username);
      localStorage.setItem('profilePic', reader.result);
      window.location.href = 'home.html';
    };
    reader.readAsDataURL(profilePic);
  } else {
    localStorage.setItem('username', username);
    localStorage.removeItem('profilePic');
    window.location.href = 'home.html';
  }
});
