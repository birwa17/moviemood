// MovieMood - common JavaScript used by every page

function load(key, fallback) {
  try {
    var v = JSON.parse(localStorage.getItem(key));
    return v === null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


// =====================================================
// MOVIE DATA
// =====================================================

var MOVIE_DATA_VERSION = 2;

function getMovies() {

  var m = load('mm_movies', null);

  if (!m || !Array.isArray(m) || m.length === 0) {
    m = DEFAULT_MOVIES;
  }

  /*
   * MovieMood mood classification
   * Assigns a useful mood to every movie
   * based on genre, rating and movie information.
   */

  m.forEach(function(movie) {

    var genreText = (
      String(movie.genre || '') +
      ' ' +
      String(movie.genres || '')
    ).toLowerCase();

    var rating = Number(movie.rating || 0);

    /* Romance */
    if (
      genreText.indexOf('romance') !== -1 ||
      genreText.indexOf('romantic') !== -1
    ) {

      movie.mood = 'Romantic';

    }

    /* Comedy / Animation / Family */
    else if (
      genreText.indexOf('comedy') !== -1 ||
      genreText.indexOf('animation') !== -1 ||
      genreText.indexOf('family') !== -1
    ) {

      movie.mood = 'Happy';

    }

    /* Action / Adventure / Thriller */
    else if (
      genreText.indexOf('action') !== -1 ||
      genreText.indexOf('adventure') !== -1 ||
      genreText.indexOf('thriller') !== -1
    ) {

      movie.mood = 'Excited';

    }

    /* Drama / History / War */
    else if (
      genreText.indexOf('drama') !== -1 ||
      genreText.indexOf('history') !== -1 ||
      genreText.indexOf('war') !== -1
    ) {

      movie.mood = 'Emotional';

    }

    /* Highly rated movies */
    else if (rating >= 8) {

      movie.mood = 'Motivated';

    }

    /* Everything else */
    else {

      movie.mood = 'Relaxed';

    }

  });

  save('mm_movies', m);

  return m;
}


// =====================================================
// USERS
// =====================================================

function getUsers() {

  var u = load('mm_users', null);

  if (!u) {

    u = [{
      id: 1,
      name: 'Admin',
      email: 'admin@moviemood.com',
      password: 'admin123',
      role: 'admin'
    }];

    save('mm_users', u);
  }

  return u;
}

function saveUsers(u) {
  save('mm_users', u);
}

function currentUser() {
  return load('mm_current', null);
}


// =====================================================
// REVIEWS
// =====================================================

function getReviews() {
  return load('mm_reviews', []);
}

function saveReviews(r) {
  save('mm_reviews', r);
}


// =====================================================
// FAVORITES / WATCHLIST
// =====================================================

function getFav(userId) {

  var all = load('mm_fav', {});

  return all[userId] || [];
}

function saveFav(userId, list) {

  var all = load('mm_fav', {});

  all[userId] = list;

  save('mm_fav', all);
}


// =====================================================
// FIND MOVIE
// =====================================================

function findMovie(id) {

  var list = getMovies();

  for (var i = 0; i < list.length; i++) {

    if (list[i].id === Number(id)) {
      return list[i];
    }

  }

  return null;
}


// =====================================================
// MESSAGES
// =====================================================

function flash(msg, type) {

  sessionStorage.setItem(
    'mm_flash',
    JSON.stringify({
      msg: msg,
      type: type || 'success'
    })
  );
}


// =====================================================
// LOGIN REQUIREMENT
// =====================================================

function requireLogin() {

  if (!currentUser()) {

    flash('Please login first.', 'error');

    location.href = 'login.html';

    return false;
  }

  return true;
}


// =====================================================
// ADMIN REQUIREMENT
// =====================================================

function requireAdmin() {

  var u = currentUser();

  if (!u || u.role !== 'admin') {

    flash('Admin access only.', 'error');

    location.href = 'login.html';

    return false;
  }

  return true;
}


// =====================================================
// MOVIE CARD
// =====================================================

function movieCard(m) {
  var link = 'movie.html?id=' + m.id;

  var firstLetter = m.title
    ? m.title.charAt(0).toUpperCase()
    : '?';

  var poster = '<div class="movie-poster-design">' +
      '<div class="poster-top">MOVIEMOOD</div>' +
      '<div class="poster-letter">' + esc(firstLetter) + '</div>' +
      '<div class="poster-title">' + esc(m.title) + '</div>' +
      '<div class="poster-line"></div>' +
      '<div class="poster-info">' +
        esc(m.year || '') + ' • ' + esc(m.genre || 'Movie') +
      '</div>' +
    '</div>';

  return '<div class="movie-card">' +
    '<a href="' + link + '">' + poster + '</a>' +
    '<div class="card-body">' +
      '<h3><a href="' + link + '">' + esc(m.title) + '</a></h3>' +
      '<p>' + esc(m.genre) + ' • ' + esc(m.year) + '</p>' +
      '<p class="stars">⭐ ' + esc(m.rating) +
      ' <span class="tag">' + esc(m.mood) + '</span></p>' +
    '</div>' +
  '</div>';
}

// =====================================================
// UNIQUE VALUES
// =====================================================

function uniqueValues(key) {

  var vals = [];

  getMovies().forEach(function (m) {

    if (
      m[key] != null &&
      m[key] !== '' &&
      vals.indexOf(m[key]) < 0
    ) {

      vals.push(m[key]);
    }

  });

  return vals.sort();
}


// =====================================================
// HEADER / NAVBAR
// =====================================================

function renderLayout() {

  var u = currentUser();

  var nav =

    '<a href="index.html">Home</a>' +

    '<a href="recommend.html">Recommend</a>' +

    '<a href="search.html">Search</a>' +

    '<a href="watchnext.html">Watch Next</a>' +

    '<a href="surprise.html">Surprise Me</a>';

    


  if (u) {

    nav +=

      '<a href="favorites.html">Watchlist</a>' +

      '<a href="profile.html">Profile</a>';

    if (u.role === 'admin') {

      nav += '<a href="admin.html">Admin</a>';
    }

    nav += '<a href="#" id="logoutLink">Logout</a>';

  } else {

    nav +=

      '<a href="login.html">Login</a>' +

      '<a href="register.html">Register</a>';
  }


  nav +=

    '<a href="about.html">About</a>' +

    '<button id="themeBtn" title="Dark / Light mode">🌓</button>';


  document.getElementById('header').innerHTML =

    '<header class="navbar">' +

      '<a class="logo" href="index.html">' +
        '🎬 MovieMood' +
      '</a>' +

      '<button id="menuBtn" class="menu-btn">' +
        '☰' +
      '</button>' +

      '<nav id="navLinks">' +
        nav +
      '</nav>' +

    '</header>';


  document.getElementById('footer').innerHTML =

    '<footer class="footer">' +

      '© ' +
      new Date().getFullYear() +

      ' MovieMood – Find Movies That Match Your Mood' +

    '</footer>';


  // Theme

  document.getElementById('themeBtn').addEventListener(
    'click',
    function () {

      var next =

        document.documentElement.getAttribute('data-theme') === 'dark'
          ? 'light'
          : 'dark';

      document.documentElement.setAttribute(
        'data-theme',
        next
      );

      localStorage.setItem(
        'theme',
        next
      );

    }
  );


  // Mobile menu

  document.getElementById('menuBtn').addEventListener(
    'click',
    function () {

      document
        .getElementById('navLinks')
        .classList.toggle('open');

    }
  );


  // Logout

  var lo = document.getElementById('logoutLink');

  if (lo) {

    lo.addEventListener(
      'click',
      function (e) {

        e.preventDefault();

        localStorage.removeItem('mm_current');

        location.href = 'index.html';

      }
    );

  }


  // Flash message

  var f = sessionStorage.getItem('mm_flash');

  if (f) {

    f = JSON.parse(f);

    document
      .getElementById('app')
      .insertAdjacentHTML(

        'afterbegin',

        '<div class="alert ' +
        f.type +
        '">' +

        esc(f.msg) +

        '</div>'
      );

    sessionStorage.removeItem('mm_flash');
  }

}


renderLayout();