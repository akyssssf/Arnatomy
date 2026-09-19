# ARnatomy — Next.js App Router

> **Catatan penamaan:** Modul praktikum menyebut `middleware.ts`, tapi Next.js 16
> (versi yang dipakai project ini) mengganti nama konvensi tersebut menjadi `proxy.ts`.
> Fungsinya identik — baca cookie sesi, cocokkan matcher, redirect sebelum halaman
> dirender. Lihat `src/proxy.ts`.

[![CI](https://github.com/akyssssf/Arnatomy/actions/workflows/ci.yml/badge.svg?branch=nextjs)](https://github.com/akyssssf/Arnatomy/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=akyssssf_Arnatomy&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=akyssssf_Arnatomy)

**Live (Vercel):** _tautan diisi setelah deploy_ · **Branch:** `nextjs` (versi vanilla Modul 1–4 ada di `main`)

Migrasi penuh prototipe front-end **ARnatomy** (pembelajaran anatomi berbasis AR untuk siswa
SMP–SMA, SKPL v1.0) dari versi vanilla HTML/JS ke arsitektur React modern. Organ tetap
ditampilkan sebagai model 3D interaktif (Three.js) karena kamera AR perangkat tidak diaktifkan
pada prototipe web.

## Peta 14 bab proyek akhir → implementasi

| Bab | Kompetensi | Di mana di repo ini |
|---|---|---|
| a | HTML5 semantik & WAI-ARIA | `header/nav/main/section/article/aside/footer`, skip link, `aria-pressed/expanded/controls`, `role=dialog/tablist`, focus management — lihat bagian Aksesibilitas |
| b | Tailwind CSS v4 zero-runtime | `src/app/globals.css` (`@import "tailwindcss"`, `@theme` token), `postcss.config.mjs` (`@tailwindcss/postcss`, Oxide engine), tanpa CSS-in-JS runtime |
| c | Headless UI: shadcn/ui, Radix, CVA | `components.json`, `src/components/ui/{dialog,tabs,checkbox}.tsx` di atas `@radix-ui/*`, `src/lib/utils.ts` (`cn`), varian type-safe di `src/lib/variants.ts` (`class-variance-authority`) |
| d | JS ES6+ & asinkron | `async/await` + `AbortController` di `src/lib/mock-api.ts`, ES Modules, destructuring/array methods di `src/lib/db.ts`, event delegation/closure aman di `PenampilOrgan.tsx` |
| e | Strict TypeScript & Zod | `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`), branded ID (`UserId`, `BagianId`, …), discriminated union (`StatusPenampil`, hasil `bacaBody`/`wajibSesi`), utility types (`OrganRingkas`, `KontenPatch`, `UserAman`), `z.infer` di `src/lib/schemas.ts` |
| f | React 19 + React Compiler | `next.config.ts` `reactCompiler: true`, tanpa `useMemo`/`useCallback` manual |
| g | Next.js App Router & RSC | `src/app/**` (RSC 70%), nested layout `(app)/layout.tsx`, `loading.tsx`, `error.tsx`, `<Suspense>` streaming, `src/proxy.ts` route guard, Metadata API + `generateMetadata` |
| h | Zustand vs TanStack Query | `src/store/useUIStore.ts` (UI state) · `src/hooks/*` (server state, `staleTime`/`gcTime`, `invalidateQueries`) |
| i | Build tools Rust/Go: Turbopack, Vite, Biome | Next 16 + Turbopack (`turbopack.root`), `vitest.config.mts` (Vite, alias `@/`), `biome.json` (lint + format) |
| j | Core Web Vitals | Lighthouse desktop 100/100/96/100 (LCP 0,7 s, CLS 0, TBT 10 ms) — laporan di `docs/lighthouse/`; WebP + `priority` + `fetchPriority="high"` + `sizes`, dimensi gambar eksplisit (CLS 0), Three.js ditunda setelah `load` + idle, `scheduler.yield()` di `src/three/viewer3d.ts` |
| k | Keamanan sisi klien & SonarQube | CSP ber-nonce per permintaan + header keamanan (`src/proxy.ts`, `next.config.ts`), cookie sesi HMAC-SHA256 (`src/lib/sesi-codec.ts`), isolasi env (`src/lib/env.ts`, `.env.example`), React auto-escape (XSS), `sonar-project.properties` + Quality Gate di CI |
| l | Integrasi API type-safe (BFF) | Route Handlers `src/app/api/*` sebagai BFF; body divalidasi Zod (`bacaBody`), respons divalidasi Zod di klien (`mock-api.ts`) |
| m | DevOps, Edge, CI/CD | `.github/workflows/ci.yml` (Biome → ESLint → tsc → Vitest+coverage → build → SonarCloud), deploy Vercel dari branch `nextjs` |

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Salin `.env.example` ke `.env.local` (di development ada nilai bawaan;
di produksi `SESSION_SECRET` wajib diisi). Tidak ada backend sungguhan: semua endpoint adalah
Route Handler mock dengan jeda buatan.

| Perintah | Fungsi |
|---|---|
| `npm run lint:biome` / `npm run format` | lint + format dengan Biome (Rust) |
| `npm run lint` | ESLint (aturan Next + React Compiler) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm test` / `npm run test:coverage` | Vitest (63 uji) + laporan coverage lcov untuk Sonar |
| `npm run build` | build produksi Next.js (Turbopack) |

### Akun demo

| Peran | Email | Kata sandi |
|---|---|---|
| Siswa | `siswa@arnatomy.id` | `siswa123` |
| Guru | `guru@arnatomy.id` | `guru123` |
| Administrator | `admin@arnatomy.id` | `admin123` |

## Struktur folder

```
arnatomy-next/
├── .github/workflows/ci.yml   pipeline CI/CD (lint → typecheck → test → build → Sonar)
├── biome.json · sonar-project.properties · vitest.config.mts · components.json · .env.example
├── docs/lighthouse/           laporan Lighthouse (bukti Core Web Vitals)
├── public/
│   ├── models/          heart.glb, lungs.glb (placeholder, lihat Catatan aset)
│   └── img/             render statis organ (webp transparan)
├── src/
│   ├── proxy.ts         proteksi rute (cookie sesi HMAC -> redirect) + CSP ber-nonce — Next 16: pengganti middleware.ts
│   ├── __tests__/       unit test Vitest (lib, store, hooks, route handler, proxy)
│   ├── test/            setup Vitest + stub server-only
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
│   │   │                DaftarFakta, ProgressBar, KartuStatistik (RSC) · dialog/tabs/checkbox (shadcn-style
│   │   │                di atas Radix), Modal, Toaster (klien)
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
│   │   ├── schemas.ts   skema Zod + z.infer semua entitas & form, branded ID, utility types
│   │   ├── env.ts       validasi variabel lingkungan (server vs NEXT_PUBLIC_)
│   │   ├── utils.ts     cn() (clsx + tailwind-merge)
│   │   ├── data.ts      seed data master (divalidasi Zod saat modul dimuat)
│   │   ├── db.ts        "basis data" mock di memori server (server-only, globalThis)
│   │   ├── mock-api.ts  fungsi fetch klien: timeout, galat terbaca, respons diparse Zod
│   │   ├── auth.ts      ambilSesi() dari cookie (server-only)
│   │   ├── sesi-codec.ts enkode/dekode cookie bertanda tangan HMAC (dipakai proxy + server)
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

## Autentikasi, keamanan sisi klien & proteksi rute

- `POST /api/login` memeriksa akun demo lalu menyetel cookie **httpOnly, SameSite=Lax**
  `arnatomy_sesi` berisi JSON pengguna (tanpa password) yang **ditandatangani HMAC-SHA256**
  dengan `SESSION_SECRET` (Web Crypto, `src/lib/sesi-codec.ts`); cookie yang diubah gagal
  verifikasi dan diperlakukan seperti tidak ada. Prototipe, bukan sesi produksi.
- **CSP ber-nonce per permintaan** (`script-src 'nonce-…' 'strict-dynamic'`, `object-src 'none'`,
  `frame-ancestors 'none'`) dipasang `src/proxy.ts` dan diteruskan ke Next lewat header `x-nonce`;
  header `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`,
  `HSTS` dari `next.config.ts`. XSS: React meng-escape semua teks; tidak ada `dangerouslySetInnerHTML`.
- **Isolasi env**: `src/lib/env.ts` memvalidasi `SESSION_SECRET` (server, tanpa awalan
  `NEXT_PUBLIC_`) dan `NEXT_PUBLIC_APP_NAME` (publik) dengan Zod; modul server memakai `server-only`.
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

## Kualitas kode, pengujian & CI/CD

- **Unit test (Vitest, jsdom/node):** `src/__tests__/` — skema Zod, seed data, codec sesi HMAC, env,
  basis data mock, penyusun jawaban, format, varian CVA, `mock-api` (fetch + timeout + validasi),
  Zustand store, empat hook TanStack Query (query + mutasi + invalidasi), seluruh Route Handler,
  dan `proxy.ts` (redirect + CSP). Coverage pada kode yang diuji ≈ 97% statements / 99% lines
  (`npm run test:coverage`). Komponen presentasional dan penampil WebGL diverifikasi di browser
  dan dikecualikan dari perhitungan coverage (`sonar.coverage.exclusions`).
- **Pipeline** `.github/workflows/ci.yml`: Biome → ESLint → `tsc` → Vitest + coverage → `next build`
  → SonarCloud scan + Quality Gate (0 vulnerability, 0 hotspot, coverage ≥ 80%, duplikasi ≤ 3%).
- **SonarCloud:** buat proyek di sonarcloud.io (organization `akyssssf`, key `akyssssf_Arnatomy`,
  sesuaikan `sonar-project.properties` bila berbeda), lalu tambahkan secret `SONAR_TOKEN` di
  GitHub → langkah Sonar aktif otomatis pada push berikutnya.
- **Deploy Vercel:** import repo di vercel.com → Production Branch `nextjs` → Environment Variable
  `SESSION_SECRET` (≥ 32 karakter acak) → Deploy. Tulis URL-nya di bagian atas README ini.

## Core Web Vitals

Lighthouse 13 (Brave headless) pada build produksi lokal, halaman landing — laporan lengkap di
`docs/lighthouse/`:

| Profil | Performance | A11y | Best Practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Desktop | 100 | 100 | 96 | 100 | 0,7 s | 10 ms | 0 |
| Mobile (simulasi slow 4G, CPU 4×) | 91 | 100 | 96 | 100 | 3,2 s* | 150 ms | 0 |

\* LCP *terobservasi* di mobile 0,08 s; angka 3,2 s adalah estimasi simulasi Lighthouse pada
server lokal yang terlalu cepat (semua aset selesai sebelum LCP sehingga dianggap dependensi).
Ukur ulang dengan PageSpeed Insights pada URL Vercel untuk angka lapangan.

Teknik yang dipakai: gambar WebP dengan `priority`, `fetchPriority="high"`, `sizes`, dan dimensi
eksplisit (CLS 0); fon lokal `next/font` dengan `size-adjust` fallback; Three.js diimpor dinamis
**setelah `load` + idle** sehingga tidak membebani TBT/LCP; pekerjaan berat penampil dipecah dengan
`scheduler.yield()`; animasi lipatan atas hanya `transform` (bukan `opacity`) agar kandidat LCP
tercatat pada paint pertama; TanStack Query hanya dimuat di segmen `(app)`.

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
