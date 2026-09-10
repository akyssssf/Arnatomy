/* ==========================================================================
   app.js — Titik masuk aplikasi ARnatomy
   ========================================================================== */
(function (App) {
  'use strict';

  function mulai() {
    if (!window.location.hash) window.location.hash = '#/login';
    App.router.mulai();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mulai);
  } else {
    mulai();
  }
})(window.App);
