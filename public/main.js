const profile = document.getElementById('profile');
const cookieString = document.cookie;
const cookies = cookieString.split('; ');
var userName;
var avatar;
for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === 'userName') {
        userName = decodeURIComponent(cookieValue);
    }
    if (cookieName === 'avatar') {
        avatar = decodeURIComponent(cookieValue);
    }
}

if (userName && avatar) {
    document.getElementById('username').textContent = userName;
    document.getElementById('avatar').src = avatar;
    profile.classList.remove('d-none');
    profile.classList.add('d-flex');
}
