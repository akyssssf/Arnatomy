# ARnatomy — Front-End Prototipe

Prototipe front-end mandiri untuk **ARnatomy**, aplikasi pembelajaran anatomi berbasis
Augmented Reality untuk siswa SMP–SMA. Dibangun mengikuti dokumen SKPL v1.0 (approved),
dengan ruang lingkup **Sistem Peredaran Darah (jantung dan pembuluh darah)**.

Mode AR perangkat tidak diaktifkan pada prototipe web ini. Sebagai gantinya, organ
ditampilkan sebagai **model 3D interaktif** yang dapat diputar, diperbesar, dan diberi
titik interaktif, sehingga alur belajarnya sama dengan rancangan aplikasi AR-nya.

## Teknologi

| Aspek | Pilihan |
|---|---|
| Markup | HTML5 semantik (`header`, `nav`, `main`, `section`, `article`, `aside`, `figure`, `footer`) |
| Styling | Tailwind CSS v4 via CDN (`@tailwindcss/browser@4`) + `css/style.css` untuk custom |
| Logika | JavaScript ES6+ vanilla, tanpa framework dan tanpa build step |
| 3D | Three.js r169 dari CDN lewat import map (`<script type="module">`) |
| Data | State di memori (array/object JS) — **tanpa** localStorage/sessionStorage |
| Async | `fetch` + `async/await` + `try/catch` + loading state |

Three.js dimuat sebagai modul ES dari CDN, bukan lewat bundler, sehingga proyek tetap
bebas build step.

## Cara menjalankan

Model 3D diambil dengan `fetch`, dan protokol `file://` memblokirnya. Karena itu
**jalankan lewat server lokal**:

```bash
python3 -m http.server 8123
```

lalu buka `http://localhost:8123`.

Berkas `index.html` tetap bisa dibuka langsung dengan klik dua kali, tetapi pada mode itu
model 3D gagal dimuat dan halaman eksplorasi otomatis turun ke **ilustrasi SVG dua dimensi**
dengan titik interaktif yang sama. Jalur cadangan ini memang disengaja dan ikut diuji.

Koneksi internet dibutuhkan untuk memuat Tailwind dan Three.js dari CDN serta untuk
memanggil endpoint mock pada fitur Asisten AI dan Laporan Kesalahan.

## Akun demo

| Peran | Email | Kata sandi |
|---|---|---|
| Siswa | `siswa@arnatomy.id` | `siswa123` |
| Guru | `guru@arnatomy.id` | `guru123` |
| Administrator | `admin@arnatomy.id` | `admin123` |

Tautan "isi" pada tabel akun uji coba di halaman login mengisi form secara otomatis.

## Struktur folder

```
arnatomy-frontend/
├── index.html              # Kerangka halaman, import map Three.js, urutan script
├── css/
│   └── style.css           # Custom di luar Tailwind: titik interaktif, akordeon, fokus
├── assets/
│   └── models/heart.glb    # Model 3D jantung (placeholder, lihat catatan di bawah)
├── js/
│   ├── ikon.js             # Kumpulan ikon garis (inline SVG) untuk seluruh halaman
│   ├── variants.js         # Pola CVA manual (button, badge, card, bubble, tab, dst.)
│   ├── data.js             # Seed data sesuai kamus data SKPL Bab VI
│   ├── state.js            # State di memori + aksi & selector
│   ├── ui.js               # Helper: escaping, format waktu, toast, modal dialog
│   ├── api.js              # Simulasi panggilan API (async/await + timeout)
│   ├── svg.js              # Ilustrasi anatomi berlapis (cadangan bila 3D gagal)
│   ├── viewer3d.js         # Modul ES: scene Three.js, kamera, titik pada permukaan
│   ├── layout.js           # Header, navigasi responsif, footer
│   ├── router.js           # Routing hash + guard login & peran (RBAC)
│   ├── app.js              # Titik masuk aplikasi
│   └── pages/
│       ├── login.js        # Halaman Login
│       ├── beranda.js      # Halaman Utama
│       ├── eksplorasi.js   # Halaman Eksplorasi (model 3D)
│       ├── asisten.js      # Halaman Asisten AI
│       ├── riwayat.js      # Halaman Riwayat Belajar
│       └── admin.js        # Dashboard Administrator
└── README.md
```

Pemisahan tanggung jawab: **data/state** (`data.js`, `state.js`), **fungsi render**
(`pages/*.js`, `svg.js`, `layout.js`), **event handler** (fungsi `mount()` tiap halaman),
dan **scene 3D** (`viewer3d.js`). Markup beserta atribut ARIA titik interaktif dibuat oleh
halaman; `viewer3d.js` hanya mengurus posisi layarnya tiap frame.

