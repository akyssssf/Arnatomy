/* ==========================================================================
   svg.js — Ilustrasi anatomi (pengganti model 3D AR pada prototipe web).
   Setiap layer anatomi dibungkus <g data-layer="..."> supaya bisa
   ditampilkan/disembunyikan oleh kontrol layer (FR-05).
   ========================================================================== */
window.App = window.App || {};

(function (App) {
  'use strict';

  /* --- Layer tulang: tulang dada + lima pasang tulang rusuk ---------------- */
  function layerTulang() {
    let rusuk = '';
    for (let i = 0; i < 5; i += 1) {
      const y = 128 + i * 40;
      rusuk +=
        '<path d="M 194,' + y + ' C 150,' + (y - 6) + ' 96,' + (y + 20) + ' 72,' + (y + 84) + '" />' +
        '<path d="M 206,' + y + ' C 250,' + (y - 6) + ' 304,' + (y + 20) + ' 328,' + (y + 84) + '" />';
    }
    return (
      '<g class="layer-anatomi" data-layer="tulang" opacity="0.7">' +
        '<g fill="none" stroke="#9ca3af" stroke-width="7" stroke-linecap="round" opacity="0.8">' + rusuk + '</g>' +
        '<rect x="186" y="112" width="28" height="212" rx="13" fill="#d4d4d4" opacity="0.7" />' +
        '<path d="M 186,318 L 214,318 L 200,352 Z" fill="#d4d4d4" opacity="0.7" />' +
      '</g>'
    );
  }

  /* --- Layer otot: dua bidang otot dada + garis serat -------------------- */
  function layerOtot() {
    let serat = '';
    for (let i = 0; i < 4; i += 1) {
      const y = 158 + i * 16;
      serat +=
        '<path d="M 78,' + y + ' C 130,' + (y - 12) + ' 172,' + (y - 4) + ' 192,' + (y + 6) + '" />' +
        '<path d="M 322,' + y + ' C 270,' + (y - 12) + ' 228,' + (y - 4) + ' 208,' + (y + 6) + '" />';
    }
    return (
      '<g class="layer-anatomi" data-layer="otot" opacity="0.4">' +
        '<path d="M 70,140 C 118,116 172,126 194,160 C 176,208 116,226 68,208 Z" fill="#a13a4c" opacity="0.6" />' +
        '<path d="M 330,140 C 282,116 228,126 206,160 C 224,208 284,226 332,208 Z" fill="#a13a4c" opacity="0.6" />' +
        '<g fill="none" stroke="#f0b6bf" stroke-width="2" opacity="0.7">' + serat + '</g>' +
      '</g>'
    );
  }

  /* --- Layer kulit: siluet dada/torso ------------------------------------ */
  function layerKulit() {
    return (
      '<g class="layer-anatomi" data-layer="kulit" opacity="0.35">' +
        '<path d="M 96,86 C 122,62 160,52 200,52 C 240,52 278,62 304,86 C 332,112 338,182 333,252 ' +
          'C 328,332 322,404 318,470 L 82,470 C 78,404 72,332 67,252 C 62,182 68,112 96,86 Z" ' +
          'fill="#f2cba6" stroke="#d8a077" stroke-width="2" />' +
        '<path d="M 168,54 C 180,72 220,72 232,54" fill="none" stroke="#d8a077" stroke-width="2" opacity="0.8" />' +
      '</g>'
    );
  }

  /* --- Layer organ dalam: jantung & pembuluh darah besar ------------------ */
  function layerOrganDalam() {
    return (
      '<g class="layer-anatomi" data-layer="organ_dalam">' +
        /* Pembuluh besar digambar lebih dulu agar pangkalnya tertutup ruang jantung */
        '<g fill="none" stroke-linecap="round">' +
          '<path d="M 220,180 C 224,116 200,88 176,94 C 152,100 144,128 146,166" stroke="#dc2626" stroke-width="22" />' +
          '<path d="M 132,88 C 130,120 132,146 140,172" stroke="#2563eb" stroke-width="18" />' +
          '<path d="M 126,238 C 106,250 98,268 96,292" stroke="#2563eb" stroke-width="16" />' +
          '<path d="M 290,192 C 308,186 322,192 330,204" stroke="#ef4444" stroke-width="11" />' +
          '<path d="M 292,214 C 310,214 324,222 330,236" stroke="#ef4444" stroke-width="11" />' +
        '</g>' +

        /* Empat ruang jantung */
        '<path d="M 130,168 C 158,148 186,144 203,152 L 203,242 C 170,250 136,246 116,236 C 108,206 116,180 130,168 Z" ' +
          'fill="url(#gradBiruMuda)" stroke="#020617" stroke-width="2" stroke-opacity="0.55" data-bagian-bentuk="1" />' +
        '<path d="M 207,152 C 232,142 268,150 285,180 C 296,200 298,222 296,240 C 268,250 234,250 207,242 Z" ' +
          'fill="url(#gradMerahMuda)" stroke="#020617" stroke-width="2" stroke-opacity="0.55" data-bagian-bentuk="2" />' +
        '<path d="M 116,244 C 140,252 172,254 202,248 L 200,388 C 176,396 148,362 130,320 C 118,292 110,268 116,244 Z" ' +
          'fill="url(#gradBiruTua)" stroke="#020617" stroke-width="2" stroke-opacity="0.55" data-bagian-bentuk="3" />' +
        '<path d="M 206,248 C 236,254 268,250 294,246 C 296,282 282,326 258,358 C 238,384 216,396 204,388 Z" ' +
          'fill="url(#gradMerahTua)" stroke="#020617" stroke-width="2" stroke-opacity="0.55" data-bagian-bentuk="4" />' +

        /* Katup mitral (bagian anak dari atrium kiri) */
        '<path d="M 222,244 C 232,258 250,258 260,244" fill="none" stroke="#fde68a" stroke-width="6" ' +
          'stroke-linecap="round" data-bagian-bentuk="6" />' +

        /* Arteri pulmonalis melintas di depan jantung */
        '<path d="M 184,258 C 178,204 194,154 216,130" fill="none" stroke="#3b82f6" stroke-width="18" ' +
          'stroke-linecap="round" opacity="0.85" />' +

        /* Pembuluh koroner sebagai detail permukaan */
        '<g fill="none" stroke="#7f1d1d" stroke-width="2.5" opacity="0.3" stroke-linecap="round">' +
          '<path d="M 214,262 C 236,282 248,312 250,344" />' +
          '<path d="M 198,264 C 180,284 168,310 164,334" />' +
        '</g>' +

        /* Garis tepi organ agar keempat ruang terbaca sebagai satu jantung */
        '<path d="M 130,168 C 158,148 186,144 203,152 C 212,146 250,142 267,151 C 279,157 290,172 296,190 ' +
          'C 300,214 298,224 296,246 C 296,282 282,326 258,358 C 238,384 216,396 204,388 ' +
          'C 190,396 172,388 156,368 C 136,344 122,308 116,272 C 110,240 108,196 116,180 Z" ' +
          'fill="none" stroke="#171717" stroke-width="2" stroke-opacity="0.25" />' +
      '</g>'
    );
  }

  /**
   * Markup SVG lengkap. Diberi aria-hidden karena makna semantiknya
   * sudah diwakili tombol titik interaktif di lapisan atasnya.
   */
  function ilustrasiJantung() {
    return (
      '<svg viewBox="0 0 400 480" class="h-full w-full" role="img" aria-hidden="true" focusable="false">' +
        '<defs>' +
          '<linearGradient id="gradBiruMuda" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#93c5fd" /><stop offset="100%" stop-color="#3b82f6" />' +
          '</linearGradient>' +
          '<linearGradient id="gradBiruTua" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#3b82f6" /><stop offset="100%" stop-color="#1d4ed8" />' +
          '</linearGradient>' +
          '<linearGradient id="gradMerahMuda" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#fca5a5" /><stop offset="100%" stop-color="#ef4444" />' +
          '</linearGradient>' +
          '<linearGradient id="gradMerahTua" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#ef4444" /><stop offset="100%" stop-color="#b91c1c" />' +
          '</linearGradient>' +
        '</defs>' +
        layerOrganDalam() +
        layerTulang() +
        layerOtot() +
        layerKulit() +
      '</svg>'
    );
  }

  App.svg = { ilustrasiJantung: ilustrasiJantung };
})(window.App);
