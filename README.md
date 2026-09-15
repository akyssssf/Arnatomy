# ARnatomy — Next.js App Router

> **Catatan penamaan:** Modul praktikum menyebut `middleware.ts`, tapi Next.js 16
> (versi yang dipakai project ini) mengganti nama konvensi tersebut menjadi `proxy.ts`.
> Fungsinya identik — baca cookie sesi, cocokkan matcher, redirect sebelum halaman
> dirender. Lihat `src/proxy.ts`.

Migrasi penuh prototipe front-end **ARnatomy** (pembelajaran anatomi berbasis AR untuk siswa
SMP–SMA, SKPL v1.0) dari versi vanilla HTML/JS ke arsitektur React modern. Organ tetap
ditampilkan sebagai model 3D interaktif (Three.js) karena kamera AR perangkat tidak diaktifkan
pada prototipe web.

Mencakup tiga modul praktikum sekaligus:

| Modul | Yang diterapkan |
|---|---|
| 5 — Framework UI modern | React 19 + **React Compiler** (`reactCompiler: true`, tanpa `useMemo`/`useCallback` manual), komponen terisolasi & reusable, validasi form, simulasi API asinkron dengan loading/error state |
| 6 — Meta-framework | Next.js 16 **App Router**, dominasi React Server Components (70%), nested layout 2 tingkat, `loading.tsx` + `<Suspense>` streaming, `error.tsx`, Route Handlers, `proxy.ts` (nama baru `middleware.ts`) untuk proteksi rute berbasis cookie, Metadata API statis + `generateMetadata` |
| 7 — State management | **Zustand** khusus client UI state, **TanStack Query v5** untuk seluruh server state (custom hook per entitas, `staleTime`/`gcTime`, `useMutation` + `invalidateQueries`), **Zod** untuk semua input form dan respons API (`z.infer`, tanpa `any`) |

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Perintah lain: `npm run build`, `npm run lint`, `npm run typecheck`.
Tidak ada backend sungguhan: semua endpoint adalah Route Handler mock dengan jeda buatan.

### Akun demo

| Peran | Email | Kata sandi |
|---|---|---|
| Siswa | `siswa@arnatomy.id` | `siswa123` |
| Guru | `guru@arnatomy.id` | `guru123` |
| Administrator | `admin@arnatomy.id` | `admin123` |

## Struktur folder

```
arnatomy-next/
├── public/
│   ├── models/          heart.glb, lungs.glb (placeholder, lihat Catatan aset)
│   └── img/             render statis organ (webp transparan)
├── src/
│   ├── proxy.ts         proteksi rute (baca cookie sesi -> redirect) — Next 16: pengganti middleware.ts
│   ├── app/
│   │   ├── layout.tsx            Root Layout: fon lokal, Metadata API, QueryProvider, skip link, Toaster
│   │   ├── globals.css           Tailwind v4 (@theme token) + kelas khusus (titik 3D, panel, kaca, motion)
│   │   ├── page.tsx              Landing publik (RSC)
│   │   ├── not-found.tsx
│   │   ├── login/page.tsx        Login (RSC pembungkus) + FormLogin (klien)
│   │   ├── (app)/                 area setelah login
│   │   │   ├── layout.tsx        Nested layout #2: NavKaca + Footer, sesi dari cookie
│   │   │   ├── error.tsx         Error boundary segmen (klien)
│   │   │   ├── beranda/page.tsx  Dashboard belajar; <Suspense> untuk AktivitasTerakhir
│   │   │   ├── eksplorasi/page.tsx  ?organ=<id>, generateMetadata, PenampilOrgan (klien)
│   │   │   ├── asisten/page.tsx  prefetch percakapan -> HydrationBoundary -> ChatAsisten
│   │   │   ├── riwayat/{page,loading}.tsx   RSC async + skeleton streaming
│   │   │   └── admin/{page,loading}.tsx     cek peran + prefetch ['konten'],['laporan'] -> TabAdmin
│   │   └── api/                  Route Handlers (REST mock, body divalidasi Zod, jeda buatan)
│   │       ├── login, logout
│   │       ├── asisten           GET riwayat, POST tanya (simulasiGagal -> 503)
│   │       ├── laporan, laporan/[id]   POST kirim (simulasiGagal -> 503), PATCH tindak lanjut (admin)
│   │       ├── konten, konten/[id]     GET semua, PATCH edit (admin)
│   │       └── riwayat, riwayat/[id]   GET/POST catat, PATCH tutup (durasi dihitung server)
│   ├── components/
│   │   ├── ui/          Ikon, Badge, Alert, Spinner, JudulHalaman, JudulKata, Marquee, KondisiKosong,
│   │   │                DaftarFakta, ProgressBar, KartuStatistik (RSC) · Modal, Toaster (klien)
│   │   ├── layout/      Footer (RSC) · NavKaca (klien: gulir menyusut, keluar)
│   │   ├── motion/      Muncul (klien tipis; anak tetap RSC)
│   │   ├── hero/        Hero3D (klien: kanvas dekoratif, import() Three.js)
│   │   ├── landing/     HeroLanding, KatalogSistem, KartuSistem, LangkahBelajar, AjakanMasuk (RSC)
│   │   ├── login/       HeroLogin (RSC) · FormLogin (klien)
│   │   ├── beranda/     KartuLanjutkan, KartuRingkasan, KartuSistemProgres, AktivitasTerakhir, Pintasan (RSC)
│   │   ├── eksplorasi/  KepalaEksplorasi, PemilihOrgan (RSC) · PenampilOrgan, PanelPenjelasan, FormLaporan (klien)
│   │   ├── asisten/     ChatAsisten (klien)
│   │   ├── riwayat/     TabelRiwayat (RSC)
│   │   ├── admin/       TabAdmin, PanelKonten, PanelLaporan, FormEditKonten (klien)
│   │   └── providers/   QueryProvider (klien)
│   ├── hooks/           kunci-query, useAiConversations, useLaporanKesalahan, useKontenLabel, useRiwayatBelajar
│   ├── store/           useUIStore.ts (Zustand, client UI state saja)
│   ├── lib/
│   │   ├── schemas.ts   skema Zod + z.infer semua entitas & form
│   │   ├── data.ts      seed data master (divalidasi Zod saat modul dimuat)
│   │   ├── db.ts        "basis data" mock di memori server (server-only, globalThis)
│   │   ├── mock-api.ts  fungsi fetch klien: timeout, galat terbaca, respons diparse Zod
│   │   ├── auth.ts      ambilSesi() dari cookie (server-only)
│   │   ├── sesi-codec.ts enkode/dekode cookie (dipakai proxy + server)
│   │   ├── api-util.ts  pembantu Route Handler (bacaBody Zod, wajibSesi, galat)
│   │   ├── asisten.ts   penyusun jawaban Asisten AI
│   │   ├── variants.ts  CVA (class-variance-authority): tombol, badge, kartu, bubble, toggleLayer, alert, input, tab
│   │   └── format.ts
│   └── three/viewer3d.ts   penampil Three.js (dimuat dinamis di klien)
```