## Catatan model 3D

`assets/models/heart.glb` diambil sementara dari repositori publik
[thebuggeddev/anatomy](https://github.com/thebuggeddev/anatomy) (`public/models/heart.glb`).
Repositori itu **tidak menyertakan berkas LICENSE**, dan metadata berkas menunjukkan model
dihasilkan oleh generator 3D Tripo, sehingga berkas ini berstatus **placeholder** dan
direncanakan diganti model buatan sendiri.

Menggantinya cukup satu langkah: timpa `assets/models/heart.glb`, atau ubah
`file_model_3d` pada `js/data.js`. Titik interaktif menyesuaikan sendiri karena
posisinya ditembakkan ke permukaan model, bukan dipatok pada koordinat mentah.

## Peta halaman ↔ SKPL

| Rute | Halaman | Kebutuhan yang diwakili |
|---|---|---|
| `#/login` | Login | FR-01, TC-01, TC-02 |
| `#/beranda` | Halaman Utama | Bab VII — pintasan eksplorasi & riwayat |
| `#/eksplorasi` | Eksplorasi organ 3D | FR-03, FR-04, FR-05, FR-06, FR-07, FR-09, FR-14 |
| `#/asisten?bagian=<id>` | Asisten AI | FR-08, TC-07 |
| `#/riwayat` | Riwayat Belajar | FR-14 |
| `#/admin` | Dashboard Administrator | FR-10, FR-11 (khusus peran `admin`) |

Halaman eksplorasi disusun tiga kolom: pustaka bagian tubuh di kiri, penampil model di
tengah, dan panel penjelasan di kanan. Penjelasan label tampil pada panel kanan, bukan
pada popup melayang, agar teks panjang dan daftar fakta tetap terbaca sambil model diputar.

## Model data (mengikuti Bab VI SKPL)

```js
organs         { id_organ, nama_organ, sistem_organ, julukan, file_model_3d, deskripsi, fakta[] }
body_parts     { id_bagian, id_organ, nama_bagian_internal, parent_bagian_id,
                 posisi_koordinat_3d, posisi_2d, fakta[] }
layers         { id_layer, id_organ, nama_layer, urutan_tampil }
part_content   { id_konten, id_bagian, jenis_konten: 'dasar'|'dimmed', judul_tampil,
                 deskripsi, status_tampilan, status_validasi: 'draft'|'tervalidasi' }
learning_history  { id_riwayat, id_user, id_bagian, jenis_konten, waktu_akses, durasi }
ai_conversations  { id_percakapan, id_user, id_bagian, pertanyaan, jawaban, waktu }
laporan_kesalahan { id_laporan, id_user, id_konten, deskripsi_laporan, status_tindak_lanjut, waktu }
```

`posisi_koordinat_3d` tetap berformat `"x,y,z"` sesuai SKPL. Nilainya dinyatakan sebagai
pecahan terhadap kotak batas model, jadi tidak ikut berubah bila berkas model diganti
dengan skala berbeda. Saat model dimuat, koordinat itu dipakai sebagai titik bidik: sinar
ditembakkan dari posisi kamera awal, lalu penanda diletakkan pada permukaan pertama yang
terkena. `posisi_2d` (persen) hanya dipakai ilustrasi SVG cadangan.

Isi data awal: 6 bagian tubuh jantung (Atrium Kanan, Atrium Kiri, Ventrikel Kanan,
Ventrikel Kiri, Aorta, dan Katup Mitral sebagai sub-bagian Atrium Kiri). Semuanya punya
label dasar; empat di antaranya juga punya label dimmed.

## Kinerja penampil 3D

Beberapa keputusan diambil supaya halaman tetap enak digulir walau ada kanvas WebGL:

- **Render sesuai kebutuhan.** Scene hanya digambar ulang saat kamera bergerak, ukuran
  berubah, atau putar otomatis menyala. Saat diam, kanvas tidak membebani apa pun.
- **Berhenti saat keluar layar.** `IntersectionObserver` mematikan gelung render begitu
  penampil tergulir keluar viewport, lalu menyalakannya kembali saat terlihat.
- **Uji titik tersembunyi tanpa raycast.** Penanda di sisi belakang organ ditentukan lewat
  perbandingan arah permukaan dengan arah pandang kamera, bukan menembakkan sinar ke mesh
  setiap frame. Raycast hanya dipakai sekali saat model dimuat untuk menempelkan penanda.
- **Roda mouse tidak dibajak.** Menggulir di atas model tetap menggulir halaman; zoom
  memakai Ctrl/Cmd + gulir, cubit trackpad, atau tombol perbesar dan perkecil.
- Rasio piksel dibatasi 1,5 dan header lengket tidak memakai `backdrop-blur`.

## Layer anatomi pada mode 3D

Berkas model hanya berisi organ jantung. Layer kulit, otot, dan tulang dibentuk dari
geometri sederhana (kapsul dan busur tulang rusuk) sebagai selubung di sekeliling organ,
sehingga FR-05 tetap dapat diperagakan. Saat salah satu selubung dinyalakan, kamera
mundur otomatis supaya seluruh lapisan tetap masuk bingkai.

## Pola CVA (Class Variance Authority) manual

`js/variants.js` menyediakan fungsi `cva(base, { variants, defaultVariants, compoundVariants })`.
Komponen dengan variasi tampilan disusun dari peta `variant -> class Tailwind`, bukan
rangkaian if-else:

```js
const badge = cva('inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs', {
  variants: {
    status: {
      draft:       'border-yellow-600 bg-yellow-50 text-yellow-800',
      tervalidasi: 'border-green-700 bg-green-50 text-green-800'
    }
  },
  defaultVariants: { status: 'netral' }
});

badge({ status: konten.status_validasi });
```

Varian yang tersedia: `tombol`, `badge`, `kartu`, `bubble`, `toggleLayer`, `alert`,
`input`, dan `tab`.

## Bahasa rupa

Gaya editorial: latar abu netral `#e6e8eb`, kartu putih dan abu muda bersudut membulat
tanpa bayangan, judul besar dan rapat dengan Inter Tight, titik biru `#1a6dff` di akhir
judul, label mikro berawalan garis miring ("/ ORGAN"), navigasi teks dipisah garis miring,
serta satu strip marquee biru. Ikon garis berasal dari `js/ikon.js` (inline SVG). Biru
dipakai hemat: tombol utama, titik, strip, dan penanda aktif. Fon dimuat dari Google
Fonts dengan cadangan `system-ui`.

## Aksesibilitas

- Landmark semantik + skip link ke konten utama.
- Titik interaktif berupa `<button>` bernomor dengan `aria-label` dan `aria-pressed`;
  seluruh bagian tubuh juga dapat dibuka lewat daftar pustaka di kolom kiri, sehingga
  model 3D tidak menjadi satu-satunya jalan masuk.
- Titik yang berada di sisi belakang organ diredupkan otomatis mengikuti hasil uji
  keterhalangan (raycast) terhadap model.
- Toggle layer memakai `aria-pressed`; perubahannya diumumkan lewat region `aria-live`.
- Label dimmed memakai `aria-expanded` + `aria-controls`, terbuka sebagai akordeon
  **di tempat yang sama** tanpa pindah halaman.
- `Escape` mengembalikan panel kanan ke ringkasan organ.
- Modal (laporan & edit konten) memakai `role="dialog"`, `aria-modal="true"`, focus trap
  `Tab`/`Shift+Tab`, dan `Escape` untuk menutup.
- Tab dashboard admin mengikuti pola WAI-ARIA: `role="tablist"/"tab"/"tabpanel"`,
  roving `tabindex`, navigasi `←` `→` `Home` `End`.
- Pesan kesalahan memakai `role="alert"` + `aria-live`, field bermasalah diberi `aria-invalid`.
- Animasi dinonaktifkan otomatis pada `prefers-reduced-motion: reduce`.

## Menguji penanganan error

- **Asisten AI dan laporan**: centang "Simulasikan koneksi gagal" pada Halaman Asisten AI.
  Saat aktif, kedua pemanggilan async gagal sehingga jalur `try/catch` (pesan `role="alert"`
  beserta tombol "Coba lagi") dapat diperagakan tanpa memutus internet.
- **Model 3D**: ubah `file_model_3d` pada `js/data.js` ke nama berkas yang tidak ada, atau
  buka `index.html` langsung tanpa server. Halaman akan menampilkan pemberitahuan dan
  beralih ke ilustrasi SVG dua dimensi.

## Catatan

- Seluruh data hanya hidup di memori. Me-refresh halaman akan mengosongkan sesi login,
  riwayat belajar, percakapan AI, dan laporan kesalahan.
- Password akun demo sengaja disimpan sebagai teks biasa karena ini prototipe front-end.
  Pada sistem sebenarnya, NFR-01 mewajibkan hashing bcrypt di sisi server.
