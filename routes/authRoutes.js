const express = require('express');
const router = express.Router();
const session = require('express-session');

// Login page
router.get('/login', (req, res) => {
  // If already logged in, redirect to home
  if (req.session.isAuthenticated) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login' });
});

// Login post request
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Static authentication (in production, use a proper authentication system)
  if (username === 'admin' && password === 'admin') {
    req.session.isAuthenticated = true;
    req.session.user = { username: 'admin', role: 'administrator' };
    res.redirect('/');
  } else {
    res.render('login', { 
      title: 'Login', 
      error: 'Invalid username or password' 
    });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;