## Server vs Client Component

38 dari 54 berkas `.tsx` (**70%**) adalah Server Component. Batas `"use client"` ditaruh di
"daun" hirarki, hanya untuk yang benar-benar butuh browser:

| Client Component | Alasan |
|---|---|
| `PenampilOrgan`, `Hero3D` | kanvas WebGL/Three.js, pointer & keyboard event, `ResizeObserver` |
| `PanelPenjelasan`, `FormLaporan`, `FormEditKonten`, `FormLogin`, `ChatAsisten` | state form + validasi Zod di klien, `useMutation` |
| `TabAdmin`, `PanelKonten`, `PanelLaporan` | `useQuery`/`useMutation`, roving tabindex, state tab (Zustand) |
| `NavKaca` | listener `scroll`, `usePathname`, tombol keluar |
| `Modal`, `Toaster`, `Muncul`, `QueryProvider`, `error.tsx` | focus trap/`IntersectionObserver`/Zustand/`QueryClient`/boundary wajib klien |

Semua `page.tsx`, kedua `layout.tsx`, `loading.tsx`, dan komponen presentasional
(kartu, tabel, hero, katalog, ikon, badge) adalah Server Component. Bagian server yang harus
tampil di dalam komponen klien dioper sebagai **node props** (mis. `judul` dan `pemilihOrgan`
pada `PenampilOrgan`), bukan diimpor, sehingga tetap dirender di server.

## Pemisahan state

| Kategori | Pustaka | Isi |
|---|---|---|
| Client UI state | Zustand `useUIStore` | `layerAktif`, `panelEksplorasiTerbuka`, `bagianAktifId`, `putarOtomatis`, `tabAdminAktif`, `simulasiGagal`, `toasts` |
| Server state | TanStack Query | `['percakapan']` (staleTime 0), `['laporan']` (30 dtk), `['konten']` (5 mnt / gcTime 15 mnt), `['riwayat']` (10 dtk) |
| Data master statis | impor langsung `lib/data.ts` di RSC | `sistem_organ`, `organs`, `layers`, `body_parts` |

Tidak ada `localStorage`/`sessionStorage`. Data transaksional hidup di memori proses server
(`lib/db.ts`) selama sesi, dibaca RSC secara langsung atau lewat Route Handler, dan dibuang
saat pengguna keluar (`POST /api/logout`). Mematikan `next dev` juga mengosongkannya.

Halaman `admin` dan `asisten` mem-prefetch query di server (`queryClient.prefetchQuery`) dan
mengirimnya lewat `<HydrationBoundary>`, jadi `useQuery` di klien langsung terisi sementara
`loading.tsx` tampil selama prefetch berjalan (Streaming SSR).

## Autentikasi & proteksi rute

- `POST /api/login` memeriksa akun demo lalu menyetel cookie **httpOnly** `arnatomy_sesi`
  (JSON pengguna tanpa password, di-base64url). Prototipe, bukan auth produksi.
