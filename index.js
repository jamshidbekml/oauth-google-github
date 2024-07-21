const { config } = require('dotenv');
const express = require('express');
const axios = require('axios');
const app = express();
const path = require('path');
const { env } = process;
config();

app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/signin', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'signin.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'signup.html'));
});
app.get('/', async (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'article.html'));
});

// GOOGLE
app.get('/auth/google', (req, res) => {
    const redirectUri = 'https://accounts.google.com/o/oauth2/v2/auth?';
    const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: 'http://localhost:3000/auth/google/callback',
        response_type: 'code',
        scope: 'profile email',
    });
    res.redirect(redirectUri + params.toString());
});

app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: 'http://localhost:3000/auth/google/callback',
            grant_type: 'authorization_code',
        }
    );
    const { access_token } = tokenResponse.data;
    const profileResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
            headers: { Authorization: `Bearer ${access_token}` },
        }
    );
    res.cookie('userName', profileResponse.data.given_name);
    res.cookie('avatar', profileResponse.data.picture);
    res.redirect('/');
});

//GITHUB
app.get('/auth/github', (req, res) => {
    const redirectUri = 'https://github.com/login/oauth/authorize?';
    const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: 'http://localhost:3000/auth/github/callback',
        scope: 'user:email',
    });
    res.redirect(redirectUri + params.toString());
});

app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            code,
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            redirect_uri: 'http://localhost:3000/auth/github/callback',
        },
        {
            headers: { Accept: 'application/json' },
        }
    );
    const { access_token } = tokenResponse.data;
    const profileResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
    });
    console.log(profileResponse.data);
    res.cookie('userName', profileResponse.data.login);
    res.cookie('userPic', profileResponse.data.avatar_url);
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