- `src/proxy.ts` (Next.js 16 mengganti nama `middleware.ts` menjadi `proxy.ts`; API sama:
  `NextRequest`, cookie, `matcher`, `NextResponse.redirect`) berjalan sebelum render:
  rute terproteksi tanpa cookie → `/login?auth_error=1&next=…`; non-admin ke `/admin` →
  `/beranda?pesan=khusus-admin`; sudah masuk ke `/login` → `/beranda`.
- Lapisan kedua di server: `(app)/layout.tsx` dan `admin/page.tsx` memeriksa sesi/peran lagi,
  dan setiap Route Handler memakai `wajibSesi()` (401/403).

## Validasi Zod

`lib/schemas.ts` adalah satu-satunya sumber tipe: entitas SKPL (`users`, `sistem_organ`,
`organs`, `layers`, `body_parts`, `part_content`, `learning_history`, `ai_conversations`,
`laporan_kesalahan`) dan skema form (`LoginFormSchema`, `LaporanFormSchema`,
`KontenFormSchema`, `PertanyaanFormSchema`). Dipakai di tiga titik:

1. seed data diparse saat modul dimuat (data salah bentuk gagal saat build);
2. Route Handler memvalidasi body (`bacaBody`) → 400 dengan pesan Zod;
3. `lib/mock-api.ts` mem-parse **setiap respons** sebelum masuk cache TanStack Query.

## Menguji jalur error

- **Asisten AI & laporan kesalahan**: centang "Simulasikan koneksi gagal" di halaman Asisten AI
  (bendera `simulasiGagal` di Zustand, ikut dikirim ke `POST /api/asisten` dan
  `POST /api/laporan` → server membalas **503**). Tampak `role="alert"` + tombol "Coba lagi";
  hilangkan centang lalu tekan "Coba lagi" untuk memulihkan.
- **Validasi form**: kirim login/laporan/edit konten kosong → galat per-field dengan
  `aria-invalid` + `aria-describedby`, galat umum `role="alert"`.
- **Proteksi rute**: buka `/beranda` tanpa masuk, atau `/admin` sebagai siswa.
- **Model 3D gagal**: ganti `file_model_3d` di `lib/data.ts` ke berkas yang tidak ada →
  halaman eksplorasi turun ke gambar dua dimensi dengan titik yang sama.
- **Error boundary**: lempar `Error` di salah satu halaman `(app)` → `error.tsx` dengan "Coba lagi".

## Aksesibilitas (dipertahankan dari versi vanilla)

Landmark + skip link; titik 3D sebagai `<button>` bernomor dengan `aria-label`/`aria-pressed`
dan daftar bagian alternatif di panel; toggle layer `aria-pressed` + region `aria-live`; label
dimmed `aria-expanded`/`aria-controls` sebagai akordeon di tempat; `Escape` menutup panel dan
mengembalikan fokus ke pemicu; modal `role="dialog"`, `aria-modal`, focus trap Tab/Shift+Tab,
Escape; tab admin `tablist/tab/tabpanel` + roving `tabindex` + panah/Home/End; galat
`role="alert"`; animasi dimatikan pada `prefers-reduced-motion: reduce`.

## Catatan aset

Model 3D dan seluruh render organ berasal dari **HuBMAP Human Reference Atlas (HRA)**,
3D Reference Organ Set (adult male), lisensi **CC BY 4.0**. `heart.glb` = jantung HRA +
pembuluh besar dari objek vaskulatur HRA; `lungs.glb` = paru + trakea + bronkus utama HRA;
keduanya digabung dan dikompresi Meshopt (1,4 MB dan 3,2 MB). Rincian objek, versi, dan
adaptasi ada di [`public/models/ATTRIBUTION.md`](public/models/ATTRIBUTION.md). Kredit juga
ditampilkan di footer aplikasi.

Keuntungan model HRA untuk pembelajaran: tiap struktur adalah **mesh bernama**
(`VH_M_left_cardiac_atrium`, `VH_M_trachea`, `VH_M_right_*_bronchopulmonary_segment`, ...).
Kolom `mesh_3d` pada `body_parts` memetakan bagian tubuh ke nama node itu, sehingga:

- titik interaktif ditambatkan ke permukaan mesh bagian itu sendiri (bagian di sisi belakang,
  mis. atrium kiri, tetap ditandai di tempat yang benar dan diredupkan sampai model diputar);
- saat dipilih, mesh bagian itu diberi tint biru dan mesh lain menjadi tembus pandang, sehingga
  struktur di dalam organ (katup mitral, cabang bronkus) ikut terlihat;
- `posisi_koordinat_3d` (format `"x,y,z"` SKPL) tetap ada sebagai cadangan bila nama node
  tidak ditemukan, dan `posisi_2d` dipakai gambar cadangan dua dimensi.

Fon Inter/Inter Tight (OFL) di-host sendiri lewat `next/font/local` (`src/app/fonts/`).
